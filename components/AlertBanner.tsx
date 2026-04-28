import React from 'react';
import { AlertIcon } from '../constants';

interface AlertBannerProps {
  message: string;
  onDismiss: () => void;
  type: 'critical' | 'trend';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, onDismiss, type }) => {
  const styles = {
    critical: {
      bg: 'bg-accent-red dark:bg-accent-red-dark',
      animation: 'animate-pulse'
    },
    trend: {
      bg: 'bg-accent-yellow dark:bg-accent-yellow-dark',
      animation: 'animate-fade-in'
    }
  }
  const style = styles[type] || styles.critical;

  return (
    <div className={`${style.bg} text-white p-3 flex justify-between items-center ${style.animation}`}>
      <div className="flex items-center">
        <AlertIcon />
        <span className="ml-3 font-semibold">{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss alert"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
