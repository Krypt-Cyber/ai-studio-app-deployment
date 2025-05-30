
import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ShopViewProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ products, onAddToCart }) => {
  return (
    <div className="container mx-auto">
      <header className="my-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-neonGreen-DEFAULT tracking-wider">SECURE STORE // Classified Gear & Intel</h1>
        <p className="text-neonCyan-light mt-2 text-sm">Acquire specialized tools and restricted information packets. Handle with discretion.</p>
      </header>
      
      {products.length === 0 ? (
        <p className="text-center text-neutral-medium py-10">No assets currently listed in the Secure Store. Check back later or contact system admin.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
       <p className="text-center text-xs text-neutral-medium mt-12">
        All transactions are final. No refunds. All items are provided "as-is" for "research purposes only".
      </p>
    </div>
  );
};
