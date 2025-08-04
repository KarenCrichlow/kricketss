import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';

interface Product {
  UID: number;
  UPC: string;
  Description: string;
  Brand: string;
  Size: string;
  Category: string;
}

interface ProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductSelector = ({ products, onProductSelect, isLoading }: ProductSelectorProps) => {
  const [selectedProductId, setSelectedProductId] = useState('');

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.UID.toString() === productId);
    if (product) {
      onProductSelect(product);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Select Existing Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="product-select">Choose from existing products</Label>
          <Select 
            value={selectedProductId} 
            onValueChange={handleProductChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.UID} value={product.UID.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.Description}</span>
                    <span className="text-sm text-muted-foreground">
                      {product.Brand} - {product.Size} (UPC: {product.UPC})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};