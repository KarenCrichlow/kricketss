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
        .from('Stores')
        .select('*')
        .order('Stores');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load stores",
          variant: "destructive",
        });
        return;
      }

      // Map the data to match expected interface
      const mappedStores = (data || []).map((store: any) => ({
        id: store.id.toString(),
        name: store.Stores,
        location: store.Stores // Using same field for location for now
      }));

      setStores(mappedStores);
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