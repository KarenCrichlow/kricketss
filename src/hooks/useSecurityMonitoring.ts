import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const [recentActivity, setRecentActivity] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('id, user_id, action, table_name, record_id, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast({
        title: "Error",
        description: "Failed to load recent activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logSecurityEvent = async (action: string, details: string) => {
    try {
      // This would typically be done server-side, but we can log client-side events
      console.log(`Security Event: ${action} - ${details}`);
      
      // In a production app, you'd send this to a security monitoring service
      // For now, we'll just use the browser's built-in logging
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  return {
    recentActivity,
    isLoading,
    fetchRecentActivity,
    logSecurityEvent,
  };
};