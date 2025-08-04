import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, Search } from 'lucide-react';

interface UPCScannerProps {
  onUPCSubmit: (upc: string) => void;
  isLoading?: boolean;
}

export const UPCScanner = ({ onUPCSubmit, isLoading }: UPCScannerProps) => {
  const [upc, setUPC] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upc.trim()) {
      onUPCSubmit(upc.trim());
      setUPC('');
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
              <Button type="button" variant="outline" size="icon">
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