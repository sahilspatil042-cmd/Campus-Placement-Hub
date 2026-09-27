import { useGetAnalyticsOverview, useListDrives } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function RecruiterDashboard() {
  const { data: overview } = useGetAnalyticsOverview();
  const { data: drives } = useListDrives({ size: 5 });
  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h2><p className="text-muted-foreground">Manage campus hiring activity and candidates.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Active drives</CardTitle><Briefcase className="h-4 w-4 text-primary" /></CardHeader><CardContent><p className="text-2xl font-bold">{overview?.activeDrives ?? '—'}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Applications</CardTitle><Users className="h-4 w-4 text-primary" /></CardHeader><CardContent><p className="text-2xl font-bold">{overview?.totalApplications ?? '—'}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Placement rate</CardTitle><TrendingUp className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><p className="text-2xl font-bold">{overview ? `${overview.placementRate.toFixed(1)}%` : '—'}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Recent placement drives</CardTitle></CardHeader><CardContent className="space-y-3">
        {(drives?.content ?? []).map((drive) => <div key={drive.id} className="flex items-center justify-between border-b pb-3 last:border-0"><div><p className="font-medium">{drive.title}</p><p className="text-sm text-muted-foreground">{drive.company.name} · {drive.jobRole}</p></div><Link to={`/recruiter/drives/${drive.id}/applicants`}><Button variant="outline" size="sm">Applicants</Button></Link></div>)}
        {!drives?.content?.length && <p className="py-6 text-center text-muted-foreground">No drives available.</p>}
      </CardContent></Card>
    </div>
  );
}