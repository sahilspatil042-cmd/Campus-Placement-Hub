import { useState } from 'react';
import { useListUsers, useUpdateUserStatus, UserRole } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListUsersQueryKey } from '@workspace/api-client-react';

export default function AdminUsers() {
  const { data, isLoading } = useListUsers({ size: 50 });
  const updateStatus = useUpdateUserStatus();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const users = data?.content ?? [];

  const toggleStatus = (id: number, isActive: boolean) => {
    setUpdatingId(id);
    updateStatus.mutate({ id, data: { isActive: !isActive } }, {
      onSettled: () => {
        setUpdatingId(null);
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
        <p className="text-muted-foreground">Manage access for students, recruiters, and placement-cell users.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> User access</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No users found.</p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{user.role}</Badge>
                    <Button
                      size="sm"
                      variant={user.isActive ? 'outline' : 'default'}
                      disabled={updatingId === user.id}
                      onClick={() => toggleStatus(user.id, user.isActive)}
                    >
                      {updatingId === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}