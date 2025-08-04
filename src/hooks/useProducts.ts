import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const findProductByUPC = async (upc: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Food Items')
        .select('*')
        .eq('UPC', upc)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to search for product",
          variant: "destructive",
        });
        return null;
      }

      if (!data) {
        toast({
          title: "Product not found",
          description: "No product found with this UPC code",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for product",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    findProductByUPC,
    isLoading,
  };
};