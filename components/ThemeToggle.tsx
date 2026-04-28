import React from 'react';
import type { Theme } from '../types';
import { SunIcon, MoonIcon } from '../constants';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-brand-light dark:text-yellow-300 hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary dark:focus:ring-offset-brand-primary-dark focus:ring-white transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};
