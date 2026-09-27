# CampusHire — Campus Placement Management System

CampusHire is a role-based placement platform for students, placement officers, and recruiters. It provides authenticated dashboards for managing student profiles, companies, placement drives, applications, shortlisting, notifications, and placement analytics.

## Run & Operate

The project is a pnpm monorepo with managed artifact workflows:

- `pnpm --filter @workspace/campus-placement run dev` — start the React/Vite frontend
- `pnpm --filter @workspace/api-server run dev` — start the Node/Express runtime API
- `pnpm --filter @workspace/campus-placement run typecheck` — type-check the frontend
- `pnpm --filter @workspace/api-server run typecheck` — type-check the runtime API
- `pnpm --filter @workspace/api-server run build` — bundle the runtime API
- `pnpm run typecheck` — type-check workspace libraries and artifacts
- `pnpm run build` — type-check and build all packages that expose a build script
- `pnpm --filter @workspace/api-spec run codegen` — regenerate the API clients and Zod schemas from the OpenAPI contract

Required runtime configuration:

- `DATABASE_URL` — Replit PostgreSQL connection string
- `SESSION_SECRET` — available in the Replit environment; used as a JWT fallback when `JWT_SECRET` is not set
- `JWT_SECRET` — recommended production JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required only by the Spring Boot Cloudinary upload implementation

The managed workflows provide their own `PORT` and artifact routing configuration. Do not hardcode localhost URLs or replace the managed workflows with duplicate processes.

## Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, React Router, TanStack React Query, Axios
- Runtime API: Node.js, Express 5, PostgreSQL `pg`, bcryptjs, JWT, Pino
- Production backend deliverable: Java Spring Boot, Spring Security, JWT, Hibernate/JPA, Cloudinary
- Database: Replit PostgreSQL at runtime; the Spring project remains straightforward to migrate to MySQL by swapping its JDBC configuration and driver
- API contract: `lib/api-spec/openapi.yaml`
- Generated clients: `lib/api-client-react/` and `lib/api-zod/`

## Where Things Live

- `artifacts/campus-placement/` — React/Vite user interface
- `artifacts/api-server/` — database-backed Node API used by the Replit runtime
- `backend/` — Spring Boot production backend deliverable
- `lib/api-spec/openapi.yaml` — source of truth for endpoint and DTO shapes
- `lib/api-client-react/` — generated React Query/fetch client
- `lib/api-zod/` — generated Zod request and response schemas
- `lib/db/` — shared PostgreSQL connection package

## Architecture Decisions

- PostgreSQL is the Replit runtime database. The Spring service keeps MySQL-compatible deployment guidance, but the development/runtime environment uses the provisioned Replit PostgreSQL database.
- The Node API mirrors the Spring entity schema with parameterized SQL so the frontend can run immediately in Replit without starting a JVM service.
- The OpenAPI document is the contract source; generated fetch hooks are configured with an explicit JWT token getter because Axios defaults do not automatically apply to fetch-based generated clients.
- Upload routes currently accept stored URL updates. Cloudinary upload orchestration remains available in the Spring backend and should be enabled when Cloudinary credentials are configured.
- No AI features are included.

## Demo Accounts

All seeded demo accounts use:

- Password: `Admin@123`

Accounts:

- Student: `student@campus.edu`
- Placement Officer: `admin@campus.edu`
- Recruiter: `recruiter@techcorp.example.com`

## Product Capabilities

- Public landing, login, student registration, and recruiter registration
- Student profile, education, skills, projects, certifications, resume/photo URLs, and application history
- Student drive browsing, eligibility-oriented placement workflow, apply/withdraw actions, and notifications
- Placement Officer management for users, students, companies, drives, recruiters, and analytics
- Recruiter profile, drive management, applicant review, and shortlisting
- JWT-protected role-aware API endpoints backed by PostgreSQL

## Gotchas

- The frontend and API are separate artifacts. Start both managed workflows for authenticated dashboard flows.
- The API is mounted under `/api`; the frontend generated client already uses that base path.
- Calendar-only database values are returned as date strings by PostgreSQL. Avoid converting them through local-time `Date` objects when preserving a placement-drive day.
- If the API contract changes, regenerate both the React client and Zod package before changing frontend consumers.
- The current URL-update endpoints do not upload binary files themselves. Configure Cloudinary and wire the production upload flow before treating resume/photo storage as production-complete.

## User Preferences

- Build a production-ready Semester 7 major-project system.
- Keep student, placement officer/admin, and recruiter roles.
- Use PostgreSQL as the Replit runtime substitute for MySQL.
- Do not add AI features.

## Pointers

- Read `.local/skills/react-vite/SKILL.md` before changing the web app.
- Read `.local/skills/workflows/SKILL.md` before changing managed workflow behavior.
- Read `.local/skills/database/SKILL.md` before changing development or production database data/schema.