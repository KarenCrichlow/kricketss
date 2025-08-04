import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  product: any;
  priceEntries: any[];
}

const formatWorksheet = (worksheet: any, data: any[]) => {
  if (!data || data.length === 0) return;
  
  // Get column keys from first row
  const columnKeys = Object.keys(data[0]);
  
  // Auto-fit columns and set font size
  const colWidths: any[] = [];
  
  columnKeys.forEach((key, colIndex) => {
    // Calculate max width for this column
    let maxWidth = key.length; // Header width
    
    data.forEach(row => {
      const cellValue = String(row[key] || '');
      maxWidth = Math.max(maxWidth, cellValue.length);
    });
    
    // Set minimum width of 8 and maximum of 50
    colWidths.push({ wch: Math.min(Math.max(maxWidth + 2, 8), 50) });
  });
  
  worksheet['!cols'] = colWidths;
  
  // Set font to Arial size 10 for all cells
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { t: 's', v: '' };
      }
      
      const cell = worksheet[cellAddress];
      
      // Initialize cell style object
      if (!cell.s) {
        cell.s = {
          font: {
            name: 'Arial',
            sz: 10,
            color: { rgb: '000000' }
          },
          alignment: {
            vertical: 'center',
            horizontal: 'left'
          }
        };
      } else {
        if (!cell.s.font) cell.s.font = {};
        cell.s.font.name = 'Arial';
        cell.s.font.sz = 10;
      }
    }
  }
};

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
          Category: product.Category,
          Segment: product.Segment,
          Brand: product.Brand,
          Description: product.Description,
          Size: product.Size,
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
      
      // Format the summary worksheet
      formatWorksheet(summaryWorksheet, summaryData);
      
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
              Category: product.Category,
              Segment: product.Segment,
              Brand: product.Brand,
              Description: product.Description,
              Size: product.Size,
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
          
          // Format the store worksheet
          formatWorksheet(storeWorksheet, storeData);
          
          XLSX.utils.book_append_sheet(workbook, storeWorksheet, storeName.slice(0, 31)); // Excel tab name limit
        }
      });

      // Generate filename with current date
      const now = new Date();
      const filename = `price_data_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Save file with proper formatting options
      const writeOpts = {
        bookType: 'xlsx' as const,
        type: 'binary' as const,
        cellStyles: true,
        sheetFormat: {
          '!protect': false,
          '!autofilter': { ref: 'A1:Z1000' }
        }
      };
      XLSX.writeFile(workbook, filename, writeOpts);

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