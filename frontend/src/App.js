import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemsList from './pages/items/ItemsList';
import ItemDetail from './pages/items/ItemDetail';
import ItemCreate from './pages/items/ItemCreate';
import ItemEdit from './pages/items/ItemEdit';
import OCRUpload from './pages/ocr/OCRUpload';
import OCRResults from './pages/ocr/OCRResults';
import ScraperSearch from './pages/scraper/ScraperSearch';
import ScraperResults from './pages/scraper/ScraperResults';
import EcommerceListing from './pages/ecommerce/EcommerceListing';
import EcommerceBatch from './pages/ecommerce/EcommerceBatch';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Auth guard component
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          {({ theme: customTheme }) => {
            // Create MUI theme based on custom theme settings
            const muiTheme = createTheme({
              palette: {
                mode: customTheme.darkMode ? 'dark' : 'light',
                primary: {
                  main: customTheme.primaryColor,
                },
                secondary: {
                  main: customTheme.secondaryColor,
                },
                background: {
                  default: customTheme.darkMode ? '#121212' : '#f5f5f5',
                  paper: customTheme.darkMode ? '#1e1e1e' : '#ffffff',
                },
              },
              typography: {
                fontFamily: customTheme.fontFamily,
              },
            });

            return (
              <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes with MainLayout */}
                  <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Inventory routes */}
                    <Route path="/items" element={<ItemsList />} />
                    <Route path="/items/create" element={<ItemCreate />} />
                    <Route path="/items/:id" element={<ItemDetail />} />
                    <Route path="/items/:id/edit" element={<ItemEdit />} />
                    
                    {/* OCR routes */}
                    <Route path="/ocr/upload" element={<OCRUpload />} />
                    <Route path="/ocr/results/:id" element={<OCRResults />} />
                    
                    {/* Scraper routes */}
                    <Route path="/scraper/search" element={<ScraperSearch />} />
                    <Route path="/scraper/results/:id" element={<ScraperResults />} />
                    
                    {/* eCommerce routes */}
                    <Route path="/ecommerce/listing/:id" element={<EcommerceListing />} />
                    <Route path="/ecommerce/batch" element={<EcommerceBatch />} />
                    
                    {/* User routes */}
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ThemeProvider>
            );
          }}
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
