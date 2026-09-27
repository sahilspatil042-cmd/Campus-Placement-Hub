import { useEffect, useState } from 'react';
import { useGetRecruiterProfile, useUpdateRecruiterProfile } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RecruiterProfile() {
  const { data: profile, isLoading } = useGetRecruiterProfile();
  const update = useUpdateRecruiterProfile();
  const [form, setForm] = useState({ firstName: '', lastName: '', designation: '', phone: '', linkedinUrl: '' });

  useEffect(() => {
    if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName, designation: profile.designation, phone: profile.phone ?? '', linkedinUrl: profile.linkedinUrl ?? '' });
  }, [profile]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const updateField = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="space-y-6"><div><h2 className="text-3xl font-bold tracking-tight">Company Profile</h2><p className="text-muted-foreground">Keep your recruiter details current.</p></div>
    <Card><CardHeader><CardTitle>{profile?.companyName}</CardTitle><CardDescription>{profile?.email}</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
      {(['firstName', 'lastName', 'designation', 'phone', 'linkedinUrl'] as const).map((field) => <div key={field} className="space-y-2"><Label className="capitalize">{field.replace('Url', ' URL')}</Label><Input value={form[field]} onChange={(event) => updateField(field, event.target.value)} /></div>)}
      <div className="sm:col-span-2"><Button disabled={update.isPending} onClick={() => update.mutate({ data: form }, { onSuccess: () => toast.success('Profile updated') })}>{update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button></div>
    </CardContent></Card></div>;
}