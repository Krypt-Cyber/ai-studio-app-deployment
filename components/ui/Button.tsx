import React from 'react';
import { LoadingSpinner } from '../LoadingSpinner'; // Ensure correct path

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'stealth';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-sm focus:outline-none transition-all duration-100 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center group transform active:scale-[0.96]'; // Slightly more scale

  // Energize border animation applied on hover, active state applies subtle glitch to text
  const variantStyles = {
    primary: 'bg-neonGreen-DEFAULT text-black hover:bg-neonGreen-light focus:ring-2 focus:ring-neonGreen-light focus:ring-offset-2 focus:ring-offset-neutral-darkest shadow-md hover:shadow-neon-green-glow hover:animate-energizeBorder active:animate-subtleGlitch',
    secondary: 'bg-neonCyan-DEFAULT text-black hover:bg-neonCyan-light focus:ring-2 focus:ring-neonCyan-light focus:ring-offset-2 focus:ring-offset-neutral-darkest shadow-md hover:shadow-neon-cyan-glow hover:animate-energizeBorder active:animate-subtleGlitch',
    danger: 'bg-neonMagenta-DEFAULT text-black hover:bg-neonMagenta-light focus:ring-2 focus:ring-neonMagenta-light focus:ring-offset-2 focus:ring-offset-neutral-darkest shadow-md hover:shadow-neon-magenta-glow hover:animate-energizeBorder active:animate-subtleGlitch',
    outline: 'bg-transparent border-2 border-neonGreen-DEFAULT text-neonGreen-DEFAULT hover:bg-neonGreen-DEFAULT/30 hover:border-neonGreen-light hover:text-black active:bg-neonGreen-DEFAULT/70 active:text-black focus:ring-2 focus:ring-neonGreen-light focus:ring-offset-2 focus:ring-offset-neutral-darkest hover:shadow-neon-green-glow hover:animate-energizeBorder active:animate-subtleGlitch',
    stealth: 'bg-neutral-dark text-neonGreen-light border border-neutral-medium hover:bg-neutral-medium hover:text-neonGreen-light hover:border-neonGreen-DEFAULT focus:ring-1 focus:ring-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT hover:animate-energizeBorder active:animate-subtleGlitch',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs', 
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };

  let spinnerColor = 'border-black'; 
  if (variant === 'outline' || variant === 'stealth') {
    spinnerColor = 'border-neonGreen-DEFAULT';
  }


  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" color={spinnerColor} />
      ) : null}
      <span className={`${isLoading ? 'ml-2' : ''} ${props.disabled ? '' : 'group-active:animate-subtleGlitch'}`}> {/* Apply glitch to text on active if not disabled */}
        {children}
      </span>
    </button>
  );
};