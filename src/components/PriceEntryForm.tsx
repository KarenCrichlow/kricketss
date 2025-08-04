import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  location: string;
}

interface PriceEntryFormProps {
  productUID: number;
  stores: Store[];
  onPriceSubmit: (data: { price: number; storeId: string }) => void;
  isLoading?: boolean;
}

export const PriceEntryForm = ({ productUID, stores, onPriceSubmit, isLoading }: PriceEntryFormProps) => {
  const [price, setPrice] = useState('');
  const [storeId, setStoreId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price && storeId) {
      onPriceSubmit({
        price: parseFloat(price),
        storeId: storeId,
      });
      setPrice('');
      setStoreId('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Add Price Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store">Store</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!price || !storeId || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Price'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};