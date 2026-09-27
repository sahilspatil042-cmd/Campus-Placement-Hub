import { useListMyApplications, useWithdrawApplication, ApplicationStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Building, Calendar, Video, Clock, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListMyApplicationsQueryKey } from '@workspace/api-client-react';

export default function StudentApplications() {
  const { data: appsData, isLoading } = useListMyApplications();
  const withdrawMutation = useWithdrawApplication();
  const queryClient = useQueryClient();

  const applications = appsData || [];

  const handleWithdraw = (appId: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    withdrawMutation.mutate({ id: appId }, {
      onSuccess: () => {
        toast.success('Application withdrawn');
        queryClient.invalidateQueries({ queryKey: getListMyApplicationsQueryKey() });
      }
    });
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'APPLIED': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      case 'SELECTED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      default: return '';
    }
  };

  const getStatusStep = (status: ApplicationStatus) => {
    switch(status) {
      case 'APPLIED': return 1;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'SELECTED': return 4;
      case 'REJECTED': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
        <p className="text-muted-foreground">Track the status of your drive applications.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <Card key={i} className="h-40 animate-pulse bg-muted/50" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No applications yet</h3>
          <p className="text-muted-foreground">Apply to drives to see them tracked here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => {
            const step = getStatusStep(app.status);
            const isRejected = app.status === 'REJECTED';

            return (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl">{app.drive?.jobRole}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1.5 font-medium text-foreground">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {app.drive?.company?.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(app.status)} variant="outline">
                        {app.status.replace('_', ' ')}
                      </Badge>
                      {app.status === 'APPLIED' && (
                        <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleWithdraw(app.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Timeline */}
                  <div className="relative mb-8 mt-2">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isRejected ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${(step - 1) * 33.33}%` }} 
                      />
                    </div>
                    <div className="relative flex justify-between">
                      {['Applied', 'Shortlisted', 'Interview', isRejected ? 'Rejected' : 'Selected'].map((label, idx) => {
                        const s = idx + 1;
                        const active = step >= s;
                        const current = step === s;
                        const rejectedStep = isRejected && s === 4;
                        return (
                          <div key={label} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-card relative z-10 
                              ${active ? (rejectedStep ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground') : 'bg-muted text-muted-foreground'}`}>
                              {active && !rejectedStep && <CheckCircle2 className="h-4 w-4" />}
                              {rejectedStep && <XCircle className="h-4 w-4" />}
                              {!active && <span className="text-xs font-medium">{s}</span>}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${current ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Applied On</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(app.appliedAt), 'PPP')}</p>
                      </div>
                    </div>
                    
                    {app.interviewDate && (
                      <div className="flex items-start gap-3">
                        <Video className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Interview Scheduled</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(app.interviewDate), 'PPP p')}</p>
                          {app.interviewLink && (
                            <a href={app.interviewLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {app.feedback && (
                      <div className="flex items-start gap-3 sm:col-span-2 mt-2 pt-4 border-t border-border/50">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Feedback / Remarks</p>
                          <p className="text-sm text-muted-foreground italic">"{app.feedback}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
