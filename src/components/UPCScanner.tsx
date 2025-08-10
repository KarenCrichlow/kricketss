import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

interface UPCScannerProps {
  onUPCSubmit: (upc: string) => void;
  isLoading?: boolean;
}

export const UPCScanner = ({ onUPCSubmit, isLoading }: UPCScannerProps) => {
  const [upc, setUPC] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upc.trim()) {
      onUPCSubmit(upc.trim());
      setUPC('');
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      
      // Check if we're on a native platform
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "Camera scanning not available",
          description: "Barcode scanning only works on mobile devices. Please use manual entry.",
          variant: "destructive"
        });
        setIsScanning(false);
        return;
      }

      // Import and use the barcode scanner
      const { CapacitorBarcodeScanner } = await import('@capacitor/barcode-scanner');
      
      // Start scanning with options
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: 17, // ALL barcodes
        scanInstructions: 'Point camera at barcode to scan',
        scanButton: true,
        scanText: 'Scan'
      });
      
      if (result.ScanResult) {
        setUPC(result.ScanResult);
        onUPCSubmit(result.ScanResult);
        toast({
          title: "Barcode scanned",
          description: `UPC: ${result.ScanResult}`
        });
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      toast({
        title: "Scanning failed",
        description: "Could not scan barcode. Please try manual entry.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">UPC Code</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter or scan UPC code"
                value={upc}
                onChange={(e) => setUPC(e.target.value)}
                className="flex-1 bg-white"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={startScan}
                disabled={isScanning || isLoading}
                className="bg-white"
              >
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 text-black font-bold" 
            disabled={!upc.trim() || isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Find Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};