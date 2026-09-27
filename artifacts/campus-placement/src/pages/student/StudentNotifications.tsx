import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { getListNotificationsQueryKey } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

export default function StudentNotifications() {
  const { data: notificationsData, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHORTLIST':
      case 'RESULT':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'INTERVIEW':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on your placement activities.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 opacity-20 mb-3" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 sm:p-6 flex gap-4 transition-colors",
                  !notif.isRead ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between gap-4">
                    <p className={cn("font-medium", !notif.isRead && "text-primary")}>{notif.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  
                  {!notif.isRead && (
                    <div className="pt-2">
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => handleMarkRead(notif.id)}>
                        Mark read
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
