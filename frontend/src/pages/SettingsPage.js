import React from 'react';
import { Box, Typography, Switch, FormControlLabel, Paper } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';

const SettingsPage = () => {
  const { mode, toggleColorMode } = useThemeMode();

  return (
    <div className="container mx-auto px-4 py-12">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary' }}>
          Settings
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
            Appearance
          </Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />}
            label="Dark Mode"
          />
        </Box>

        {/* Add other settings sections here */}

      </Paper>
    </div>
  );
};

export default SettingsPage; 