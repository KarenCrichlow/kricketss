import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStores = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load stores",
          variant: "destructive",
        });
        return;
      }

      setStores(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    isLoading,
    fetchStores,
  };
};