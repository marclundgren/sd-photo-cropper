import React, { useState, useEffect } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

type Theme = 'light' | 'dark';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check for system preference on component mount
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemPreference);

    // Apply the theme
    document.documentElement.setAttribute('data-theme', systemPreference);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
};

export default ThemeSwitcher;