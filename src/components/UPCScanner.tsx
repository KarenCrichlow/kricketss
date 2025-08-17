import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

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
          title: 'Camera scanning not available',
          description: 'Barcode scanning only works on mobile devices. Please use manual entry.',
          variant: 'destructive',
        });
        setIsScanning(false);
        return;
      }

      const BS: any = BarcodeScanner as any;
      const hasMethod = (name: string) => typeof BS?.[name] === 'function';

      // Request camera permission (supports both legacy and new APIs)
      let permResult: any = null;
      if (hasMethod('checkPermission')) {
        permResult = await BS.checkPermission({ force: true });
      } else if (hasMethod('checkPermissions')) {
        permResult = await BS.checkPermissions();
      }
      const granted: boolean = !!(permResult?.granted ?? (permResult?.camera === 'granted'));
      if (!granted) {
        toast({
          title: 'Camera permission required',
          description: 'Please grant camera access in Settings to scan barcodes.',
          variant: 'destructive',
        });
        setIsScanning(false);
        return;
      }

      if (hasMethod('prepare')) await BS.prepare();
      if (hasMethod('hideBackground')) await BS.hideBackground();
      document.body.classList.add('barcode-scanner-active');

      let result: any;
      if (hasMethod('startScan')) {
        result = await BS.startScan();
      } else if (hasMethod('scan')) {
        result = await BS.scan();
      }

      if (hasMethod('showBackground')) await BS.showBackground();
      document.body.classList.remove('barcode-scanner-active');

      const scanned = result?.content ?? (result?.hasContent ? result.content : undefined);
      if (scanned) {
        setUPC(scanned);
        onUPCSubmit(scanned);
        toast({
          title: 'Barcode scanned successfully',
          description: `UPC: ${scanned}`,
        });
      }
    } catch (error: any) {
      try {
        const BS: any = BarcodeScanner as any;
        if (typeof BS?.showBackground === 'function') await BS.showBackground();
      } catch {}
      document.body.classList.remove('barcode-scanner-active');
      toast({
        title: 'Scanning failed',
        description: error?.message || 'Could not scan barcode. Please try manual entry.',
        variant: 'destructive',
      });
    } finally {
      try {
        const BS: any = BarcodeScanner as any;
        if (typeof BS?.showBackground === 'function') await BS.showBackground();
      } catch {}
      document.body.classList.remove('barcode-scanner-active');
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
            className="w-full bg-teal-600 hover:bg-teal-700 !text-black font-bold" 
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