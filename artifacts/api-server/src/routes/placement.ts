import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import {
  currentUser,
  iso,
  page,
  pageParams,
  requireUser,
  roleAllowed,
  tokenFor,
  type AuthUser,
} from "../lib/auth";

const router: IRouter = Router();

const bad = (res: Response, message: string, status = 400): void => {
  res.status(status).json({ message });
};

function userDto(row: Record<string, any>) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: iso(row.created_at),
  };
}

async function studentDto(studentId: number) {
  const result = await pool.query(
    `select s.*, u.id as user_id, u.email, u.first_name, u.last_name
     from students s join users u on u.id = s.user_id where s.id = $1`,
    [studentId],
  );
  const s = result.rows[0];
  if (!s) return null;
  const [skills, education, projects, certifications] = await Promise.all([
    pool.query("select id, name, level from skills where student_id = $1 order by id", [studentId]),
    pool.query("select id, institution, degree, field_of_study, start_year, end_year, grade, is_current from education where student_id = $1 order by start_year desc", [studentId]),
    pool.query("select id, title, description, tech_stack, project_url, github_url, start_date, end_date from projects where student_id = $1 order by id desc", [studentId]),
    pool.query("select id, name, issuing_organization, issue_date, expiry_date, credential_id, credential_url from certifications where student_id = $1 order by issue_date desc", [studentId]),
  ]);
  return {
    id: s.id, userId: s.user_id, firstName: s.first_name, lastName: s.last_name, email: s.email,
    rollNumber: s.roll_number, branch: s.branch, year: s.year, cgpa: s.cgpa == null ? null : Number(s.cgpa),
    phone: s.phone, address: s.address, photoUrl: s.photo_url, resumeUrl: s.resume_url,
    linkedinUrl: s.linkedin_url, githubUrl: s.github_url, portfolioUrl: s.portfolio_url, about: s.about,
    placementStatus: s.placement_status, skills: skills.rows, education: education.rows.map((e) => ({
      id: e.id, institution: e.institution, degree: e.degree, fieldOfStudy: e.field_of_study,
      startYear: e.start_year, endYear: e.end_year, grade: e.grade, isCurrent: e.is_current,
    })), projects: projects.rows.map((p) => ({
      id: p.id, title: p.title, description: p.description, techStack: p.tech_stack,
      projectUrl: p.project_url, githubUrl: p.github_url, startDate: p.start_date, endDate: p.end_date,
    })), certifications: certifications.rows.map((c) => ({
      id: c.id, name: c.name, issuingOrganization: c.issuing_organization, issueDate: c.issue_date,
      expiryDate: c.expiry_date, credentialId: c.credential_id, credentialUrl: c.credential_url,
    })), createdAt: iso(s.created_at),
  };
}

function companyDto(c: Record<string, any>) {
  return {
    id: c.id, name: c.name, sector: c.sector, website: c.website, description: c.description,
    logoUrl: c.logo_url, location: c.location, employeeCount: c.employee_count,
    foundedYear: c.founded_year, createdAt: iso(c.created_at),
  };
}

function driveDto(d: Record<string, any>) {
  return {
    id: d.id, title: d.title, companyId: d.company_id, company: d.company_id ? companyDto(d) : undefined,
    jobRole: d.job_role, jobDescription: d.job_description, ctc: d.ctc, location: d.location,
    jobType: d.job_type, driveDate: d.drive_date, lastApplyDate: d.last_apply_date, status: d.status,
    eligibilityCgpa: d.eligibility_cgpa == null ? null : Number(d.eligibility_cgpa),
    eligibilityBranches: d.eligibility_branches, eligibilityYear: d.eligibility_year,
    totalApplicants: Number(d.total_applicants ?? 0), totalSelected: Number(d.total_selected ?? 0),
    createdAt: iso(d.created_at),
  };
}

function recruiterDto(r: Record<string, any>) {
  return {
    id: r.id, userId: r.user_id, firstName: r.first_name, lastName: r.last_name, email: r.email,
    companyName: r.company_name, designation: r.designation, phone: r.phone,
    linkedinUrl: r.linkedin_url, photoUrl: r.photo_url, isVerified: r.is_verified, createdAt: iso(r.created_at),
  };
}

async function applicationDto(a: Record<string, any>) {
  const student = a.student_id ? await studentDto(Number(a.student_id)) : undefined;
  return {
    id: a.id, studentId: a.student_id, driveId: a.drive_id, student,
    drive: a.drive_id ? driveDto(a) : undefined, status: a.status, appliedAt: iso(a.applied_at),
    updatedAt: iso(a.updated_at), interviewDate: iso(a.interview_date),
    interviewLink: a.interview_link, feedback: a.feedback,
  };
}

function access(user: AuthUser | null, roles: AuthUser["role"][], res: Response): boolean {
  if (!roleAllowed(user, roles)) {
    bad(res, "Access denied", user ? 403 : 401);
    return false;
  }
  return true;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") return bad(res, "Email and password are required");
  const result = await pool.query("select * from users where lower(email) = lower($1)", [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return bad(res, "Invalid email or password", 401);
  if (!user.is_active) return bad(res, "Account is inactive. Please contact the placement office.", 403);
  res.json({ token: tokenFor({ id: user.id, email: user.email, role: user.role }), user: userDto(user) });
});

router.post("/auth/register/student", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName, rollNumber, branch, year, phone } = req.body ?? {};
  if (!email || !password || !firstName || !lastName || !rollNumber || !branch || !year) return bad(res, "Required registration fields are missing");
  const client = await pool.connect();
  try {
    await client.query("begin");
    const exists = await client.query("select 1 from users where lower(email) = lower($1) union select 1 from students where roll_number = $2", [email, rollNumber]);
    if (exists.rows[0]) { await client.query("rollback"); return bad(res, "Email or roll number already registered", 409); }
    const u = (await client.query(
      "insert into users(email,password_hash,first_name,last_name,role,is_active) values($1,$2,$3,$4,'STUDENT',true) returning *",
      [email, await bcrypt.hash(password, 10), firstName, lastName],
    )).rows[0];
    await client.query("insert into students(user_id,roll_number,branch,year,phone,placement_status) values($1,$2,$3,$4,$5,'NOT_PLACED')", [u.id, rollNumber, branch, year, phone ?? null]);
    await client.query("commit");
    res.status(201).json({ token: tokenFor({ id: u.id, email: u.email, role: u.role }), user: userDto(u) });
  } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
});

router.post("/auth/register/recruiter", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName, companyName, designation, phone } = req.body ?? {};
  if (!email || !password || !firstName || !lastName || !companyName || !designation) return bad(res, "Required registration fields are missing");
  const client = await pool.connect();
  try {
    await client.query("begin");
    if ((await client.query("select 1 from users where lower(email) = lower($1)", [email])).rows[0]) { await client.query("rollback"); return bad(res, "Email already registered", 409); }
    const u = (await client.query(
      "insert into users(email,password_hash,first_name,last_name,role,is_active) values($1,$2,$3,$4,'RECRUITER',true) returning *",
      [email, await bcrypt.hash(password, 10), firstName, lastName],
    )).rows[0];
    await client.query("insert into recruiters(user_id,company_name,designation,phone,is_verified) values($1,$2,$3,$4,false)", [u.id, companyName, designation, phone ?? null]);
    await client.query("commit");
    res.status(201).json({ token: tokenFor({ id: u.id, email: u.email, role: u.role }), user: userDto(u) });
  } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const email = req.body?.email;
  if (email) await pool.query("update users set reset_token = $1, reset_token_expires = now() + interval '1 hour' where lower(email) = lower($2)", [randomUUID(), email]);
  res.json({ message: "If your email is registered, you will receive a password reset link" });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body ?? {};
  const result = await pool.query("select id from users where reset_token = $1 and reset_token_expires > now()", [token]);
  if (!result.rows[0]) return bad(res, "Invalid or expired reset token");
  await pool.query("update users set password_hash = $1, reset_token = null, reset_token_expires = null where id = $2", [await bcrypt.hash(password, 10), result.rows[0].id]);
  res.json({ message: "Password reset successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const result = await pool.query("select * from users where id = $1", [user.id]);
  res.json(userDto(result.rows[0]));
});

router.get("/students/profile", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const row = await pool.query("select id from students where user_id = $1", [user.id]);
  if (!row.rows[0]) return bad(res, "Student profile not found", 404);
  res.json(await studentDto(row.rows[0].id));
});

router.put("/students/profile", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const b = req.body ?? {};
  const result = await pool.query(
    `update users set first_name = coalesce($1, first_name), last_name = coalesce($2, last_name)
     where id = $3 returning id as user_id`,
    [b.firstName ?? null, b.lastName ?? null, user.id],
  );
  const student = await pool.query("select id from students where user_id = $1", [user.id]);
  if (!result.rows[0] || !student.rows[0]) return bad(res, "Student profile not found", 404);
  await pool.query(
    `update students set phone=coalesce($1,phone), address=coalesce($2,address), cgpa=coalesce($3,cgpa),
     branch=coalesce($4,branch), year=coalesce($5,year), linkedin_url=coalesce($6,linkedin_url),
     github_url=coalesce($7,github_url), portfolio_url=coalesce($8,portfolio_url), about=coalesce($9,about)
     where id=$10`,
    [b.phone ?? null, b.address ?? null, b.cgpa ?? null, b.branch ?? null, b.year ?? null, b.linkedinUrl ?? null, b.githubUrl ?? null, b.portfolioUrl ?? null, b.about ?? null, student.rows[0].id],
  );
  res.json(await studentDto(student.rows[0].id));
});

router.patch("/students/profile/photo", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  await pool.query("update students set photo_url=$1 where user_id=$2", [req.body?.url, user.id]);
  res.json({ url: req.body?.url, publicId: req.body?.publicId ?? "" });
});

router.patch("/students/profile/resume", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  await pool.query("update students set resume_url=$1,resume_public_id=$2 where user_id=$3", [req.body?.url, req.body?.publicId ?? null, user.id]);
  res.json({ url: req.body?.url, publicId: req.body?.publicId ?? "" });
});

router.get("/students", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const { page: p, size, offset } = pageParams(req.query as Record<string, unknown>);
  const { search, branch, status } = req.query;
  const values: unknown[] = []; const filters: string[] = [];
  if (search) { values.push(`%${search}%`); filters.push(`(u.first_name ilike $${values.length} or u.last_name ilike $${values.length} or s.roll_number ilike $${values.length})`); }
  if (branch) { values.push(branch); filters.push(`s.branch = $${values.length}`); }
  if (status) { values.push(status); filters.push(`s.placement_status = $${values.length}`); }
  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const count = await pool.query(`select count(*)::int as count from students s join users u on u.id=s.user_id ${where}`, values);
  values.push(size, offset);
  const rows = await pool.query(`select s.*,u.email,u.first_name,u.last_name from students s join users u on u.id=s.user_id ${where} order by s.id desc limit $${values.length - 1} offset $${values.length}`, values);
  res.json(page(rows.rows.map((s) => ({
    id: s.id, userId: s.user_id, firstName: s.first_name, lastName: s.last_name, email: s.email,
    rollNumber: s.roll_number, branch: s.branch, year: s.year, cgpa: s.cgpa == null ? null : Number(s.cgpa),
    placementStatus: s.placement_status, phone: s.phone, address: s.address, createdAt: iso(s.created_at),
  })), Number(count.rows[0].count), p, size));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const result = await studentDto(Number(req.params.id)); if (!result) return bad(res, "Student not found", 404); res.json(result);
});

router.put("/students/:id", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const id = Number(req.params.id); const b = req.body ?? {};
  const row = await pool.query("select user_id from students where id=$1", [id]); if (!row.rows[0]) return bad(res, "Student not found", 404);
  await pool.query("update users set first_name=coalesce($1,first_name),last_name=coalesce($2,last_name) where id=$3", [b.firstName ?? null, b.lastName ?? null, row.rows[0].user_id]);
  await pool.query("update students set phone=coalesce($1,phone),placement_status=coalesce($2,placement_status) where id=$3", [b.phone ?? null, b.placementStatus ?? null, id]);
  res.json(await studentDto(id));
});

router.get("/companies", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER", "STUDENT", "RECRUITER"], res)) return;
  const { page: p, size, offset } = pageParams(req.query as Record<string, unknown>);
  const values: unknown[] = []; const filters: string[] = [];
  if (req.query.search) { values.push(`%${req.query.search}%`); filters.push(`(name ilike $${values.length} or sector ilike $${values.length})`); }
  if (req.query.sector) { values.push(req.query.sector); filters.push(`sector = $${values.length}`); }
  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const count = await pool.query(`select count(*)::int as count from companies ${where}`, values);
  values.push(size, offset);
  const rows = await pool.query(`select * from companies ${where} order by id desc limit $${values.length - 1} offset $${values.length}`, values);
  res.json(page(rows.rows.map(companyDto), Number(count.rows[0].count), p, size));
});

router.get("/companies/:id", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const row = await pool.query("select * from companies where id=$1", [Number(req.params.id)]); if (!row.rows[0]) return bad(res, "Company not found", 404); res.json(companyDto(row.rows[0]));
});

router.post("/companies", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const b = req.body ?? {}; if (!b.name || !b.sector) return bad(res, "Name and sector are required");
  const row = await pool.query("insert into companies(name,sector,website,description,logo_url,location,employee_count,founded_year,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *", [b.name,b.sector,b.website??null,b.description??null,b.logoUrl??null,b.location??null,b.employeeCount??null,b.foundedYear??null,user?.id]);
  res.status(201).json(companyDto(row.rows[0]));
});

router.put("/companies/:id", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const b = req.body ?? {}; const row = await pool.query("update companies set name=coalesce($1,name),sector=coalesce($2,sector),website=coalesce($3,website),description=coalesce($4,description),location=coalesce($5,location),employee_count=coalesce($6,employee_count) where id=$7 returning *", [b.name??null,b.sector??null,b.website??null,b.description??null,b.location??null,b.employeeCount??null,Number(req.params.id)]);
  if (!row.rows[0]) return bad(res, "Company not found", 404); res.json(companyDto(row.rows[0]));
});

router.delete("/companies/:id", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER"], res)) return;
  const row = await pool.query("delete from companies where id=$1 returning id", [Number(req.params.id)]); if (!row.rows[0]) return bad(res, "Company not found", 404); res.json({ message: "Company deleted" });
});

router.get("/drives", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const { page: p, size, offset } = pageParams(req.query as Record<string, unknown>);
  const values: unknown[] = []; const filters: string[] = [];
  if (req.query.search) { values.push(`%${req.query.search}%`); filters.push(`(d.title ilike $${values.length} or d.job_role ilike $${values.length} or c.name ilike $${values.length})`); }
  if (req.query.status) { values.push(req.query.status); filters.push(`d.status = $${values.length}`); }
  if (req.query.companyId) { values.push(Number(req.query.companyId)); filters.push(`d.company_id = $${values.length}`); }
  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const count = await pool.query(`select count(*)::int as count from placement_drives d join companies c on c.id=d.company_id ${where}`, values);
  values.push(size, offset);
  const rows = await pool.query(`select d.*,c.name,c.sector,c.website,c.description,c.logo_url,c.location,c.employee_count,c.founded_year, (select count(*) from applications a where a.drive_id=d.id) as total_applicants, (select count(*) from applications a where a.drive_id=d.id and a.status='SELECTED') as total_selected from placement_drives d join companies c on c.id=d.company_id ${where} order by d.drive_date asc limit $${values.length - 1} offset $${values.length}`, values);
  res.json(page(rows.rows.map(driveDto), Number(count.rows[0].count), p, size));
});

router.get("/drives/:id", async (req, res): Promise<void> => {
  const user = await requireUser(req, res); if (!user) return;
  const row = await pool.query("select d.*,c.name,c.sector,c.website,c.description,c.logo_url,c.location,c.employee_count,c.founded_year,(select count(*) from applications a where a.drive_id=d.id) as total_applicants from placement_drives d join companies c on c.id=d.company_id where d.id=$1", [Number(req.params.id)]);
  if (!row.rows[0]) return bad(res, "Drive not found", 404); res.json(driveDto(row.rows[0]));
});

router.post("/drives", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER", "RECRUITER"], res)) return;
  const b=req.body??{}; if(!b.title||!b.companyId||!b.jobRole||!b.driveDate) return bad(res,"Required drive fields are missing");
  const row=await pool.query("insert into placement_drives(title,company_id,job_role,job_description,ctc,location,job_type,drive_date,last_apply_date,status,eligibility_cgpa,eligibility_branches,eligibility_year,created_by) values($1,$2,$3,$4,$5,$6,$7,$8::date,$9::date,$10,$11,$12,$13,$14) returning id",[b.title,b.companyId,b.jobRole,b.jobDescription??null,b.ctc??null,b.location??null,b.jobType??"FULL_TIME",String(b.driveDate).slice(0,10),b.lastApplyDate?String(b.lastApplyDate).slice(0,10):null,b.status??"UPCOMING",b.eligibilityCgpa??null,b.eligibilityBranches??null,b.eligibilityYear??null,user?.id]);
  const created=await pool.query("select d.*,c.name,c.sector,c.website,c.description,c.logo_url,c.location,c.employee_count,c.founded_year from placement_drives d join companies c on c.id=d.company_id where d.id=$1",[row.rows[0].id]); res.status(201).json(driveDto(created.rows[0]));
});

router.put("/drives/:id", async (req, res): Promise<void> => {
  const user = currentUser(req); if (!access(user, ["PLACEMENT_OFFICER", "RECRUITER"], res)) return;
  const b=req.body??{}; const row=await pool.query("update placement_drives set title=coalesce($1,title),company_id=coalesce($2,company_id),job_role=coalesce($3,job_role),job_description=coalesce($4,job_description),ctc=coalesce($5,ctc),location=coalesce($6,location),job_type=coalesce($7,job_type),drive_date=coalesce($8::date,drive_date),last_apply_date=coalesce($9::date,last_apply_date),status=coalesce($10,status),eligibility_cgpa=coalesce($11,eligibility_cgpa),eligibility_branches=coalesce($12,eligibility_branches),eligibility_year=coalesce($13,eligibility_year) where id=$14 returning id",[b.title??null,b.companyId??null,b.jobRole??null,b.jobDescription??null,b.ctc??null,b.location??null,b.jobType??null,b.driveDate?String(b.driveDate).slice(0,10):null,b.lastApplyDate?String(b.lastApplyDate).slice(0,10):null,b.status??null,b.eligibilityCgpa??null,b.eligibilityBranches??null,b.eligibilityYear??null,Number(req.params.id)]); if(!row.rows[0]) return bad(res,"Drive not found",404); const full=await pool.query("select d.*,c.name,c.sector,c.website,c.description,c.logo_url,c.location,c.employee_count,c.founded_year from placement_drives d join companies c on c.id=d.company_id where d.id=$1",[row.rows[0].id]); res.json(driveDto(full.rows[0]));
});

router.delete("/drives/:id", async (req, res): Promise<void> => { const user=currentUser(req); if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res)) return; const row=await pool.query("delete from placement_drives where id=$1 returning id",[Number(req.params.id)]); if(!row.rows[0]) return bad(res,"Drive not found",404); res.json({message:"Drive deleted"}); });

router.get("/drives/:id/applicants", async (req, res): Promise<void> => {
  const user=await requireUser(req,res); if(!user) return; const id=Number(req.params.id);
  const rows=await pool.query("select a.*,s.roll_number,s.branch,s.year,s.cgpa,s.phone,s.address,s.photo_url,s.resume_url,s.linkedin_url,s.github_url,s.portfolio_url,s.about,u.email,u.first_name,u.last_name,d.title,d.company_id,d.job_role,d.job_description,d.ctc,d.location,d.job_type,d.drive_date,d.last_apply_date,d.status as drive_status,c.name,c.sector,c.website,c.description,c.logo_url,c.location as company_location,c.employee_count,c.founded_year from applications a join students s on s.id=a.student_id join users u on u.id=s.user_id join placement_drives d on d.id=a.drive_id join companies c on c.id=d.company_id where a.drive_id=$1 order by a.applied_at desc",[id]);
  const content=await Promise.all(rows.rows.map((r)=>applicationDto({...r,drive_id:r.drive_id,status:r.status,company_id:r.company_id,drive_status:r.drive_status,location:r.location,created_at:r.created_at}))); res.json(page(content,content.length,0,content.length||10));
});

router.get("/applications", async (req, res): Promise<void> => {
  const user=await requireUser(req,res); if(!user) return; const student=await pool.query("select id from students where user_id=$1",[user.id]); if(!student.rows[0]) return bad(res,"Student profile not found",404);
  const rows=await pool.query("select a.*,d.title,d.company_id,d.job_role,d.job_description,d.ctc,d.location,d.job_type,d.drive_date,d.last_apply_date,d.status as drive_status,c.name,c.sector,c.website,c.description,c.logo_url,c.location as company_location,c.employee_count,c.founded_year from applications a join placement_drives d on d.id=a.drive_id join companies c on c.id=d.company_id where a.student_id=$1 order by a.applied_at desc",[student.rows[0].id]);
  res.json(await Promise.all(rows.rows.map((r)=>applicationDto({...r,drive_id:r.drive_id,status:r.status,company_id:r.company_id,drive_status:r.drive_status,location:r.location}))));
});

router.post("/applications", async (req, res): Promise<void> => {
  const user=await requireUser(req,res); if(!user) return; const student=await pool.query("select id from students where user_id=$1",[user.id]); if(!student.rows[0]) return bad(res,"Student profile not found",404);
  const driveId=Number(req.body?.driveId); if(!driveId) return bad(res,"driveId is required");
  try { const row=await pool.query("insert into applications(student_id,drive_id,status) values($1,$2,'APPLIED') returning id",[student.rows[0].id,driveId]); const full=await pool.query("select a.*,d.title,d.company_id,d.job_role,d.job_description,d.ctc,d.location,d.job_type,d.drive_date,d.last_apply_date,d.status as drive_status,c.name,c.sector,c.website,c.description,c.logo_url,c.location as company_location from applications a join placement_drives d on d.id=a.drive_id join companies c on c.id=d.company_id where a.id=$1",[row.rows[0].id]); res.status(201).json(await applicationDto({...full.rows[0],drive_id:full.rows[0].drive_id,status:full.rows[0].status,company_id:full.rows[0].company_id,drive_status:full.rows[0].drive_status})); } catch { bad(res,"Already applied to this drive",409); }
});

router.delete("/applications/:id", async (req, res): Promise<void> => { const user=await requireUser(req,res); if(!user) return; const row=await pool.query("delete from applications a using students s where a.id=$1 and a.student_id=s.id and s.user_id=$2 returning a.id",[Number(req.params.id),user.id]); if(!row.rows[0]) return bad(res,"Application not found",404); res.json({message:"Application withdrawn"}); });

router.patch("/applications/:id/status", async (req, res): Promise<void> => { const user=currentUser(req); if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res)) return; const b=req.body??{}; const row=await pool.query("update applications set status=coalesce($1,status),interview_date=coalesce($2::timestamp,interview_date),interview_link=coalesce($3,interview_link),feedback=coalesce($4,feedback) where id=$5 returning *",[b.status??null,b.interviewDate??null,b.interviewLink??null,b.feedback??null,Number(req.params.id)]); if(!row.rows[0]) return bad(res,"Application not found",404); res.json(await applicationDto(row.rows[0])); });

router.get("/notifications", async (req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const rows=await pool.query("select id,title,message,type,is_read,link,created_at from notifications where user_id=$1 order by created_at desc",[user.id]);res.json(rows.rows.map(n=>({id:n.id,title:n.title,message:n.message,type:n.type,isRead:n.is_read,link:n.link,createdAt:iso(n.created_at)})));});
router.patch("/notifications/:id/read", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;await pool.query("update notifications set is_read=true where id=$1 and user_id=$2",[Number(req.params.id),user.id]);res.json({message:"Marked as read"});});
router.patch("/notifications/read-all", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;await pool.query("update notifications set is_read=true where user_id=$1",[user.id]);res.json({message:"All notifications marked as read"});});

router.get("/analytics/overview", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const r=await pool.query("select (select count(*) from students)::int total_students,(select count(*) from students where placement_status='PLACED')::int placed_students,(select count(*) from placement_drives where status in ('UPCOMING','ONGOING'))::int active_drives,(select count(*) from companies)::int total_companies,(select count(*) from applications)::int total_applications,(select count(*) from recruiters)::int total_recruiters");const x=r.rows[0];res.json({totalStudents:x.total_students,placedStudents:x.placed_students,activeDrives:x.active_drives,totalCompanies:x.total_companies,totalApplications:x.total_applications,totalRecruiters:x.total_recruiters,placementRate:x.total_students?Number(((x.placed_students/x.total_students)*100).toFixed(1)):0,averageCTC:null});});
router.get("/analytics/placements-by-company", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const r=await pool.query("select c.name as company_name,count(*)::int as count,c.sector from applications a join placement_drives d on d.id=a.drive_id join companies c on c.id=d.company_id where a.status='SELECTED' group by c.name,c.sector order by count desc");res.json(r.rows.map(x=>({companyName:x.company_name,count:x.count,sector:x.sector})));});
router.get("/analytics/applications-trend", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const r=await pool.query("select to_char(date_trunc('month',applied_at),'Mon YYYY') as month,count(*)::int as count from applications group by date_trunc('month',applied_at) order by date_trunc('month',applied_at)");res.json(r.rows);});
router.get("/analytics/application-status-breakdown", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const r=await pool.query("select status,count(*)::int as count from applications group by status order by status");res.json(r.rows);});

router.get("/admin/users", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER"],res))return;const {page:p,size,offset}=pageParams(req.query as Record<string,unknown>);const vals:unknown[]=[];const f:string[]=[];if(req.query.role){vals.push(req.query.role);f.push(`role=$${vals.length}`);}if(req.query.search){vals.push(`%${req.query.search}%`);f.push(`(email ilike $${vals.length} or first_name ilike $${vals.length} or last_name ilike $${vals.length})`);}const where=f.length?`where ${f.join(" and ")}`:"";const c=await pool.query(`select count(*)::int count from users ${where}`,vals);vals.push(size,offset);const rows=await pool.query(`select * from users ${where} order by id limit $${vals.length-1} offset $${vals.length}`,vals);res.json(page(rows.rows.map(userDto),Number(c.rows[0].count),p,size));});
router.patch("/admin/users/:id/status", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER"],res))return;const r=await pool.query("update users set is_active=$1 where id=$2 returning *",[Boolean(req.body?.isActive),Number(req.params.id)]);if(!r.rows[0])return bad(res,"User not found",404);res.json(userDto(r.rows[0]));});

router.get("/recruiters/profile", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("select r.*,u.id user_id,u.email,u.first_name,u.last_name from recruiters r join users u on u.id=r.user_id where r.user_id=$1",[user.id]);if(!r.rows[0])return bad(res,"Recruiter profile not found",404);res.json(recruiterDto(r.rows[0]));});
router.put("/recruiters/profile", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const b=req.body??{};await pool.query("update users set first_name=coalesce($1,first_name),last_name=coalesce($2,last_name) where id=$3",[b.firstName??null,b.lastName??null,user.id]);const r=await pool.query("update recruiters set designation=coalesce($1,designation),phone=coalesce($2,phone),linkedin_url=coalesce($3,linkedin_url) where user_id=$4 returning id",[b.designation??null,b.phone??null,b.linkedinUrl??null,user.id]);if(!r.rows[0])return bad(res,"Recruiter profile not found",404);const full=await pool.query("select r.*,u.id user_id,u.email,u.first_name,u.last_name from recruiters r join users u on u.id=r.user_id where r.user_id=$1",[user.id]);res.json(recruiterDto(full.rows[0]));});
router.get("/recruiters", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const {page:p,size,offset}=pageParams(req.query as Record<string,unknown>);const c=await pool.query("select count(*)::int count from recruiters");const rows=await pool.query("select r.*,u.id user_id,u.email,u.first_name,u.last_name from recruiters r join users u on u.id=r.user_id order by r.id limit $1 offset $2",[size,offset]);res.json(page(rows.rows.map(recruiterDto),Number(c.rows[0].count),p,size));});
router.patch("/recruiters/:id/shortlist", async(req,res):Promise<void>=>{const user=currentUser(req);if(!access(user,["PLACEMENT_OFFICER","RECRUITER"],res))return;const b=req.body??{};const r=await pool.query("update applications set status=$1,feedback=coalesce($2,feedback) where id=$3 returning *",[b.status,b.feedback??null,Number(req.params.id)]);if(!r.rows[0])return bad(res,"Application not found",404);res.json(await applicationDto(r.rows[0]));});

async function studentOwned(req: Request, id: number) {
  const user = currentUser(req); if (!user) return null;
  const r = await pool.query("select s.id from students s where s.user_id=$1", [user.id]);
  return r.rows[0]?.id === id ? id : null;
}

router.get("/skills", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const s=await pool.query("select id from students where user_id=$1",[user.id]);if(!s.rows[0])return bad(res,"Student profile not found",404);const r=await pool.query("select id,name,level from skills where student_id=$1 order by id",[s.rows[0].id]);res.json(r.rows);});
router.post("/skills", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const s=await pool.query("select id from students where user_id=$1",[user.id]);if(!s.rows[0])return bad(res,"Student profile not found",404);const r=await pool.query("insert into skills(student_id,name,level) values($1,$2,$3) returning id,name,level",[s.rows[0].id,req.body?.name,req.body?.level]);res.status(201).json(r.rows[0]);});
router.delete("/skills/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("delete from skills x using students s where x.id=$1 and x.student_id=s.id and s.user_id=$2 returning x.id",[Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Skill not found",404);res.json({message:"Skill deleted"});});

router.get("/education", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("select e.id,institution,degree,field_of_study,start_year,end_year,grade,is_current from education e join students s on s.id=e.student_id where s.user_id=$1 order by start_year desc",[user.id]);res.json(r.rows.map(e=>({id:e.id,institution:e.institution,degree:e.degree,fieldOfStudy:e.field_of_study,startYear:e.start_year,endYear:e.end_year,grade:e.grade,isCurrent:e.is_current})));});
router.post("/education", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const s=await pool.query("select id from students where user_id=$1",[user.id]);const b=req.body??{};const r=await pool.query("insert into education(student_id,institution,degree,field_of_study,start_year,end_year,grade,is_current) values($1,$2,$3,$4,$5,$6,$7,$8) returning id,institution,degree,field_of_study,start_year,end_year,grade,is_current",[s.rows[0].id,b.institution,b.degree,b.fieldOfStudy,b.startYear,b.endYear??null,b.grade??null,b.isCurrent??false]);const e=r.rows[0];res.status(201).json({id:e.id,institution:e.institution,degree:e.degree,fieldOfStudy:e.field_of_study,startYear:e.start_year,endYear:e.end_year,grade:e.grade,isCurrent:e.is_current});});
router.put("/education/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const b=req.body??{};const r=await pool.query("update education e set institution=coalesce($1,institution),degree=coalesce($2,degree),field_of_study=coalesce($3,field_of_study),start_year=coalesce($4,start_year),end_year=coalesce($5,end_year),grade=coalesce($6,grade),is_current=coalesce($7,is_current) from students s where e.id=$8 and e.student_id=s.id and s.user_id=$9 returning e.id,e.institution,e.degree,e.field_of_study,e.start_year,e.end_year,e.grade,e.is_current",[b.institution??null,b.degree??null,b.fieldOfStudy??null,b.startYear??null,b.endYear??null,b.grade??null,b.isCurrent??null,Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Education not found",404);const e=r.rows[0];res.json({id:e.id,institution:e.institution,degree:e.degree,fieldOfStudy:e.field_of_study,startYear:e.start_year,endYear:e.end_year,grade:e.grade,isCurrent:e.is_current});});
router.delete("/education/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("delete from education e using students s where e.id=$1 and e.student_id=s.id and s.user_id=$2 returning e.id",[Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Education not found",404);res.json({message:"Education deleted"});});

router.get("/projects", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("select p.id,p.title,p.description,p.tech_stack,p.project_url,p.github_url,p.start_date,p.end_date from projects p join students s on s.id=p.student_id where s.user_id=$1 order by p.id desc",[user.id]);res.json(r.rows.map(p=>({id:p.id,title:p.title,description:p.description,techStack:p.tech_stack,projectUrl:p.project_url,githubUrl:p.github_url,startDate:p.start_date,endDate:p.end_date})));});
router.post("/projects", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const s=await pool.query("select id from students where user_id=$1",[user.id]);const b=req.body??{};const r=await pool.query("insert into projects(student_id,title,description,tech_stack,project_url,github_url,start_date,end_date) values($1,$2,$3,$4,$5,$6,$7::date,$8::date) returning id,title,description,tech_stack,project_url,github_url,start_date,end_date",[s.rows[0].id,b.title,b.description,b.techStack??null,b.projectUrl??null,b.githubUrl??null,b.startDate??null,b.endDate??null]);const p=r.rows[0];res.status(201).json({id:p.id,title:p.title,description:p.description,techStack:p.tech_stack,projectUrl:p.project_url,githubUrl:p.github_url,startDate:p.start_date,endDate:p.end_date});});
router.put("/projects/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const b=req.body??{};const r=await pool.query("update projects p set title=coalesce($1,title),description=coalesce($2,description),tech_stack=coalesce($3,tech_stack),project_url=coalesce($4,project_url),github_url=coalesce($5,github_url),start_date=coalesce($6::date,start_date),end_date=coalesce($7::date,end_date) from students s where p.id=$8 and p.student_id=s.id and s.user_id=$9 returning p.id,p.title,p.description,p.tech_stack,p.project_url,p.github_url,p.start_date,p.end_date",[b.title??null,b.description??null,b.techStack??null,b.projectUrl??null,b.githubUrl??null,b.startDate??null,b.endDate??null,Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Project not found",404);const p=r.rows[0];res.json({id:p.id,title:p.title,description:p.description,techStack:p.tech_stack,projectUrl:p.project_url,githubUrl:p.github_url,startDate:p.start_date,endDate:p.end_date});});
router.delete("/projects/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("delete from projects p using students s where p.id=$1 and p.student_id=s.id and s.user_id=$2 returning p.id",[Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Project not found",404);res.json({message:"Project deleted"});});

router.get("/certifications", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("select c.id,name,issuing_organization,issue_date,expiry_date,credential_id,credential_url from certifications c join students s on s.id=c.student_id where s.user_id=$1 order by issue_date desc",[user.id]);res.json(r.rows.map(c=>({id:c.id,name:c.name,issuingOrganization:c.issuing_organization,issueDate:c.issue_date,expiryDate:c.expiry_date,credentialId:c.credential_id,credentialUrl:c.credential_url})));});
router.post("/certifications", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const s=await pool.query("select id from students where user_id=$1",[user.id]);const b=req.body??{};const r=await pool.query("insert into certifications(student_id,name,issuing_organization,issue_date,expiry_date,credential_id,credential_url) values($1,$2,$3,$4::date,$5::date,$6,$7) returning id,name,issuing_organization,issue_date,expiry_date,credential_id,credential_url",[s.rows[0].id,b.name,b.issuingOrganization,b.issueDate,b.expiryDate??null,b.credentialId??null,b.credentialUrl??null]);const c=r.rows[0];res.status(201).json({id:c.id,name:c.name,issuingOrganization:c.issuing_organization,issueDate:c.issue_date,expiryDate:c.expiry_date,credentialId:c.credential_id,credentialUrl:c.credential_url});});
router.delete("/certifications/:id", async(req,res):Promise<void>=>{const user=await requireUser(req,res);if(!user)return;const r=await pool.query("delete from certifications c using students s where c.id=$1 and c.student_id=s.id and s.user_id=$2 returning c.id",[Number(req.params.id),user.id]);if(!r.rows[0])return bad(res,"Certification not found",404);res.json({message:"Certification deleted"});});

export default router;