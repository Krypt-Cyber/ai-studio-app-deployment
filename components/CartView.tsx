
import React from 'react';
import { CartItem, ActiveView } from '../types';
import { Button } from './ui/Button';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  cartTotal: number;
  setActiveView: (view: ActiveView) => void;
  onConfirmAcquisition: () => void; // New prop
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.492 3.004 1.318l.752.752c.414.414.963.632 1.528.632h3.536c.565 0 1.114-.218 1.528-.632l.752-.752c.761-.826 1.851-1.318 3.004-1.318m0 0c.342.052.682.107 1.022.166" />
  </svg>
);

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 8.25h3M12 3v5.25m0 0l-1.125-1.125M12 8.25l1.125-1.125M3.75 7.5h16.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 9.75V4.5m0 15V12m0 0a2.25 2.25 0 00-2.25-2.25M12 12a2.25 2.25 0 002.25-2.25M12 12a2.25 2.25 0 01-2.25 2.25M12 12a2.25 2.25 0 012.25 2.25m0 0h1.5a2.25 2.25 0 002.25-2.25M16.5 12a2.25 2.25 0 00-2.25 2.25m0 0V18m2.25-3.75a2.25 2.25 0 012.25-2.25M16.5 12a2.25 2.25 0 012.25-2.25m0 0H18m-2.25 3.75a2.25 2.25 0 00-2.25 2.25M7.5 12a2.25 2.25 0 002.25 2.25m0 0V18m-2.25-3.75a2.25 2.25 0 01-2.25-2.25M7.5 12a2.25 2.25 0 01-2.25-2.25m0 0H6M9.75 6a2.25 2.25 0 00-2.25-2.25M9.75 6a2.25 2.25 0 012.25-2.25m0 0V3m2.25 3a2.25 2.25 0 002.25-2.25M14.25 6a2.25 2.25 0 01-2.25-2.25m0 0V3" />
  </svg>
);


export const CartView: React.FC<CartViewProps> = ({ 
    cartItems, 
    onUpdateQuantity, 
    onRemoveItem, 
    cartTotal, 
    setActiveView,
    onConfirmAcquisition 
}) => {
  
  const handleQuantityChange = (productId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 0) { 
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onConfirmAcquisition(); // Call the App.tsx handler
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold text-neonGreen-DEFAULT mb-4">CARRIER IS EMPTY</h1>
        <p className="text-neutral-light mb-6">No assets selected for acquisition. Return to store to procure items.</p>
        <Button onClick={() => setActiveView('shop')} variant="primary" size="lg">
          RETURN TO SECURE STORE
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-neonGreen-DEFAULT my-6 text-center">CARRIER CONTENTS // Review Acquisition Manifest</h1>
      
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.productId} className="flex items-center justify-between p-4 bg-neutral-dark border border-neutral-medium rounded-md shadow-md">
            <div className="flex items-center space-x-3 flex-grow">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-sm border border-neutral-darker" />
              ) : (
                <div className="w-16 h-16 bg-neutral-darker flex items-center justify-center rounded-sm border border-neutral-darker">
                    {item.productType === 'service' ? 
                        <CogIcon className="w-8 h-8 text-neutral-medium"/> :
                        <PackageIcon className="w-8 h-8 text-neutral-medium"/>
                    }
                </div>
              )}
              <div>
                <h2 className="text-md font-semibold text-neonGreen-light truncate max-w-xs" title={item.name}>{item.name}</h2>
                <p className="text-xs text-neonCyan-light">${item.price.toFixed(2)} ea.</p>
                 {item.productType === 'service' && (
                    <span className="text-[0.65rem] bg-neonMagenta-dark text-neonMagenta-light px-1 py-0.5 rounded-sm font-mono mt-0.5 inline-block">
                        SERVICE PROTOCOL
                    </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 mx-4">
              <Button onClick={() => handleQuantityChange(item.productId, item.quantity, -1)} variant="stealth" size="sm" className="px-1.5 py-0.5 text-lg leading-none" disabled={item.quantity <= 1}>-</Button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.productId, Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
                className="w-12 px-1 py-0.5 text-center bg-neutral-darkest border border-neutral-medium rounded-sm text-neonGreen-light text-sm focus:ring-1 focus:ring-neonGreen-DEFAULT"
                aria-label={`Quantity for ${item.name}`}
              />
              <Button onClick={() => handleQuantityChange(item.productId, item.quantity, 1)} variant="stealth" size="sm" className="px-1.5 py-0.5 text-lg leading-none">+</Button>
            </div>

            <p className="text-md font-semibold text-neonGreen-light w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
            
            <Button onClick={() => onRemoveItem(item.productId)} variant="danger" size="sm" className="ml-4 p-1.5" aria-label={`Remove ${item.name} from cart`}>
              <TrashIcon className="w-4 h-4"/>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-neutral-dark border-t-2 border-neonGreen-DEFAULT rounded-md flex flex-col sm:flex-row justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-neonGreen-DEFAULT">TOTAL MANIFEST VALUE:</h2>
            <p className="text-2xl font-bold text-neonGreen-light">${cartTotal.toFixed(2)}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
            <Button onClick={() => setActiveView('shop')} variant="outline" size="lg">
            CONTINUE PROCUREMENT
            </Button>
            <Button onClick={handleCheckout} variant="primary" size="lg" className="shadow-neon-green-glow">
            INITIATE ACQUISITION
            </Button>
        </div>
      </div>
       <p className="text-center text-xs text-neutral-medium mt-8">
        WARNING: All acquisitions are monitored. Ensure proper authorization.
      </p>
    </div>
  );
};
