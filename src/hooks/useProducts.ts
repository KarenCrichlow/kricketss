import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Input sanitization helper
  const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, 1000); // Limit length and trim whitespace
  };

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
      // Sanitize input data
      const sanitizedData = {
        Description: sanitizeInput(productData.Description),
        Category: sanitizeInput(productData.Category),
        Brand: sanitizeInput(productData.Brand),
        Size: sanitizeInput(productData.Size),
        Segment: sanitizeInput(productData.Segment),
        UPC: sanitizeInput(productData.UPC).replace(/[^0-9]/g, ''), // Only digits for UPC
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('Food Items')
        .insert(sanitizedData)
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
      // Sanitize UPC input - only allow digits
      const sanitizedUPC = upc.replace(/[^0-9]/g, '').slice(0, 14);
      
      if (!sanitizedUPC || sanitizedUPC.length < 8) {
        toast({
          title: "Invalid UPC",
          description: "UPC must be at least 8 digits",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('Food Items')
        .select('*')
        .eq('UPC', sanitizedUPC)
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