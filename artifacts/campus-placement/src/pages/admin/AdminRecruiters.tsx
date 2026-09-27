import { useListRecruiters } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';

export default function AdminRecruiters() {
  const { data, isLoading } = useListRecruiters({ size: 50 });
  const recruiters = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Recruiters</h2>
        <p className="text-muted-foreground">Review recruiting partners registered on the portal.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Registered recruiters</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : recruiters.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No recruiters found.</p>
          ) : (
            <div className="divide-y">
              {recruiters.map((recruiter) => (
                <div key={recruiter.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{recruiter.firstName} {recruiter.lastName}</p>
                    <p className="text-sm text-muted-foreground">{recruiter.email} · {recruiter.companyName}</p>
                  </div>
                  <Badge variant={recruiter.isVerified ? 'default' : 'outline'}>
                    {recruiter.isVerified ? 'Verified' : 'Pending verification'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}