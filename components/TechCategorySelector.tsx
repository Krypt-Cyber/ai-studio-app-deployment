
import React from 'react';
import { TechOption, TechCategoryKey } from '../types';
import { SelectInput, SelectOption } from './ui/SelectInput';

interface TechCategorySelectorProps {
  categoryKey: TechCategoryKey;
  categoryLabel: string;
  options: TechOption[];
  selectedValue: string;
  onSelect: (categoryKey: TechCategoryKey, optionId: string) => void;
}

export const TechCategorySelector: React.FC<TechCategorySelectorProps> = ({
  categoryKey,
  categoryLabel,
  options,
  selectedValue,
  onSelect,
}) => {
  const selectOptions: SelectOption[] = [
    { value: '', label: `// NO ${categoryLabel.toUpperCase()} MODULE SELECTED //` },
    ...options.map(opt => ({ value: opt.id, label: opt.name })),
  ];

  const handleChange = (value: string) => {
    onSelect(categoryKey, value);
  };

  return (
    <div className="p-3 border border-neutral-medium rounded-sm bg-neutral-darkest shadow-sm">
      <SelectInput
        id={`tech-category-${categoryKey}`}
        label={categoryLabel.toUpperCase()} // Themed label
        options={selectOptions}
        value={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};