import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Package, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setOpen(false);
    onProductSelect(product);
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
          <Label>Choose from existing products</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-[2.5rem]"
                disabled={isLoading}
              >
                {selectedProduct ? (
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{selectedProduct.Description}</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedProduct.Brand} - {selectedProduct.Size}
                    </span>
                  </div>
                ) : (
                  "Select a product..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Type to search products..." />
                <CommandList>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.UID}
                        value={`${product.Description} ${product.Brand} ${product.Size} ${product.UPC}`}
                        onSelect={() => handleProductSelect(product)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProduct?.UID === product.UID ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.Description}</span>
                          <span className="text-sm text-muted-foreground">
                            {product.Brand} - {product.Size} (UPC: {product.UPC})
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};