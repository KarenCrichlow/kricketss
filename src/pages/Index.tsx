import { useState } from 'react';
import { UPCScanner } from '@/components/UPCScanner';
import { ProductInfo } from '@/components/ProductInfo';
import { useProducts } from '@/hooks/useProducts';
import { ShoppingCart } from 'lucide-react';

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const { findProductByUPC, isLoading: productLoading } = useProducts();

  const handleUPCSubmit = async (upc: string) => {
    const product = await findProductByUPC(upc);
    if (product) {
      setCurrentProduct(product);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Kricket</h1>
          </div>
          <p className="text-sm text-muted-foreground">Price Collection App</p>
        </div>

        <div className="space-y-6">
          <UPCScanner 
            onUPCSubmit={handleUPCSubmit}
            isLoading={productLoading}
          />

          {currentProduct && (
            <ProductInfo product={currentProduct} />
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;