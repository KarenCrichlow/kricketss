import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAllProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Food Items')
        .select('*')
        .order('Description');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: {
    UPC: string;
    Description: string;
    Brand: string;
    Size: string;
    Category: string;
    Segment: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Food Items')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create product",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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
    getAllProducts,
    createProduct,
    findProductByUPC,
    isLoading,
  };
};