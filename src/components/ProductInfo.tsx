import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  UID: number;
  UPC: string;
  Description: string;
  Size: string;
  Brand: string;
  Category: string;
  Segment: string;
  Price: string;
}

interface ProductInfoProps {
  product: Product | null;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  if (!product) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Product Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-base">{product.Description}</h3>
          <p className="text-sm text-muted-foreground">UPC: {product.UPC}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {product.Brand && (
            <div>
              <span className="text-xs text-muted-foreground">Brand</span>
              <p className="text-sm font-medium">{product.Brand}</p>
            </div>
          )}
          {product.Size && (
            <div>
              <span className="text-xs text-muted-foreground">Size</span>
              <p className="text-sm font-medium">{product.Size}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {product.Category && (
            <Badge variant="secondary">{product.Category}</Badge>
          )}
          {product.Segment && (
            <Badge variant="outline">{product.Segment}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};