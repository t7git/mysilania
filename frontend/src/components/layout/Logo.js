import React from 'react';
import { Box, useTheme } from '@mui/material';

// Flower of Life logo component
const Logo = ({ size = 40, color, className = '' }) => {
  const theme = useTheme();
  const logoColor = color || theme.palette.primary.main;
  
  // SVG for the Flower of Life pattern (minimalist version)
  return (
    <Box
      className={`flower-of-life-logo ${className}`}
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center circle */}
        <circle cx="50" cy="50" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        
        {/* Surrounding circles */}
        <circle cx="50" cy="25" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="50" cy="75" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="25" cy="50" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="75" cy="50" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="32.5" cy="32.5" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="67.5" cy="32.5" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="32.5" cy="67.5" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        <circle cx="67.5" cy="67.5" r="15" stroke={logoColor} strokeWidth="2" fill="none" />
        
        {/* Outer circle */}
        <circle cx="50" cy="50" r="48" stroke={logoColor} strokeWidth="2" fill="none" />
      </svg>
    </Box>
  );
};

export default Logo;
