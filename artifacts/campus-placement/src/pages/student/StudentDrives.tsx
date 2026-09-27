import { useListDrives, useApplyToDrive, useListMyApplications, DriveStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Briefcase, IndianRupee, Calendar, Search, Building } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListDrivesQueryKey, getListMyApplicationsQueryKey } from '@workspace/api-client-react';

export default function StudentDrives() {
  const [search, setSearch] = useState('');
  
  const { data: drivesData, isLoading } = useListDrives({ 
    status: DriveStatus.UPCOMING,
    search: search || undefined
  });
  
  const { data: myApps } = useListMyApplications();
  const applyMutation = useApplyToDrive();
  const queryClient = useQueryClient();

  const drives = drivesData?.content || [];
  const appliedDriveIds = new Set(myApps?.map(app => app.driveId) || []);

  const handleApply = (driveId: number) => {
    applyMutation.mutate(
      { data: { driveId } },
      {
        onSuccess: () => {
          toast.success('Successfully applied to drive!');
          queryClient.invalidateQueries({ queryKey: getListMyApplicationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to apply. Check eligibility.');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Placement Drives</h2>
          <p className="text-muted-foreground">Browse and apply to upcoming company drives.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search roles or companies..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <Building className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No drives found</h3>
          <p className="text-muted-foreground">We couldn't find any upcoming drives matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drives.map((drive) => {
            const hasApplied = appliedDriveIds.has(drive.id);
            return (
              <Card key={drive.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="capitalize">{drive.jobType?.replace('_', ' ').toLowerCase()}</Badge>
                    {hasApplied && <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Applied</Badge>}
                  </div>
                  <CardTitle className="line-clamp-1">{drive.jobRole}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-base font-medium text-foreground">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {drive.company.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <span className="truncate">{drive.ctc || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{drive.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Calendar className="h-4 w-4" />
                      <span>Drive: {format(new Date(drive.driveDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Eligibility:</span>{' '}
                    {drive.eligibilityCgpa ? `${drive.eligibilityCgpa} CGPA` : 'No CGPA bar'}
                    {drive.eligibilityBranches ? ` • ${drive.eligibilityBranches}` : ''}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/20">
                  <Button 
                    className="w-full" 
                    disabled={hasApplied || applyMutation.isPending}
                    onClick={() => handleApply(drive.id)}
                  >
                    {hasApplied ? 'Application Submitted' : 'Apply Now'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
