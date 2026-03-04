
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'crystal' | 'sage' | 'plum' | 'midnight';

interface ThemeColors {
  primary: string;
  dark: string;
  light: string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  crystal: {
    primary: '#3B9AF5',
    dark: '#257CE0',
    light: '#D7EFFF'
  },
  sage: {
    primary: '#6E7C5A',
    dark: '#556147',
    light: '#AEB8A0'
  },
  plum: {
    primary: '#C8568C',
    dark: '#8B2B54',
    light: '#DA7EAB'
  },
  midnight: {
    primary: '#64748B',
    dark: '#475569',
    light: '#94A3B8'
  }
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('crystal');

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
