

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  id: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  id,
  options,
  value,
  onChange,
  className = '',
}) => {
  const neonArrowSvg = `<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'><path stroke='%2300FF00' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/></svg>`;
  
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-xs font-medium text-neonCyan-light mb-1 tracking-wider">
        {label.toUpperCase()}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-3 pr-8 py-1.5 bg-neutral-dark border border-neutral-medium rounded-sm shadow-sm 
                   text-neonGreen-light text-sm font-mono appearance-none transition-colors duration-150
                   hover:border-neonGreen-dark
                   focus:outline-none focus:ring-1 focus:ring-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT focus:shadow-neon-green-glow`}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(neonArrowSvg)}")`, 
          backgroundRepeat: 'no-repeat', 
          backgroundPosition: 'right 0.5rem center', 
          backgroundSize: '1.25em 1.25em' 
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-neutral-darker text-neonGreen-light font-mono">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
