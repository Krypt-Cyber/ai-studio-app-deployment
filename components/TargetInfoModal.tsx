

import React, { useState } from 'react';
import { PentestTargetInfo } from '../types';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';

interface TargetInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetInfo: PentestTargetInfo) => void;
  productName: string;
}

export const TargetInfoModal: React.FC<TargetInfoModalProps> = ({ isOpen, onClose, onSubmit, productName }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [targetIp, setTargetIp] = useState('');
  const [scopeNotes, setScopeNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!targetUrl && !targetIp) {
      setError('Either Target URL or Target IP Address must be provided.');
      return;
    }
    setError('');
    onSubmit({ targetUrl, targetIp, scopeNotes });
    // Clear form for next time
    setTargetUrl('');
    setTargetIp('');
    setScopeNotes('');
  };

  return (
    <div 
        className="fixed inset-0 bg-neutral-darkest/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
    >
      <div 
        className="bg-neutral-dark border-2 border-neonGreen-DEFAULT shadow-2xl shadow-neonGreen-glow rounded-md p-6 w-full max-w-lg animate-slideInFromTop relative scanline-container overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scanline-overlay opacity-20"></div> {/* Persistent scanline */}
        <div className="relative z-10"> {/* Content above scanline */}
            <h2 className="text-xl font-bold text-neonGreen-DEFAULT mb-1">Target Specification Required</h2>
            <p className="text-xs text-neonCyan-light mb-4">
            For Cyber Security Service: <span className="font-semibold text-neonGreen-light">{productName}</span>
            </p>
            
            {error && <p className="text-xs text-neonMagenta-DEFAULT p-2 bg-neonMagenta-DEFAULT/10 border border-neonMagenta-dark rounded-sm mb-3">{error}</p>}

            <div className="space-y-3">
            <TextInput
                label="Target URL (e.g., https://example.com)"
                id="target-url"
                value={targetUrl}
                onChange={setTargetUrl}
                placeholder="Enter target website URL"
            />
            <p className="text-center text-xs text-neutral-medium my-1">OR</p>
            <TextInput
                label="Target IP Address (e.g., 192.168.1.100)"
                id="target-ip"
                value={targetIp}
                onChange={setTargetIp}
                placeholder="Enter target IP address"
            />
            <TextInput
                label="Scope Notes / Specific Instructions (Optional)"
                id="scope-notes"
                type="textarea"
                value={scopeNotes}
                onChange={setScopeNotes}
                placeholder="e.g., Focus on login functionality, exclude /blog section..."
                rows={3}
            />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline" className="border-neonMagenta-DEFAULT text-neonMagenta-DEFAULT hover:bg-neonMagenta-DEFAULT hover:text-black">
                CANCEL PROTOCOL
            </Button>
            <Button onClick={handleSubmit} variant="primary">
                SUBMIT TARGET & INITIATE
            </Button>
            </div>
            <p className="text-center text-[0.7rem] text-neutral-medium mt-4">
                Ensure you have explicit authorization to test the specified target. Unauthorized testing is illegal.
            </p>
        </div>
      </div>
    </div>
  );
};
