import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Default theme settings
  const defaultTheme = {
    darkMode: false,
    primaryColor: '#007bff', // Blue
    secondaryColor: '#6c757d', // Gray
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  };

  // Load theme from localStorage or use default
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(prevTheme => ({
      ...prevTheme,
      darkMode: !prevTheme.darkMode
    }));
  };

  // Set primary color
  const setPrimaryColor = (color) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      primaryColor: color
    }));
  };

  // Set secondary color
  const setSecondaryColor = (color) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      secondaryColor: color
    }));
  };

  // Set font family
  const setFontFamily = (fontFamily) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      fontFamily
    }));
  };

  // Reset theme to default
  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  // Apply a preset theme
  const applyPreset = (presetName) => {
    const presets = {
      default: defaultTheme,
      dark: {
        ...defaultTheme,
        darkMode: true,
        primaryColor: '#90caf9', // Light blue
        secondaryColor: '#f48fb1', // Light pink
      },
      nature: {
        darkMode: false,
        primaryColor: '#4caf50', // Green
        secondaryColor: '#8bc34a', // Light green
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      elegant: {
        darkMode: true,
        primaryColor: '#9c27b0', // Purple
        secondaryColor: '#e91e63', // Pink
        fontFamily: '"Georgia", "Times New Roman", serif',
      },
      minimal: {
        darkMode: false,
        primaryColor: '#212121', // Dark gray
        secondaryColor: '#757575', // Medium gray
        fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      },
    };

    if (presets[presetName]) {
      setTheme(presets[presetName]);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleDarkMode,
        setPrimaryColor,
        setSecondaryColor,
        setFontFamily,
        resetTheme,
        applyPreset,
      }}
    >
      {typeof children === 'function' ? children({ theme }) : children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
