import { useGetMyProfile, useUpdateMyProfile, useAddSkill, useDeleteSkill, useAddEducation, useDeleteEducation, useAddProject, useDeleteProject, useAddCertification, useDeleteCertification, SkillInputLevel } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMyProfileQueryKey } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentProfile() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();

  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '', lastName: '', phone: '', address: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', about: ''
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        about: profile.about || ''
      });
      initialized.current = true;
    }
  }, [profile]);

  const handleSavePersonalInfo = () => {
    updateProfile.mutate({ data: personalInfo }, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      }
    });
  };

  // Skills
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillInputLevel>('BEGINNER');

  const handleAddSkill = () => {
    if (!newSkillName) return;
    addSkill.mutate({ data: { name: newSkillName, level: newSkillLevel } }, {
      onSuccess: () => {
        toast.success('Skill added');
        setNewSkillName('');
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      }
    });
  };

  // Education
  const addEdu = useAddEducation();
  const deleteEdu = useDeleteEducation();
  const [newEdu, setNewEdu] = useState({
    institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 4, grade: ''
  });

  const handleAddEdu = (): void => {
    if (!newEdu.institution || !newEdu.degree || !newEdu.fieldOfStudy) {
      toast.error('Fill required fields');
      return;
    }
    addEdu.mutate({ data: newEdu }, {
      onSuccess: () => {
        toast.success('Education added');
        setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 4, grade: '' });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      }
    });
  };

  // Projects
  const addProj = useAddProject();
  const deleteProj = useDeleteProject();
  const [newProj, setNewProj] = useState({
    title: '', description: '', techStack: '', githubUrl: '', projectUrl: ''
  });

  const handleAddProj = (): void => {
    if (!newProj.title || !newProj.description) {
      toast.error('Fill required fields');
      return;
    }
    addProj.mutate({ data: newProj }, {
      onSuccess: () => {
        toast.success('Project added');
        setNewProj({ title: '', description: '', techStack: '', githubUrl: '', projectUrl: '' });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and portfolio to stand out.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact and public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={personalInfo.firstName} onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={personalInfo.lastName} onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input value={personalInfo.linkedinUrl} onChange={e => setPersonalInfo({...personalInfo, linkedinUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input value={personalInfo.githubUrl} onChange={e => setPersonalInfo({...personalInfo, githubUrl: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Portfolio URL</Label>
                <Input value={personalInfo.portfolioUrl} onChange={e => setPersonalInfo({...personalInfo, portfolioUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>About Me</Label>
                <Textarea rows={4} value={personalInfo.about} onChange={e => setPersonalInfo({...personalInfo, about: e.target.value})} placeholder="Write a short professional summary..." />
              </div>
              <Button onClick={handleSavePersonalInfo} disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add technical and soft skills.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end mb-6 bg-muted/30 p-4 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Skill Name</Label>
                  <Input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} placeholder="e.g. React, Python" />
                </div>
                <div className="w-48 space-y-2">
                  <Label>Level</Label>
                  <Select value={newSkillLevel} onValueChange={(v: SkillInputLevel) => setNewSkillLevel(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddSkill} disabled={addSkill.isPending}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map(skill => (
                  <div key={skill.id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs opacity-70 border-l border-border/50 pl-2">{skill.level}</span>
                    <button 
                      onClick={() => deleteSkill.mutate({ id: skill.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() }) })}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(!profile?.skills || profile.skills.length === 0) && (
                  <p className="text-muted-foreground text-sm">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Your academic history.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 bg-muted/30 p-4 rounded-lg mb-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Institution</Label><Input value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Degree</Label><Input value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} placeholder="e.g. B.Tech" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Field of Study</Label><Input value={newEdu.fieldOfStudy} onChange={e => setNewEdu({...newEdu, fieldOfStudy: e.target.value})} placeholder="e.g. Computer Science" /></div>
                  <div className="space-y-2"><Label>Grade/CGPA</Label><Input value={newEdu.grade} onChange={e => setNewEdu({...newEdu, grade: e.target.value})} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Year</Label><Input type="number" value={newEdu.startYear} onChange={e => setNewEdu({...newEdu, startYear: parseInt(e.target.value)})} /></div>
                  <div className="space-y-2"><Label>End Year (Expected)</Label><Input type="number" value={newEdu.endYear} onChange={e => setNewEdu({...newEdu, endYear: parseInt(e.target.value)})} /></div>
                </div>
                <Button onClick={handleAddEdu} disabled={addEdu.isPending} className="w-fit"><Plus className="h-4 w-4 mr-1" /> Add Education</Button>
              </div>

              <div className="space-y-4">
                {profile?.education?.map(edu => (
                  <div key={edu.id} className="flex justify-between items-start border p-4 rounded-lg">
                    <div>
                      <h4 className="font-bold text-lg">{edu.degree} in {edu.fieldOfStudy}</h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm mt-1">{edu.startYear} - {edu.endYear || 'Present'} • Grade: {edu.grade || 'N/A'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEdu.mutate({ id: edu.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() }) })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Showcase your practical work.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 bg-muted/30 p-4 rounded-lg mb-6">
                <div className="space-y-2"><Label>Project Title</Label><Input value={newProj.title} onChange={e => setNewProj({...newProj, title: e.target.value})} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} rows={3} /></div>
                <div className="space-y-2"><Label>Tech Stack</Label><Input value={newProj.techStack} onChange={e => setNewProj({...newProj, techStack: e.target.value})} placeholder="e.g. React, Node.js, PostgreSQL" /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>GitHub URL</Label><Input value={newProj.githubUrl} onChange={e => setNewProj({...newProj, githubUrl: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Live URL</Label><Input value={newProj.projectUrl} onChange={e => setNewProj({...newProj, projectUrl: e.target.value})} /></div>
                </div>
                <Button onClick={handleAddProj} disabled={addProj.isPending} className="w-fit"><Plus className="h-4 w-4 mr-1" /> Add Project</Button>
              </div>

              <div className="space-y-4">
                {profile?.projects?.map(proj => (
                  <div key={proj.id} className="flex justify-between items-start border p-4 rounded-lg bg-card">
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg">{proj.title}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{proj.description}</p>
                      {proj.techStack && <p className="text-sm"><span className="font-semibold">Tech:</span> {proj.techStack}</p>}
                      <div className="flex gap-4 pt-2">
                        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">GitHub</a>}
                        {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Live Demo</a>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteProj.mutate({ id: proj.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() }) })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
