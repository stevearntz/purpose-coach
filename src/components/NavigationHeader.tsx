'use client';

import React from 'react';
import { ArrowLeft, Share2, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ShareButton from './ShareButton';

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
  className?: string; // Additional classes for the wrapper
}

export default function NavigationHeader({ 
  backTo,
  backLabel = 'Back',
  onBack,
  rightActions = [],
  variant = 'light',
  className = ''
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
    // Special handling for share actions - use ShareButton component
    if (action.type === 'share') {
      return (
        <ShareButton
          key={index}
          onShare={action.onClick as () => Promise<string>}
          variant="secondary"
          className={variant === 'light' 
            ? 'px-3 sm:px-6 py-2.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20'
            : 'px-3 sm:px-6 py-2.5 bg-white text-iris-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200'
          }
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">{action.label || 'Share'}</span>
        </ShareButton>
      );
    }

    // Regular button for other actions
    const baseClass = action.variant === 'primary' 
      ? 'px-3 sm:px-6 py-2.5 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors'
      : variant === 'light'
      ? 'px-3 sm:px-6 py-2.5 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20'
      : 'px-3 sm:px-6 py-2.5 bg-white text-iris-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200';

    const icon = action.type === 'print' ? <Printer className="w-4 h-4" /> : null;

    // For Demo button (custom type), show only text
    if (action.type === 'custom' && action.label?.toLowerCase().includes('demo')) {
      return (
        <button
          key={index}
          onClick={action.onClick}
          className={baseClass}
        >
          <span className="sm:hidden uppercase">DEMO</span><span className="hidden sm:inline uppercase">{action.label}</span>
        </button>
      );
    }

    return (
      <button
        key={index}
        onClick={action.onClick}
        className={`${baseClass} flex items-center gap-2 ${action.type === 'print' ? 'hidden sm:flex' : ''}`}
      >
        {icon}
        {action.type === 'print' ? (
          <span className="hidden sm:inline">{action.label || 'Print'}</span>
        ) : (
          <span>{action.label || ''}</span>
        )}
      </button>
    );
  };

  return (
    <div className={`w-full relative z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 h-[5.5rem] flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 font-medium transition-colors py-2 ${
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