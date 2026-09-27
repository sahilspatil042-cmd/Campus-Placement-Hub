import { useState } from 'react';
import { useListCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Building, Trash2, Edit2, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListCompaniesQueryKey } from '@workspace/api-client-react';

export default function AdminCompanies() {
  const [search, setSearch] = useState('');
  const { data: companiesPage, isLoading } = useListCompanies({ search: search || undefined });
  const companies = companiesPage?.content || [];

  const queryClient = useQueryClient();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', sector: '', website: '', description: '', location: '', employeeCount: ''
  });

  const resetForm = () => {
    setFormData({ name: '', sector: '', website: '', description: '', location: '', employeeCount: '' });
    setEditingId(null);
  };

  const handleOpenEdit = (company: any) => {
    setFormData({
      name: company.name,
      sector: company.sector,
      website: company.website,
      description: company.description || '',
      location: company.location || '',
      employeeCount: company.employeeCount?.toString() || ''
    });
    setEditingId(company.id);
    setIsOpen(true);
  };

  const handleSave = (): void => {
    if (!formData.name || !formData.sector || !formData.website) {
      toast.error('Name, Sector, and Website required');
      return;
    }

    const payload = {
      ...formData,
      employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined
    };

    if (editingId) {
      updateCompany.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success('Company updated');
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        }
      });
    } else {
      createCompany.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success('Company created');
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    deleteCompany.mutate({ id }, {
      onSuccess: () => {
        toast.success('Company deleted');
        queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">Manage recruiting partners.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <Input className="col-span-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sector</Label>
                <Input className="col-span-3" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} placeholder="e.g. IT, Finance, Core" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Website</Label>
                <Input className="col-span-3" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Location</Label>
                <Input className="col-span-3" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Employees</Label>
                <Input type="number" className="col-span-3" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSave} disabled={createCompany.isPending || updateCompany.isPending}>
                {(createCompany.isPending || updateCompany.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No companies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-base">{company.name}</p>
                            <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <Globe className="h-3 w-3" /> {company.website.replace('https://', '')}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{company.sector}</TableCell>
                      <TableCell>{company.location || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(company)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)} className="text-destructive hover:text-destructive">
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
