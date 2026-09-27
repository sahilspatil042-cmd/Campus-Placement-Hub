import { useParams } from 'react-router-dom';
import { useGetDriveApplicants, useShortlistApplicant, ShortlistInputStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDriveApplicants() {
  const id = Number(useParams<{ id: string }>().id);
  const { data, isLoading } = useGetDriveApplicants(id);
  const shortlist = useShortlistApplicant();
  const applicants = data?.content ?? [];
  const update = (applicationId: number, status: ShortlistInputStatus) => shortlist.mutate({ id: applicationId, data: { applicationId, status } });
  return <div className="space-y-6"><Link to="/recruiter/drives" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to drives</Link>
    <div><h2 className="text-3xl font-bold tracking-tight">Drive Applicants</h2><p className="text-muted-foreground">Shortlist candidates for the next round.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Applicants</CardTitle></CardHeader><CardContent>{isLoading ? <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : applicants.length === 0 ? <p className="p-8 text-center text-muted-foreground">No applicants yet.</p> : <div className="divide-y">{applicants.map((application) => <div key={application.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold">{application.student?.firstName} {application.student?.lastName}</p><p className="text-sm text-muted-foreground">{application.student?.email} · {application.student?.branch}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{application.status.replace('_', ' ')}</Badge><Button size="sm" disabled={shortlist.isPending} onClick={() => update(application.id, 'SHORTLISTED')}>Shortlist</Button><Button size="sm" variant="outline" disabled={shortlist.isPending} onClick={() => update(application.id, 'REJECTED')}>Reject</Button></div></div>)}</div>}</CardContent></Card>
  </div>;
}