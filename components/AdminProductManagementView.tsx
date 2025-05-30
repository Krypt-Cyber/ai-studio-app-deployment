

import React, { useState, useEffect } from 'react';
import { Product, ProductFormState, ProductType, DigitalAssetOutputFormat, DigitalAssetConfig } from '../types';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { SelectInput, SelectOption } from './ui/SelectInput';
import { LoadingSpinner } from './LoadingSpinner';
import { PRODUCT_TYPES, DIGITAL_PRODUCT_OUTPUT_FORMATS } from '../constants';

interface AdminProductManagementViewProps {
  products: Product[];
  onAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>; // Changed type
  onUpdateProduct: (productData: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

const initialFormState: ProductFormState = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  stock: 0,
  category: '',
  productType: 'digital', 
  serviceRequiresTarget: false,
  generationPrompt: '', // Added
  outputFormat: 'markdown', // Added, default
};

export const AdminProductManagementView: React.FC<AdminProductManagementViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormState({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl || '',
        stock: editingProduct.stock || 0,
        category: editingProduct.category || '',
        productType: editingProduct.productType || 'digital',
        serviceRequiresTarget: editingProduct.productType === 'service' ? editingProduct.serviceConfig?.requiresTargetInfo || false : false,
        generationPrompt: editingProduct.productType === 'digital' ? editingProduct.digitalAssetConfig?.generationPrompt || '' : '',
        outputFormat: editingProduct.productType === 'digital' ? editingProduct.digitalAssetConfig?.outputFormat || 'markdown' : 'markdown',
      });
    } else {
      setFormState(initialFormState);
    }
  }, [editingProduct]);

  const handleInputChange = (field: keyof ProductFormState, value: string | number | boolean | DigitalAssetOutputFormat) => {
    if (field === 'price' || field === 'stock') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
             setFormState(prev => ({ ...prev, [field]: numValue }));
        } else if (value === '') {
            setFormState(prev => ({ ...prev, [field]: field === 'price' ? 0 : 0 }));
        }
    } else if (field === 'productType') {
        const newType = value as ProductType;
        setFormState(prev => ({ 
            ...prev, 
            productType: newType,
            serviceRequiresTarget: newType === 'service' ? prev.serviceRequiresTarget : false,
            generationPrompt: newType === 'digital' ? prev.generationPrompt : '',
            outputFormat: newType === 'digital' ? prev.outputFormat : 'markdown'
        }));
    } else if (field === 'serviceRequiresTarget' && typeof value === 'boolean') {
        setFormState(prev => ({ ...prev, serviceRequiresTarget: value }));
    } else if (field === 'outputFormat') {
        setFormState(prev => ({ ...prev, outputFormat: value as DigitalAssetOutputFormat }));
    }
     else {
        setFormState(prev => ({ ...prev, [field]: value as string }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const productData: Product = {
        id: formState.id || `prod_temp_${Date.now()}`, 
        name: formState.name,
        description: formState.description,
        price: Number(formState.price) || 0,
        imageUrl: formState.imageUrl,
        stock: Number(formState.stock) || 0,
        category: formState.category,
        productType: formState.productType,
        serviceConfig: formState.productType === 'service' 
            ? { requiresTargetInfo: formState.serviceRequiresTarget } 
            : undefined,
        digitalAssetConfig: formState.productType === 'digital' && formState.generationPrompt
            ? { 
                generationPrompt: formState.generationPrompt, 
                outputFormat: formState.outputFormat || 'markdown'
              } 
            : undefined,
    };
    
    try {
      if (editingProduct) {
        await onUpdateProduct(productData);
        alert('Asset metadata matrix updated.');
      } else {
        const { id: tempId, ...productDataForAdd } = productData;
        await onAddProduct(productDataForAdd);
        alert('New asset registered in system.');
      }
      setEditingProduct(null);
      setFormState(initialFormState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error during asset management.';
      setError(message);
      alert(`Asset management failure: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('CONFIRM: Terminate asset record? This action is irreversible.')) {
      setIsLoading(true);
      setError(null);
      try {
        await onDeleteProduct(productId);
        alert('Asset record purged from system.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error during asset termination.';
        setError(message);
        alert(`Asset termination failure: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormState(initialFormState);
    setError(null);
  };
  
  const productTypeOptions: SelectOption[] = PRODUCT_TYPES.map(pt => ({ value: pt.value, label: pt.label }));
  const outputFormatOptions: SelectOption[] = DIGITAL_PRODUCT_OUTPUT_FORMATS.map(of => ({value: of.value, label: of.label}));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-neonGreen-DEFAULT mb-6 text-center">
        <span className="typing-text animate-typing">ASSET MANAGEMENT CONSOLE</span>
        <span className="typing-caret"></span>
      </h1>
      
      {error && <p className="mb-4 text-center text-neonMagenta-light p-2 bg-neonMagenta-dark/30 border border-neonMagenta-dark rounded-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-6 bg-neutral-dark border-2 border-neutral-medium rounded-md shadow-xl space-y-4 relative scanline-container overflow-hidden">
        <div className="scanline-overlay opacity-20"></div>
        <div className="relative z-10"> {/* Content wrapper */}
            <h2 className="text-xl font-semibold text-neonCyan-DEFAULT mb-3">{editingProduct ? `EDIT ASSET: ${editingProduct.name}` : 'REGISTER NEW ASSET'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Asset Name / Codename" id="name" value={formState.name} onChange={(val) => handleInputChange('name', val)} />
            <TextInput label="Category / Classification" id="category" value={formState.category || ''} onChange={(val) => handleInputChange('category', val)} />
            </div>

            <TextInput label="Description / Dossier" id="description" type="textarea" value={formState.description} onChange={(val) => handleInputChange('description', val)} rows={3} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput label="Price (USD)" id="price" type="number" value={formState.price} onChange={(val) => handleInputChange('price', val)} step="0.01" />
            <TextInput label="Stock Quantity (0 for N/A)" id="stock" type="number" value={formState.stock || 0} onChange={(val) => handleInputChange('stock', val)} step="1" />
            <SelectInput label="Asset Type" id="productType" options={productTypeOptions} value={formState.productType} onChange={(val) => handleInputChange('productType', val as ProductType)} />
            </div>
            
            <TextInput label="Image URL (Optional)" id="imageUrl" value={formState.imageUrl || ''} onChange={(val) => handleInputChange('imageUrl', val)} placeholder="https://example.com/image.png"/>

            {formState.productType === 'service' && (
                <div className="p-3 border border-neonMagenta-dark bg-neonMagenta-DEFAULT/10 rounded-sm mt-2">
                    <label htmlFor="serviceRequiresTarget" className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="serviceRequiresTarget"
                            checked={formState.serviceRequiresTarget}
                            onChange={(e) => handleInputChange('serviceRequiresTarget', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-neonMagenta-DEFAULT bg-neutral-dark border-neutral-medium focus:ring-neonMagenta-DEFAULT rounded-sm"
                        />
                        <span className="text-sm text-neonMagenta-light">Service Requires Target Information Input by User</span>
                    </label>
                </div>
            )}

            {formState.productType === 'digital' && (
            <div className="p-3 border border-neonCyan-dark bg-neonCyan-DEFAULT/10 rounded-sm mt-2 space-y-3">
                <p className="text-xs text-neonCyan-light">// Configure AI-Generated Digital Asset</p>
                <TextInput 
                label="AI Generation Prompt" 
                id="generationPrompt" 
                type="textarea" 
                value={formState.generationPrompt || ''} 
                onChange={(val) => handleInputChange('generationPrompt', val)} 
                rows={4}
                placeholder="Enter the detailed prompt for the AI to generate the asset..."
                />
                <SelectInput 
                label="Output Format" 
                id="outputFormat" 
                options={outputFormatOptions} 
                value={formState.outputFormat || 'markdown'} 
                onChange={(val) => handleInputChange('outputFormat', val as DigitalAssetOutputFormat)} 
                />
            </div>
            )}

            <div className="flex justify-end space-x-3 pt-3">
            {editingProduct && (
                <Button type="button" onClick={handleCancelEdit} variant="outline" className="border-neonMagenta-DEFAULT text-neonMagenta-DEFAULT hover:text-black hover:bg-neonMagenta-DEFAULT">
                CANCEL EDIT
                </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isLoading} className="shadow-neon-green-glow">
                {editingProduct ? 'UPDATE ASSET RECORD' : 'REGISTER ASSET'}
            </Button>
            </div>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-neonCyan-DEFAULT mb-4">EXISTING ASSET INVENTORY</h2>
        {products.length === 0 ? (
          <p className="text-neutral-medium">No assets found in system inventory.</p>
        ) : (
          <div className="overflow-x-auto bg-neutral-darker p-1 border border-neutral-dark rounded-md shadow-lg">
            <table className="w-full min-w-max text-xs text-left">
              <thead className="border-b-2 border-neonGreen-dark">
                <tr>
                  <th className="p-2 text-neonGreen-light">Name</th>
                  <th className="p-2 text-neonGreen-light">Type</th>
                  <th className="p-2 text-neonGreen-light">Category</th>
                  <th className="p-2 text-neonGreen-light text-right">Price</th>
                  <th className="p-2 text-neonGreen-light text-right">Stock</th>
                  <th className="p-2 text-neonGreen-light text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-neutral-dark hover:bg-neutral-dark/70 transition-colors relative scanline-container scanline-overlay"
                      style={{'--scanline-color': 'rgba(0, 255, 0, 0.02)'} as React.CSSProperties}
                  >
                    <td className="p-2 text-neonGreen-light whitespace-nowrap truncate max-w-xs relative z-[1]" title={product.name}>{product.name}</td>
                    <td className="p-2 text-neutral-light whitespace-nowrap relative z-[1]">{product.productType.toUpperCase()}</td>
                    <td className="p-2 text-neutral-light whitespace-nowrap truncate max-w-xs relative z-[1]" title={product.category}>{product.category}</td>
                    <td className="p-2 text-neutral-light text-right relative z-[1]">${product.price.toFixed(2)}</td>
                    <td className="p-2 text-neutral-light text-right relative z-[1]">{product.stock === Infinity ? '∞' : product.stock}</td>
                    <td className="p-2 text-center whitespace-nowrap relative z-[1]">
                      <Button onClick={() => handleEdit(product)} variant="outline" size="sm" className="mr-1 px-1.5 py-0.5 border-neonCyan-DEFAULT text-neonCyan-light hover:text-black hover:bg-neonCyan-DEFAULT">
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(product.id)} variant="danger" size="sm" className="px-1.5 py-0.5">
                        Purge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
