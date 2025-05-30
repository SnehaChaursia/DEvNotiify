import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }) => {
  // Default to user's system preference or 'light'
  const [mode, setMode] = useState('light'); // Initial mode

  const colorMode = useMemo(
    () => ({
      // The toggle mode function
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      // The current mode
      mode,
    }),
    [mode],
  );

  // Create a theme instance based on the mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // You can customize your palette for light and dark modes here
          primary: {
            main: mode === 'light' ? '#4f46e5' : '#9a8aff', // Example primary color
          },
          secondary: {
            main: mode === 'light' ? '#f97316' : '#ffb58a', // Example secondary color
          },
          background: {
             default: mode === 'light' ? '#f3f4f6' : '#1a2027', // Example background color
             paper: mode === 'light' ? '#ffffff' : '#2d3748', // Example paper background color
          }
        },
        // You can add other theme customizations here
        typography: {
          fontFamily: ['Inter', 'sans-serif'].join(','),
        },
        components: {
          // Example component overrides
          MuiAppBar: {
            styleOverrides: {
              root: {
                 backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(45, 55, 72, 0.8)',
                 backdropFilter: 'blur(10px)',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            },
          },
          MuiButton: {
             styleOverrides: {
                 root: {
                    textTransform: 'none',
                 }
             }
          }
          // ... other components
        }
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />{/* Normalize CSS and provide a background color */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 