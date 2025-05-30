
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Now accepts Tailwind color classes directly
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'border-neonGreen-DEFAULT' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4', // Adjusted for hacker aesthetic
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex justify-center items-center" aria-label="Loading data...">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};