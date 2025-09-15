import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type AccentColor = 'blue' | 'purple' | 'green' | 'red';

const THEME_KEY = 'playsong-theme';
const ACCENT_KEY = 'playsong-accent';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as Theme) || 'dark';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const stored = localStorage.getItem(ACCENT_KEY);
    return (stored as AccentColor) || 'blue';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const accentColors = {
      blue: {
        accent: '195 100% 60%',
        'accent-hover': '195 100% 55%',
        'progress-fill': '195 100% 60%'
      },
      purple: {
        accent: '270 100% 70%',
        'accent-hover': '270 100% 65%',
        'progress-fill': '270 100% 70%'
      },
      green: {
        accent: '120 100% 50%',
        'accent-hover': '120 100% 45%',
        'progress-fill': '120 100% 50%'
      },
      red: {
        accent: '0 100% 60%',
        'accent-hover': '0 100% 55%',
        'progress-fill': '0 100% 60%'
      }
    };

    const colors = accentColors[accentColor];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--app-${key}`, value);
    });

    localStorage.setItem(ACCENT_KEY, accentColor);
  }, [accentColor]);

  return {
    theme,
    setTheme,
    accentColor,
    setAccentColor
  };
};