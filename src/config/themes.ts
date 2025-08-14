export type ThemeColors = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  primaryHover: string;
  primaryBorder: string;
  primaryLight: string;
  primaryDark: string;
  primaryDisabled: string;
  primaryDisabledText: string;
};

export type Theme = {
  name: string;
  colors: ThemeColors;
};

export const themes: Theme[] = [
  {
    name: 'Pink',
    colors: {
      background: '#fdf2f8',
      text: '#831843',
      primary: '#fce7f3',
      secondary: '#fbcfe8',
      accent: '#db2777',
      primaryHover: '#f9a8d4',
      primaryBorder: '#f472b6',
      primaryLight: '#fdf2f8',
      primaryDark: '#831843',
      primaryDisabled: '#fce7f3',
      primaryDisabledText: '#831843',
    },
  },
  {
    name: 'Purple',
    colors: {
      background: '#f3e8ff',
      text: '#5b21b6',
      primary: '#9b4dca',
      secondary: '#d8b4fe',
      accent: '#7c3aed',
      primaryHover: '#7c3aed',
      primaryBorder: '#6d28d9',
      primaryLight: '#f3e8ff',
      primaryDark: '#4c1d95',
      primaryDisabled: '#e9d5ff',
      primaryDisabledText: '#6b21a8',
    },
  },

  {
    name: 'Light',
    colors: {
      background: '#ffffff',
      text: '#0f172a',
      primary: '#f1f5f9',
      secondary: '#e2e8f0',
      accent: '#2563eb',
      primaryHover: '#cbd5e1',
      primaryBorder: '#94a3b8',
      primaryLight: '#f8fafc',
      primaryDark: '#0f172a',
      primaryDisabled: '#e2e8f0',
      primaryDisabledText: '#0f172a',
    },
  },
  {
    name: 'Dark',
    colors: {
      background: '#1a1a1a',
      text: '#ffffff',
      primary: '#1e293b',
      secondary: '#0f172a',
      accent: '#6366f1',
      primaryHover: '#334155',
      primaryBorder: '#334155',
      primaryLight: '#475569',
      primaryDark: '#0f172a',
      primaryDisabled: '#1e293b',
      primaryDisabledText: '#ffffff',
    },
  },
  {
    name: 'Blue',
    colors: {
      background: '#f0f9ff',
      text: '#0c4a6e',
      primary: '#e0f2fe',
      secondary: '#bae6fd',
      accent: '#0284c7',
      primaryHover: '#7dd3fc',
      primaryBorder: '#38bdf8',
      primaryLight: '#f0f9ff',
      primaryDark: '#0c4a6e',
      primaryDisabled: '#e0f2fe',
      primaryDisabledText: '#0c4a6e',
    },
  },
  {
    name: 'Green',
    colors: {
      background: '#f0fdf4',
      text: '#14532d',
      primary: '#dcfce7',
      secondary: '#bbf7d0',
      accent: '#16a34a',
      primaryHover: '#86efac',
      primaryBorder: '#4ade80',
      primaryLight: '#f0fdf4',
      primaryDark: '#14532d',
      primaryDisabled: '#dcfce7',
      primaryDisabledText: '#14532d',
    },
  },
  {
    name: 'Purple',
    colors: {
      background: '#faf5ff',
      text: '#3b0764',
      primary: '#f3e8ff',
      secondary: '#e9d5ff',
      accent: '#9333ea',
      primaryHover: '#d8b4fe',
      primaryBorder: '#c084fc',
      primaryLight: '#faf5ff',
      primaryDark: '#3b0764',
      primaryDisabled: '#f3e8ff',
      primaryDisabledText: '#3b0764',
    },
  },
  {
    name: 'Slate',
    colors: {
      background: '#f8fafc',
      text: '#0f172a',
      primary: '#f1f5f9',
      secondary: '#e2e8f0',
      accent: '#475569',
      primaryHover: '#cbd5e1',
      primaryBorder: '#94a3b8',
      primaryLight: '#f8fafc',
      primaryDark: '#0f172a',
      primaryDisabled: '#f1f5f9',
      primaryDisabledText: '#0f172a',
    },
  },
  {
    name: 'Rose',
    colors: {
      background: '#fff1f2',
      text: '#881337',
      primary: '#ffe4e6',
      secondary: '#fecdd3',
      accent: '#e11d48',
      primaryHover: '#fda4af',
      primaryBorder: '#fb7185',
      primaryLight: '#fff1f2',
      primaryDark: '#881337',
      primaryDisabled: '#ffe4e6',
      primaryDisabledText: '#881337',
    },
  },
  {
    name: 'Orange',
    colors: {
      background: '#fff7ed',
      text: '#7c2d12',
      primary: '#ffedd5',
      secondary: '#fed7aa',
      accent: '#ea580c',
      primaryHover: '#fdba74',
      primaryBorder: '#fb923c',
      primaryLight: '#fff7ed',
      primaryDark: '#7c2d12',
      primaryDisabled: '#ffedd5',
      primaryDisabledText: '#7c2d12',
    },
  },
  {
    name: 'Old Theme',
    colors: {
      background: '#fff',
      text: '#fff',
      primary: '#63275e',
      secondary: '#fbcfe8',
      accent: '#db2777',
      primaryHover: '#fff',
      primaryBorder: '#000',
      primaryLight: '#ffff',
      primaryDark: '#831843',
      primaryDisabled: '#fce7f3',
      primaryDisabledText: '#831843',
    },
  },
];
