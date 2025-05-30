

import React, { useState } from 'react';
import { AcquiredDigitalAsset } from '../types';
import { Button } from './ui/Button';
import { LoadingSpinner } from './LoadingSpinner';
import { renderEnhancedMarkdown } from '../utils/markdownRenderer';

interface MyDigitalAssetsViewProps {
  acquiredAssets: AcquiredDigitalAsset[];
  currentUsername: string;
}

const StatusPill: React.FC<{ status: AcquiredDigitalAsset['generationStatus'] }> = ({ status }) => {
  const statusStyles: Record<AcquiredDigitalAsset['generationStatus'], {bgColor: string, textColor: string, pulse: boolean}> = {
    completed: { bgColor: 'bg-neonGreen-DEFAULT', textColor: 'text-neutral-darkest', pulse: false },
    pending: { bgColor: 'bg-neonCyan-DEFAULT', textColor: 'text-neutral-darkest', pulse: true },
    failed: { bgColor: 'bg-neonMagenta-DEFAULT', textColor: 'text-neutral-darkest', pulse: false },
  };
  
  const currentStyle = statusStyles[status] || { bgColor: 'bg-neutral-medium', textColor: 'text-neutral-darkest', pulse: false };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${currentStyle.bgColor} ${currentStyle.textColor} ${currentStyle.pulse ? 'animate-pulse' : ''}`}>
      {status.toUpperCase()}
    </span>
  );
};

export const MyDigitalAssetsView: React.FC<MyDigitalAssetsViewProps> = ({ acquiredAssets, currentUsername }) => {
  const [viewingAsset, setViewingAsset] = useState<AcquiredDigitalAsset | null>(null);

  if (acquiredAssets.length === 0) {
    return (
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold text-neonGreen-DEFAULT mb-4">
            <span className="typing-text animate-typing">NO ACQUIRED INTEL PACKETS</span><span className="typing-caret"></span>
        </h1>
        <p className="text-neutral-light">Your digital asset manifest is empty. Procure items from the Secure Store.</p>
      </div>
    );
  }

  if (viewingAsset) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-neutral-darker shadow-2xl rounded-md border-2 border-neonGreen-dark relative scanline-container overflow-hidden">
        <div className="scanline-overlay opacity-25"></div>
        <div className="relative z-10">
            <header className="mb-4 pb-2 border-b border-neutral-dark flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-neonGreen-light">{viewingAsset.productName}</h2>
                <p className="text-xs text-neonCyan-light">Acquired: {new Date(viewingAsset.purchaseDate).toLocaleString()}</p>
            </div>
            <Button onClick={() => setViewingAsset(null)} variant="outline" size="sm" className="border-neonMagenta-DEFAULT text-neonMagenta-DEFAULT hover:bg-neonMagenta-DEFAULT hover:text-black">
                CLOSE INTEL
            </Button>
            </header>
            {viewingAsset.generationStatus === 'completed' && viewingAsset.generatedContent ? (
            viewingAsset.contentFormat === 'markdown' ? (
                <div className="prose prose-sm prose-invert max-w-none text-neutral-light text-sm">
                    {renderEnhancedMarkdown(viewingAsset.generatedContent)}
                </div>
            ) : (
                <pre className="whitespace-pre-wrap text-sm text-neutral-light bg-neutral-dark p-3 rounded-sm border border-neutral-medium">
                {viewingAsset.generatedContent}
                </pre>
            )
            ) : viewingAsset.generationStatus === 'pending' ? (
                <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="text-neonCyan-light mt-3">AI Core is generating your unique digital asset...</p>
                </div>
            ) : viewingAsset.generationStatus === 'failed' ? (
                <div className="p-3 bg-neonMagenta-DEFAULT/20 text-neonMagenta-light border border-neonMagenta-dark rounded-sm">
                    <p className="font-semibold">Asset Generation Failed</p>
                    <p className="text-xs mt-1">{viewingAsset.generationError || "An unknown error occurred during generation."}</p>
                </div>
            ) : (
            <p className="text-neutral-medium">No content available for this asset.</p>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neonGreen-DEFAULT my-6 text-center">
        <span className="typing-text animate-typing">MY ACQUIRED INTEL // Operator: {currentUsername}</span><span className="typing-caret"></span>
      </h1>
      <div className="space-y-4">
        {acquiredAssets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()).map(asset => (
          <div key={asset.id} className="p-4 bg-neutral-dark border border-neutral-medium rounded-md shadow-md relative scanline-container overflow-hidden">
            <div className="scanline-overlay opacity-10"></div>
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                <div>
                    <h2 className="text-lg font-semibold text-neonGreen-light">{asset.productName}</h2>
                    <p className="text-xs text-neutral-light">Acquisition ID: {asset.id}</p>
                    <p className="text-xs text-neutral-light">Date: {new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                    <StatusPill status={asset.generationStatus} />
                </div>
                </div>
                {asset.generationStatus === 'completed' && (
                <div className="mt-3 flex justify-end">
                    <Button onClick={() => setViewingAsset(asset)} variant="primary" size="sm">
                    VIEW INTEL PACKET
                    </Button>
                </div>
                )}
                {asset.generationStatus === 'failed' && asset.generationError && (
                    <p className="text-xs text-neonMagenta-light mt-1 bg-neutral-darker p-1 rounded-sm">
                        Error: {asset.generationError}
                    </p>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
