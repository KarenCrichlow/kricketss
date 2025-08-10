import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { format } from 'date-fns';

export const SecurityMonitor = () => {
  const { recentActivity, isLoading } = useSecurityMonitoring();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Admin Activity</h3>
      {recentActivity.length === 0 ? (
        <p className="text-muted-foreground">No recent activity to display.</p>
      ) : (
        <div className="space-y-3">
          {recentActivity.slice(0, 10).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={getActionBadgeVariant(event.action)}>
                  {event.action}
                </Badge>
                <span className="text-sm">
                  {event.table_name}
                  {event.record_id && ` (ID: ${event.record_id.slice(0, 8)}...)`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.created_at), 'MMM dd, HH:mm')}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};