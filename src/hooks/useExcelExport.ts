import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  product: any;
  priceEntries: any[];
}

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all data
      const [productsResult, priceEntriesResult, storesResult] = await Promise.all([
        supabase.from('Food Items').select('*'),
        supabase.from('price_entries').select('*'),
        supabase.from('Stores').select('*')
      ]);

      if (productsResult.error || priceEntriesResult.error || storesResult.error) {
        throw new Error('Failed to fetch data');
      }

      const products = productsResult.data || [];
      const priceEntries = priceEntriesResult.data || [];
      const stores = storesResult.data || [];

      // Group price entries by store
      const pricesByStore = priceEntries.reduce((acc, entry) => {
        if (!acc[entry.store_id]) {
          acc[entry.store_id] = [];
        }
        acc[entry.store_id].push(entry);
        return acc;
      }, {} as Record<number, any[]>);

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Create summary tab with all data
      const summaryData = products.map(product => {
        const productPrices = priceEntries.filter(entry => entry.product_uid === product.UID);
        const row: any = {
          UID: product.UID,
          UPC: product.UPC,
          Description: product.Description,
          Size: product.Size,
          Brand: product.Brand,
          Category: product.Category,
          Segment: product.Segment,
          'Massy - 29/01/2025': product.Price
        };

        // Add price columns for each store and date
        productPrices.forEach((entry, index) => {
          const store = stores.find(s => s.id === entry.store_id);
          const storeName = store ? store.Stores : `Store ${entry.store_id}`;
          const date = new Date(entry.created_at).toLocaleDateString();
          row[`${storeName} - ${date}`] = entry.price;
        });

        return row;
      });

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

      // Create individual store tabs
      Object.keys(pricesByStore).forEach(storeId => {
        const store = stores.find(s => s.id === parseInt(storeId));
        const storeName = store ? store.Stores : `Store ${storeId}`;
        const storeEntries = pricesByStore[parseInt(storeId)];

        const storeData = products
          .map(product => {
            const productPrices = storeEntries.filter(entry => entry.product_uid === product.UID);
            if (productPrices.length === 0) return null;

            const row: any = {
              UID: product.UID,
              UPC: product.UPC,
              Description: product.Description,
              Size: product.Size,
              Brand: product.Brand,
              Category: product.Category,
              Segment: product.Segment,
              'Massy - 29/01/2025': product.Price
            };

            // Add price columns for each date at this store
            productPrices.forEach((entry, index) => {
              const date = new Date(entry.created_at).toLocaleDateString();
              row[`Price - ${date}`] = entry.price;
            });

            return row;
          })
          .filter(Boolean);

        if (storeData.length > 0) {
          const storeWorksheet = XLSX.utils.json_to_sheet(storeData);
          XLSX.utils.book_append_sheet(workbook, storeWorksheet, storeName.slice(0, 31)); // Excel tab name limit
        }
      });

      // Generate filename with current date
      const now = new Date();
      const filename = `price_data_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    isExporting,
  };
};