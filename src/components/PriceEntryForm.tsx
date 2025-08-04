import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save } from 'lucide-react';

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
  const [selectedStore, setSelectedStore] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    if (priceValue && selectedStore) {
      onPriceSubmit({ price: priceValue, storeId: selectedStore });
      setPrice('');
      setSelectedStore('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Enter Price
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} - {store.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Price ($)</label>
            <Input
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
            disabled={!price || !selectedStore || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Price'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};