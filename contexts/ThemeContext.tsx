
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'glacier' | 'rose' | 'sky' | 'midnight';

interface ThemeColors {
  primary: string;
  dark: string;
  light: string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  glacier: {
    primary: '#80B1D3',
    dark: '#5D8BAE',
    light: '#A7CBE2'
  },
  rose: {
    primary: '#C2458E',
    dark: '#9D3270',
    light: '#E085B5'
  },
  sky: {
    primary: '#87CEEB',
    dark: '#5DADEC',
    light: '#BFE6F7'
  },
  midnight: {
    primary: '#E350A8', // Hot Pink
    dark: '#9543A7',    // Orchid
    light: '#B8E7EA'    // Ice Blue
  }
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('glacier');

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as ThemeName;
    if (savedTheme && THEMES[savedTheme]) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  // Apply CSS variables and data-theme attribute whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEMES[theme];
    
    // Set Theme Attribute for CSS cascading
    document.body.setAttribute('data-theme', theme);

    // Set CSS variables for Primary color logic (used in gradients/buttons)
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.dark);
    root.style.setProperty('--color-primary-light', colors.light);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
