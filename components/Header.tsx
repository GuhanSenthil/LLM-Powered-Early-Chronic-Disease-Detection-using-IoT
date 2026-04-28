import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-brand-primary dark:bg-brand-primary-dark shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              AI Health Monitoring
            </h1>
            <p className="text-brand-light dark:text-brand-light-dark text-sm">Early Chronic Disease Detection Prototype</p>
        </div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};