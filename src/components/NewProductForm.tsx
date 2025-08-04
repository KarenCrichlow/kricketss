import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

interface NewProductFormProps {
  upc: string;
  onProductCreate: (productData: {
    UPC: string;
    Description: string;
    Brand: string;
    Size: string;
    Category: string;
    Segment: string;
  }) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export const NewProductForm = ({ upc, onProductCreate, isLoading, onCancel }: NewProductFormProps) => {
  const [formData, setFormData] = useState({
    Description: '',
    Brand: '',
    Size: '',
    Category: '',
    Segment: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Description.trim()) {
      onProductCreate({
        UPC: upc,
        ...formData,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add New Product
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          UPC {upc} not found. Please enter product details:
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              placeholder="Enter product description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.Brand}
              onChange={(e) => handleInputChange('Brand', e.target.value)}
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={formData.Size}
              onChange={(e) => handleInputChange('Size', e.target.value)}
              placeholder="Enter size (e.g., 12 oz, 1 lb)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.Category}
              onChange={(e) => handleInputChange('Category', e.target.value)}
              placeholder="Enter category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segment</Label>
            <Input
              id="segment"
              value={formData.Segment}
              onChange={(e) => handleInputChange('Segment', e.target.value)}
              placeholder="Enter segment"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!formData.Description.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};