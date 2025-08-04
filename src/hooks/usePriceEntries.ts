import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePriceEntries = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const savePriceEntry = async (productUID: number, price: number, storeId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('price_entries')
        .insert({
          product_uid: productUID,
          store_id: storeId,
          price: price,
          collected_at: new Date().toISOString(),
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save price entry",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Price entry saved successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save price entry",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceHistory = async (productUID: number) => {
    try {
      const { data, error } = await supabase
        .from('price_entries')
        .select(`
          id,
          price,
          collected_at,
          store:stores(name, location)
        `)
        .eq('product_uid', productUID)
        .order('collected_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load price history",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load price history",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    savePriceEntry,
    getPriceHistory,
    isLoading,
  };
};