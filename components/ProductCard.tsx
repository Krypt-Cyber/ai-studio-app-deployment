
import React, { useState } from 'react';
import { Product } from '../types';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 8.25h3M12 3v5.25m0 0l-1.125-1.125M12 8.25l1.125-1.125M3.75 7.5h16.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Service Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 9.75V4.5m0 15V12m0 0a2.25 2.25 0 00-2.25-2.25M12 12a2.25 2.25 0 002.25-2.25M12 12a2.25 2.25 0 01-2.25 2.25M12 12a2.25 2.25 0 012.25 2.25m0 0h1.5a2.25 2.25 0 002.25-2.25M16.5 12a2.25 2.25 0 00-2.25 2.25m0 0V18m2.25-3.75a2.25 2.25 0 012.25-2.25M16.5 12a2.25 2.25 0 012.25-2.25m0 0H18m-2.25 3.75a2.25 2.25 0 00-2.25 2.25M7.5 12a2.25 2.25 0 002.25 2.25m0 0V18m-2.25-3.75a2.25 2.25 0 01-2.25-2.25M7.5 12a2.25 2.25 0 01-2.25-2.25m0 0H6M9.75 6a2.25 2.25 0 00-2.25-2.25M9.75 6a2.25 2.25 0 012.25-2.25m0 0V3m2.25 3a2.25 2.25 0 002.25-2.25M14.25 6a2.25 2.25 0 01-2.25-2.25m0 0V3" />
  </svg>
);


export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCartClick = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className="bg-neutral-dark border border-neutral-medium rounded-md shadow-lg overflow-hidden flex flex-col transition-all duration-200 hover:shadow-neon-cyan-glow hover:border-neonCyan-dark">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-neutral-darker flex items-center justify-center">
          {product.productType === 'service' ? 
            <CogIcon className="w-16 h-16 text-neutral-medium" /> :
            <PackageIcon className="w-16 h-16 text-neutral-medium" />
          }
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-neonGreen-DEFAULT truncate mr-2" title={product.name}>{product.name}</h3>
            {product.productType === 'service' && (
                <span className="text-xs bg-neonMagenta-dark text-neonMagenta-light px-1.5 py-0.5 rounded-sm font-mono whitespace-nowrap">
                    SERVICE
                </span>
            )}
        </div>
        <p className="text-xs text-neonCyan-light mb-1">{product.category || 'Uncategorized Gear'}</p>
        <p className="text-sm text-neutral-light flex-grow mb-3 leading-relaxed">{product.description.substring(0,100)}{product.description.length > 100 ? '...' : ''}</p>
        
        <div className="mt-auto">
          <p className="text-xl font-bold text-neonGreen-light mb-3">${product.price.toFixed(2)}</p>
          <div className="flex items-center space-x-2 mb-3">
            <label htmlFor={`quantity-${product.id}`} className="text-xs text-neonCyan-light">QTY:</label>
            <input
              type="number"
              id={`quantity-${product.id}`}
              name={`quantity-${product.id}`}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              className="w-16 px-2 py-1 bg-neutral-darkest border border-neutral-medium rounded-sm text-neonGreen-light text-sm focus:ring-1 focus:ring-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT"
            />
          </div>
          <Button onClick={handleAddToCartClick} variant="primary" size="md" className="w-full">
            ADD TO CARRIER
          </Button>
        </div>
      </div>
    </div>
  );
};
