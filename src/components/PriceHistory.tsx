import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { PriceEntry } from '@/hooks/usePriceEntries';

interface Store {
  id: string;
  name: string;
  location: string;
}

interface PriceHistoryProps {
  priceEntries: PriceEntry[];
  stores?: Store[];
}

export const PriceHistory = ({ priceEntries, stores = [] }: PriceHistoryProps) => {
  if (priceEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No price entries found for this product.</p>
        </CardContent>
      </Card>
    );
  }

  const getStoreName = (storeId: number) => {
    const store = stores.find(s => parseInt(s.id) === storeId);
    return store ? store.name : `Store ${storeId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Price History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {priceEntries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getStoreName(entry.store_id)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg font-semibold">
              ${entry.price.toFixed(2)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};