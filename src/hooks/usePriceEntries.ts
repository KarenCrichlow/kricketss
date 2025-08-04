import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PriceEntry {
  id: string;
  product_uid: number;
  store_id: number;
  price: number;
  created_at: string;
  updated_at: string;
}

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
          store_id: parseInt(storeId),
          price: price,
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

  const getPriceHistory = async (productUID: number): Promise<PriceEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('price_entries')
        .select('*')
        .eq('product_uid', productUID)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch price history",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch price history",
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