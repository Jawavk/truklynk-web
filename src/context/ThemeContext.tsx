import { createContext, useContext, useState } from 'react';
import { Theme, themes } from '../config/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const defaultTheme: any = themes[0] || {
    name: 'default',
    primary: '#000',
    secondary: '#fff',
    background: '#fff',
    text: '#000',
  };
  const [currentTheme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
