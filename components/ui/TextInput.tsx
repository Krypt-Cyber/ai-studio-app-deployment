
import React from 'react';

interface TextInputProps {
  label: string;
  id: string;
  value: string | number; // Allow number for type="number"
  onChange: (value: string) => void; // Keep as string for generic handling, parse in component if needed
  placeholder?: string;
  type?: string;
  className?: string;
  step?: string; // For number inputs
  min?: string;  // For number inputs
  disabled?: boolean;
  rows?: number; // For textarea
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  step,
  min,
  disabled = false,
  rows,
}) => {
  const commonProps = {
    id: id,
    name: id,
    value: value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder: placeholder,
    disabled: disabled,
    className: `w-full px-3 py-1.5 bg-neutral-dark border border-neutral-medium rounded-sm shadow-sm placeholder-neutral-medium 
                text-neonGreen-light text-sm font-mono transition-colors duration-150
                hover:border-neonGreen-dark 
                focus:outline-none focus:ring-1 focus:ring-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT focus:shadow-neon-green-glow`,
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-xs font-medium text-neonCyan-light mb-1 tracking-wider">
        {label.toUpperCase()}
      </label>
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={rows || 3}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          step={type === 'number' ? step : undefined}
          min={type === 'number' ? min : undefined}
        />
      )}
    </div>
  );
};
