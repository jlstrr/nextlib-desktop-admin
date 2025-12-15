import React from 'react';

type SpinnerOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function SpinnerOverlay({ visible, message }: SpinnerOverlayProps) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl px-6 py-5 shadow-lg border border-gray-200">
        <span className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3" />
        <div className="text-sm font-medium text-gray-800">{message || 'Loading...'}</div>
      </div>
    </div>
  );
}

