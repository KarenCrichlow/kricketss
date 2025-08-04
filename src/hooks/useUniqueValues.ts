import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUniqueValues = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUniqueValues = async () => {
      setIsLoading(true);
      try {
        const { data: items, error } = await supabase
          .from('Food Items')
          .select('Brand, Category, Segment');

        if (error) {
          console.error('Error fetching unique values:', error);
          return;
        }

        if (items) {
          // Extract unique non-null, non-empty values
          const uniqueBrands = [...new Set(
            items
              .map(item => item.Brand)
              .filter(brand => brand && brand.trim() !== '')
          )].sort();

          const uniqueCategories = [...new Set(
            items
              .map(item => item.Category)
              .filter(category => category && category.trim() !== '')
          )].sort();

          const uniqueSegments = [...new Set(
            items
              .map(item => item.Segment)
              .filter(segment => segment && segment.trim() !== '')
          )].sort();

          setBrands(uniqueBrands);
          setCategories(uniqueCategories);
          setSegments(uniqueSegments);
        }
      } catch (error) {
        console.error('Error fetching unique values:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniqueValues();
  }, []);

  return {
    brands,
    categories,
    segments,
    isLoading,
  };
};