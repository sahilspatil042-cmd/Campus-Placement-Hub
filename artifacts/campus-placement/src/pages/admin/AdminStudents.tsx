import { useListStudents } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const { data: studentsPage, isLoading } = useListStudents({
    search: search || undefined,
    branch: branch !== 'all' ? branch : undefined,
    status: status !== 'all' ? status : undefined,
    size: 20
  });

  const students = studentsPage?.content || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students Directory</h2>
        <p className="text-muted-foreground">Manage and track student placement progress.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4">
          <CardTitle className="text-xl">All Students</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, roll no..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PLACED">Placed</SelectItem>
                <SelectItem value="NOT_PLACED">Not Placed</SelectItem>
                <SelectItem value="IN_PROCESS">In Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Branch & Year</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>
                        <div>{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{student.branch}</div>
                        <div className="text-xs text-muted-foreground">Class of {student.year}</div>
                      </TableCell>
                      <TableCell>{student.cgpa || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={student.placementStatus === 'PLACED' ? 'default' : student.placementStatus === 'IN_PROCESS' ? 'secondary' : 'outline'}
                          className={student.placementStatus === 'PLACED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          {student.placementStatus?.replace('_', ' ') || 'NOT PLACED'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Profile</Button>
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
