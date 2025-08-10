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
      // Input validation
      if (!productUID || productUID <= 0) {
        throw new Error('Invalid product ID');
      }
      if (!price || price <= 0 || price > 10000) {
        throw new Error('Price must be between $0.01 and $10,000');
      }
      if (!storeId || isNaN(parseInt(storeId))) {
        throw new Error('Invalid store selection');
      }

      const { error } = await supabase
        .from('price_entries')
        .insert({
          product_uid: productUID,
          store_id: parseInt(storeId),
          price: Number(price.toFixed(2)), // Ensure proper decimal formatting
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
      // Get price entries from price_entries table
      const { data: priceEntries, error: priceError } = await supabase
        .from('price_entries')
        .select('*')
        .eq('product_uid', productUID)
        .order('created_at', { ascending: false });

      if (priceError) {
        toast({
          title: "Error",
          description: "Failed to fetch price history",
          variant: "destructive",
        });
        return [];
      }

      // Get existing price from Food Items table (assuming it's from Massy store, ID 1)
      const { data: foodItem, error: foodError } = await supabase
        .from('Food Items')
        .select('Price, created_at')
        .eq('UID', productUID)
        .single();

      if (foodError && foodError.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Failed to fetch existing price data",
          variant: "destructive",
        });
        return priceEntries || [];
      }

      const allEntries: PriceEntry[] = [...(priceEntries || [])];

      // Add existing price from Food Items table if it exists
      if (foodItem && foodItem.Price) {
        const existingPriceEntry: PriceEntry = {
          id: `existing-${productUID}`,
          product_uid: productUID,
          store_id: 1, // Massy store ID
          price: parseFloat(foodItem.Price),
          created_at: foodItem.created_at,
          updated_at: foodItem.created_at,
        };
        allEntries.push(existingPriceEntry);
      }

      // Sort all entries by creation date, newest first
      return allEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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