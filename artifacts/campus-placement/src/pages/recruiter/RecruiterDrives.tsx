import { useListDrives } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function RecruiterDrives() {
  const { data, isLoading } = useListDrives({ size: 50 });
  const drives = data?.content ?? [];
  return <div className="space-y-6"><div><h2 className="text-3xl font-bold tracking-tight">Posted Drives</h2><p className="text-muted-foreground">Review drives and manage their applicant pipeline.</p></div>
    <Card><CardHeader><CardTitle>Placement drives</CardTitle></CardHeader><CardContent>{isLoading ? <p className="p-8 text-center text-muted-foreground">Loading drives...</p> : drives.length === 0 ? <p className="p-8 text-center text-muted-foreground">No drives found.</p> : <div className="divide-y">{drives.map((drive) => <div key={drive.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{drive.title}</p><p className="text-sm text-muted-foreground">{drive.company.name} · {drive.jobRole}</p></div><div className="flex items-center gap-3"><Badge variant="outline">{drive.status}</Badge><Link to={`/recruiter/drives/${drive.id}/applicants`}><Button size="sm">View applicants</Button></Link></div></div>)}</div>}</CardContent></Card>
  </div>;
}