import { useListMyApplications, useListDrives, useGetMyProfile, ApplicationStatus, DriveStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { data: profile } = useGetMyProfile();
  const { data: applicationsData } = useListMyApplications();
  const { data: upcomingDrives } = useListDrives({ status: DriveStatus.UPCOMING, size: 5 });

  const applications = applicationsData || [];
  const shortlisted = applications.filter(a => a.status === ApplicationStatus.SHORTLISTED || a.status === ApplicationStatus.INTERVIEW_SCHEDULED || a.status === ApplicationStatus.SELECTED);
  const selected = applications.filter(a => a.status === ApplicationStatus.SELECTED);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {profile?.firstName}</h2>
        <p className="text-muted-foreground">Here's an overview of your placement journey.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlists / Interviews</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlisted.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{selected.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {profile?.placementStatus?.replace('_', ' ').toLowerCase() || 'Not Placed'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
            </div>
            <Link to="/student/applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No applications yet.</p>
                <Link to="/student/drives">
                  <Button variant="link" className="mt-2 text-primary">Browse Drives</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{app.drive?.title}</p>
                      <p className="text-sm text-muted-foreground">{app.drive?.company?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${app.status === 'SELECTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                        ${app.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${(app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${app.status === 'APPLIED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      `}>
                        {app.status.replace('_', ' ').toLowerCase()}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(app.appliedAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Drives</CardTitle>
            </div>
            <Link to="/student/drives">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(upcomingDrives?.content?.length || 0) === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No upcoming drives scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDrives?.content?.map(drive => (
                  <div key={drive.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{drive.title}</p>
                      <p className="text-sm text-muted-foreground">{drive.company.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(drive.driveDate), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apply by {drive.lastApplyDate ? format(new Date(drive.lastApplyDate), 'MMM d') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
