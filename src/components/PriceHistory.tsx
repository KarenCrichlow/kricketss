
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { PriceEntry } from '@/hooks/usePriceEntries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

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

  // Prepare data for the chart - sort by date ascending for proper line flow
  const chartData = priceEntries
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((entry) => ({
      date: entry.created_at,
      price: parseFloat(entry.price.toString()),
      store: getStoreName(entry.store_id),
      formattedDate: format(new Date(entry.created_at), 'MMM dd, yyyy')
    }));

  return (
    <div className="space-y-4">
      {/* Price Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Price Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={5}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Historical Prices List */}
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
    </div>
  );
};
