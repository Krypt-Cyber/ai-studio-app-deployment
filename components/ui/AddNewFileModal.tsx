

import React, { useState } from 'react';
import { Button } from './Button';
import { TextInput } from './TextInput';

interface AddNewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (filePath: string, description?: string) => void;
}

export const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [filePath, setFilePath] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!filePath.trim()) {
      setError('File name / path is required.');
      return;
    }
    setError('');
    onSubmit(filePath.trim(), description.trim());
    // Clear form for next time
    setFilePath('');
    setDescription('');
  };

  return (
    <div 
        className="fixed inset-0 bg-neutral-darkest/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
    >
      <div 
        className="bg-neutral-dark border-2 border-neonCyan-DEFAULT shadow-2xl shadow-neonCyan-glow rounded-md p-6 w-full max-w-md animate-slideInFromTop relative scanline-container overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scanline-overlay opacity-20"></div> {/* Persistent scanline */}
        <div className="relative z-10"> {/* Content above scanline */}
            <h2 className="text-xl font-bold text-neonCyan-DEFAULT mb-4">Add New File to Blueprint</h2>
            
            {error && <p className="text-xs text-neonMagenta-DEFAULT p-2 bg-neonMagenta-DEFAULT/10 border border-neonMagenta-dark rounded-sm mb-3">{error}</p>}

            <div className="space-y-4">
            <TextInput
                label="File Name / Path"
                id="new-file-path"
                value={filePath}
                onChange={setFilePath}
                placeholder="e.g., src/components/NewWidget.tsx"
            />
            <TextInput
                label="Brief Description / Purpose (Optional)"
                id="new-file-description"
                type="textarea"
                value={description}
                onChange={setDescription}
                placeholder="e.g., A reusable UI component for X"
                rows={3}
            />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline" className="border-neonMagenta-DEFAULT text-neonMagenta-DEFAULT hover:bg-neonMagenta-DEFAULT hover:text-black">
                CANCEL
            </Button>
            <Button onClick={handleSubmit} variant="primary" className="bg-neonCyan-DEFAULT hover:bg-neonCyan-light focus:ring-neonCyan-light shadow-neon-cyan-glow">
                CREATE FILE (AI Assisted)
            </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
