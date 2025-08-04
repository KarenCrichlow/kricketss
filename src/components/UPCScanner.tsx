import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      
      // Check permissions
      const permission = await (window as any).BarcodeScanner?.checkPermission();
      
      if (permission?.granted === false) {
        const permissionResult = await (window as any).BarcodeScanner?.requestPermission();
        if (permissionResult?.granted === false) {
          toast({
            title: "Permission required",
            description: "Camera permission is needed to scan barcodes",
            variant: "destructive"
          });
          setIsScanning(false);
          return;
        }
      }

      // Hide background elements
      document.body.style.background = 'transparent';
      
      // Start scanning
      const result = await (window as any).BarcodeScanner?.startScan();
      
      if (result?.hasContent) {
        setUPC(result.content);
        onUPCSubmit(result.content);
        toast({
          title: "Barcode scanned",
          description: `UPC: ${result.content}`
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
      // Restore background
      document.body.style.background = '';
      // Stop scanning
      await (window as any).BarcodeScanner?.stopScan();
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
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={startScan}
                disabled={isScanning || isLoading}
              >
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
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