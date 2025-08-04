import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { SearchableCombobox } from '@/components/SearchableCombobox';
import { useUniqueValues } from '@/hooks/useUniqueValues';

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
  const { brands, categories, segments } = useUniqueValues();
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
            <SearchableCombobox
              placeholder="Select or type brand name"
              searchPlaceholder="Search brands..."
              options={brands}
              value={formData.Brand}
              onChange={(value) => handleInputChange('Brand', value)}
              disabled={isLoading}
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
            <SearchableCombobox
              placeholder="Select or type category"
              searchPlaceholder="Search categories..."
              options={categories}
              value={formData.Category}
              onChange={(value) => handleInputChange('Category', value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segment</Label>
            <SearchableCombobox
              placeholder="Select or type segment"
              searchPlaceholder="Search segments..."
              options={segments}
              value={formData.Segment}
              onChange={(value) => handleInputChange('Segment', value)}
              disabled={isLoading}
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