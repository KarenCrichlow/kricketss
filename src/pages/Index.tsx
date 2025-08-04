import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UPCScanner } from '@/components/UPCScanner';
import { ProductSelector } from '@/components/ProductSelector';
import { NewProductForm } from '@/components/NewProductForm';
import { ProductInfo } from '@/components/ProductInfo';
import { PriceEntryForm } from '@/components/PriceEntryForm';
import { PriceHistory } from '@/components/PriceHistory';
import { useProducts } from '@/hooks/useProducts';
import { usePriceEntries } from '@/hooks/usePriceEntries';
import { useStores } from '@/hooks/useStores';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Download, LogOut, User, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [pendingUPC, setPendingUPC] = useState('');
  
  const navigate = useNavigate();
  const { user, profile, userRole, loading, signOut, isAuthenticated, isAdmin } = useAuth();
  const { getAllProducts, createProduct, findProductByUPC, isLoading: productLoading } = useProducts();
  const { savePriceEntry, getPriceHistory, isLoading: priceLoading } = usePriceEntries();
  const { stores, isLoading: storesLoading } = useStores();
  const { exportToExcel, isExporting } = useExcelExport();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

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
      setShowNewProductForm(false);
    } else {
      // Product not found, show form to create new product
      setPendingUPC(upc);
      setShowNewProductForm(true);
      setCurrentProduct(null);
      setPriceHistory([]);
    }
  };

  const handleProductCreate = async (productData: any) => {
    const newProduct = await createProduct(productData);
    if (newProduct) {
      setCurrentProduct(newProduct);
      setShowNewProductForm(false);
      setPendingUPC('');
      // Refresh products list
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      // Get price history for new product (will be empty)
      const history = await getPriceHistory(newProduct.UID);
      setPriceHistory(history);
    }
  };

  const handleCancelNewProduct = () => {
    setShowNewProductForm(false);
    setPendingUPC('');
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
      // Reset everything to allow new entry
      setCurrentProduct(null);
      setPriceHistory([]);
      setShowNewProductForm(false);
      setPendingUPC('');
      
      // Refresh products list in case new ones were added
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Kricket$$</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportToExcel}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Excel"}
              </Button>
              {isAdmin && (
                <Button 
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  size="sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button 
                onClick={signOut}
                variant="ghost"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Price Collection App</p>
            {profile && (
              <p className="text-xs text-muted-foreground">
                Welcome, {profile.full_name || profile.email}
                {profile.division && ` • ${profile.division}`}
                {userRole && ` • ${userRole.role}`}
              </p>
            )}
          </div>
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
            selectedProduct={currentProduct}
          />

          {showNewProductForm && (
            <NewProductForm 
              upc={pendingUPC}
              onProductCreate={handleProductCreate}
              onCancel={handleCancelNewProduct}
              isLoading={productLoading}
            />
          )}

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