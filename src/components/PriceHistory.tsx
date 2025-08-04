import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface PriceEntry {
  id: string;
  price: number;
  collected_at: string;
  store: {
    name: string;
    location: string;
  };
}

interface PriceHistoryProps {
  priceEntries: PriceEntry[];
}

export const PriceHistory = ({ priceEntries }: PriceHistoryProps) => {
  if (priceEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No price entries found for this product
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {priceEntries.map((entry) => (
          <div key={entry.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{entry.store.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.collected_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Badge variant="default" className="text-lg font-bold">
              ${entry.price.toFixed(2)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};