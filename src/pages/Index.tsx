import { useState, useEffect } from 'react';
import { UPCScanner } from '@/components/UPCScanner';
import { ProductSelector } from '@/components/ProductSelector';
import { ProductInfo } from '@/components/ProductInfo';
import { PriceEntryForm } from '@/components/PriceEntryForm';
import { PriceHistory } from '@/components/PriceHistory';
import { useProducts } from '@/hooks/useProducts';
import { usePriceEntries } from '@/hooks/usePriceEntries';
import { useStores } from '@/hooks/useStores';
import { ShoppingCart } from 'lucide-react';

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [products, setProducts] = useState([]);
  
  const { getAllProducts, findProductByUPC, isLoading: productLoading } = useProducts();
  const { savePriceEntry, getPriceHistory, isLoading: priceLoading } = usePriceEntries();
  const { stores, isLoading: storesLoading } = useStores();

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    };
    loadProducts();
  }, []);

  const handleUPCSubmit = async (upc: string) => {
    const product = await findProductByUPC(upc);
    if (product) {
      setCurrentProduct(product);
      const history = await getPriceHistory(product.UID);
      setPriceHistory(history);
    }
  };

  const handleProductSelect = async (product: any) => {
    setCurrentProduct(product);
    const history = await getPriceHistory(product.UID);
    setPriceHistory(history);
  };

  const handlePriceSubmit = async (data: { price: number; storeId: string }) => {
    if (!currentProduct) return;
    
    const success = await savePriceEntry(currentProduct.UID, data.price, data.storeId);
    if (success) {
      const history = await getPriceHistory(currentProduct.UID);
      setPriceHistory(history);
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

          <ProductSelector 
            products={products}
            onProductSelect={handleProductSelect}
            isLoading={productLoading}
          />

          {currentProduct && (
            <>
              <ProductInfo product={currentProduct} />
              
              <PriceEntryForm 
                productUID={currentProduct.UID}
                stores={stores}
                onPriceSubmit={handlePriceSubmit}
                isLoading={priceLoading}
              />

              <PriceHistory priceEntries={priceHistory} stores={stores} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;