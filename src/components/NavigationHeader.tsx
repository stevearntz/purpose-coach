'use client';

import React from 'react';
import { ArrowLeft, Share2, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavigationAction {
  type: 'share' | 'print' | 'custom';
  label?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface NavigationHeaderProps {
  backTo?: string;
  backLabel?: string;
  onBack?: () => void;
  rightActions?: NavigationAction[];
  variant?: 'light' | 'dark'; // light for gradient backgrounds, dark for light backgrounds
}

export default function NavigationHeader({ 
  backTo,
  backLabel = 'Back',
  onBack,
  rightActions = [],
  variant = 'light'
}: NavigationHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  const renderAction = (action: NavigationAction, index: number) => {
    const baseClass = action.variant === 'primary' 
      ? 'px-6 py-2.5 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors'
      : variant === 'light'
      ? 'px-6 py-2.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20'
      : 'px-6 py-2.5 bg-white text-iris-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200';

    const icon = action.type === 'share' ? <Share2 className="w-4 h-4" /> 
                : action.type === 'print' ? <Printer className="w-4 h-4" />
                : null;

    return (
      <button
        key={index}
        onClick={action.onClick}
        className={`${baseClass} flex items-center gap-2`}
      >
        {icon}
        {action.label || (action.type === 'share' ? 'Share' : action.type === 'print' ? 'Print' : '')}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 font-medium transition-colors ${
            variant === 'light' 
              ? 'text-white/80 hover:text-white' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="uppercase text-sm tracking-wider">{backLabel}</span>
        </button>

        {rightActions.length > 0 && (
          <div className="flex items-center gap-3">
            {rightActions.map(renderAction)}
          </div>
        )}
      </div>
    </div>
  );
}