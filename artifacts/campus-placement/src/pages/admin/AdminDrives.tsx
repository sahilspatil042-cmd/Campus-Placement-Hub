import { useState } from 'react';
import { useListDrives, useCreateDrive, useUpdateDrive, useDeleteDrive, useListCompanies, DriveInputJobType, DriveInputStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Edit2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListDrivesQueryKey } from '@workspace/api-client-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function AdminDrives() {
  const [search, setSearch] = useState('');
  const [status, setStatusFilter] = useState('all');

  const { data: drivesPage, isLoading } = useListDrives({ 
    search: search || undefined,
    status: status !== 'all' ? status : undefined
  });
  const drives = drivesPage?.content || [];

  const { data: companiesPage } = useListCompanies({ size: 100 }); // Get all for dropdown
  const companies = companiesPage?.content || [];

  const queryClient = useQueryClient();
  const createDrive = useCreateDrive();
  const updateDrive = useUpdateDrive();
  const deleteDrive = useDeleteDrive();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', companyId: '', jobRole: '', jobType: 'FULL_TIME' as DriveInputJobType,
    driveDate: '', lastApplyDate: '', status: 'UPCOMING' as DriveInputStatus,
    ctc: '', eligibilityCgpa: '', eligibilityBranches: ''
  });

  const resetForm = () => {
    setFormData({
      title: '', companyId: '', jobRole: '', jobType: 'FULL_TIME',
      driveDate: '', lastApplyDate: '', status: 'UPCOMING',
      ctc: '', eligibilityCgpa: '', eligibilityBranches: ''
    });
    setEditingId(null);
  };

  const handleOpenEdit = (drive: any) => {
    setFormData({
      title: drive.title,
      companyId: drive.companyId.toString(),
      jobRole: drive.jobRole,
      jobType: drive.jobType as DriveInputJobType,
      driveDate: drive.driveDate.substring(0, 10), // yyyy-mm-dd
      lastApplyDate: drive.lastApplyDate ? drive.lastApplyDate.substring(0, 10) : '',
      status: drive.status as DriveInputStatus,
      ctc: drive.ctc || '',
      eligibilityCgpa: drive.eligibilityCgpa?.toString() || '',
      eligibilityBranches: drive.eligibilityBranches || ''
    });
    setEditingId(drive.id);
    setIsOpen(true);
  };

  const handleSave = (): void => {
    if (!formData.title || !formData.companyId || !formData.jobRole || !formData.driveDate) {
      toast.error('Required fields missing');
      return;
    }

    const payload = {
      ...formData,
      companyId: parseInt(formData.companyId),
      eligibilityCgpa: formData.eligibilityCgpa ? parseFloat(formData.eligibilityCgpa) : undefined,
      lastApplyDate: formData.lastApplyDate ? new Date(formData.lastApplyDate).toISOString() : undefined,
      driveDate: new Date(formData.driveDate).toISOString()
    };

    if (editingId) {
      updateDrive.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success('Drive updated');
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
        }
      });
    } else {
      createDrive.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success('Drive created');
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;
    deleteDrive.mutate({ id }, {
      onSuccess: () => {
        toast.success('Drive deleted');
        queryClient.invalidateQueries({ queryKey: getListDrivesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Placement Drives</h2>
          <p className="text-muted-foreground">Manage recruiting events and schedules.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Drive</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Drive' : 'Create New Drive'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Drive Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Google SWE Hiring 2024" />
              </div>
              
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={formData.companyId} onValueChange={(v) => setFormData({...formData, companyId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Job Role</Label>
                <Input value={formData.jobRole} onChange={e => setFormData({...formData, jobRole: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={formData.jobType} onValueChange={(v: DriveInputJobType) => setFormData({...formData, jobType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: DriveInputStatus) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Drive Date</Label>
                <Input type="date" value={formData.driveDate} onChange={e => setFormData({...formData, driveDate: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Last Apply Date</Label>
                <Input type="date" value={formData.lastApplyDate} onChange={e => setFormData({...formData, lastApplyDate: e.target.value})} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>CTC / Stipend</Label>
                <Input value={formData.ctc} onChange={e => setFormData({...formData, ctc: e.target.value})} placeholder="e.g. 15 LPA or 40k/month" />
              </div>

              <div className="space-y-2">
                <Label>Min CGPA</Label>
                <Input type="number" step="0.1" value={formData.eligibilityCgpa} onChange={e => setFormData({...formData, eligibilityCgpa: e.target.value})} placeholder="e.g. 7.5" />
              </div>

              <div className="space-y-2">
                <Label>Eligible Branches</Label>
                <Input value={formData.eligibilityBranches} onChange={e => setFormData({...formData, eligibilityBranches: e.target.value})} placeholder="e.g. CS, IT" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSave} disabled={createDrive.isPending || updateDrive.isPending}>
                {(createDrive.isPending || updateDrive.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-row items-end gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search drives..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Drive Details</TableHead>
                  <TableHead>Role & Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
                ) : drives.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No drives found.</TableCell></TableRow>
                ) : (
                  drives.map((drive) => (
                    <TableRow key={drive.id}>
                      <TableCell>
                        <div className="font-medium text-base">{drive.title}</div>
                        <div className="text-sm text-muted-foreground">{drive.company.name}</div>
                      </TableCell>
                      <TableCell>
                        <div>{drive.jobRole}</div>
                        <Badge variant="secondary" className="mt-1">{drive.jobType?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">Drive: {format(new Date(drive.driveDate), 'MMM d, yyyy')}</div>
                        {drive.lastApplyDate && <div className="text-xs text-muted-foreground">Deadline: {format(new Date(drive.lastApplyDate), 'MMM d, yyyy')}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          drive.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                          drive.status === 'ONGOING' ? 'bg-amber-100 text-amber-800' :
                          drive.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }>
                          {drive.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/plo/drives/${drive.id}/applicants`}>
                            <Button variant="outline" size="sm" className="h-8">
                              <Users className="h-4 w-4 mr-2" /> Applicants ({drive.totalApplicants || 0})
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(drive)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(drive.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
