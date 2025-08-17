import { useState, useMemo } from 'react';
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
  selectedProduct?: Product | null;
}

export const ProductSelector = ({ products, onProductSelect, isLoading, selectedProduct: externalSelectedProduct }: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const selectedProduct = externalSelectedProduct;

  // Sort products alphabetically by description
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const descA = a.Description || '';
      const descB = b.Description || '';
      return descA.localeCompare(descB);
    });
  }, [products]);

  const handleProductSelect = (product: Product) => {
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
                className="w-full justify-between h-auto min-h-[2.5rem] bg-white"
                disabled={isLoading}
              >
                {selectedProduct ? (
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-foreground">{selectedProduct.Description || 'No Description'}</span>
                    {(selectedProduct.Brand || selectedProduct.Size) && (
                      <span className="text-sm text-muted-foreground">
                        {[selectedProduct.Brand, selectedProduct.Size].filter(Boolean).join(' - ')}
                      </span>
                    )}
                  </div>
                ) : (
                  "Select a product..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover text-popover-foreground z-50" align="start">
              <Command
                filter={(value, search) => {
                  const searchTerm = search.toLowerCase();
                  const productText = value.toLowerCase();
                  // Check if the product text contains the search term as a continuous string
                  return productText.includes(searchTerm) ? 1 : 0;
                }}
              >
                <CommandInput placeholder="Type to search products..." />
                <CommandList>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {sortedProducts.map((product) => (
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
                          <span className="font-medium text-foreground">{product.Description || 'No Description'}</span>
                          {(product.Brand || product.Size || product.UPC) && (
                            <span className="text-sm text-muted-foreground">
                              {[product.Brand, product.Size, product.UPC && `UPC: ${product.UPC}`].filter(Boolean).join(' - ')}
                            </span>
                          )}
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