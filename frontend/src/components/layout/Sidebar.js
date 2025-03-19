import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  List as ListIcon,
  TextFields as OCRIcon,
  Language as WebIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for collapsible menu sections
  const [openItems, setOpenItems] = useState(true);
  const [openOCR, setOpenOCR] = useState(false);
  const [openScraper, setOpenScraper] = useState(false);
  const [openEcommerce, setOpenEcommerce] = useState(false);
  
  // Toggle menu sections
  const handleItemsClick = () => {
    setOpenItems(!openItems);
  };
  
  const handleOCRClick = () => {
    setOpenOCR(!openOCR);
  };
  
  const handleScraperClick = () => {
    setOpenScraper(!openScraper);
  };
  
  const handleEcommerceClick = () => {
    setOpenEcommerce(!openEcommerce);
  };
  
  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Drawer content
  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2),
          ...theme.mixins.toolbar,
        }}
      >
        <Logo size={32} />
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
          mysilania
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav">
        {/* Dashboard */}
        <ListItem
          button
          component={RouterLink}
          to="/"
          selected={isActive('/')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        {/* Items Section */}
        <ListItem button onClick={handleItemsClick}>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Items" />
          {openItems ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        
        <Collapse in={openItems} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={RouterLink}
              to="/items"
              selected={isActive('/items')}
              sx={{
                pl: 4,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="All Items" />
            </ListItem>
            
            <ListItem
              button
              component={RouterLink}
              to="/items/create"
              selected={isActive('/items/create')}
              sx={{
                pl: 4,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Add New Item" />
            </ListItem>
          </List>
        </Collapse>
        
        {/* OCR Section */}
        <ListItem button onClick={handleOCRClick}>
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText primary="OCR" />
          {openOCR ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        
        <Collapse in={openOCR} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={RouterLink}
              to="/ocr/upload"
              selected={isActive('/ocr/upload')}
              sx={{
                pl: 4,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <OCRIcon />
              </ListItemIcon>
              <ListItemText primary="Upload & Extract" />
            </ListItem>
          </List>
        </Collapse>
        
        {/* Web Scraper Section */}
        <ListItem button onClick={handleScraperClick}>
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Web Scraper" />
          {openScraper ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        
        <Collapse in={openScraper} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={RouterLink}
              to="/scraper/search"
              selected={isActive('/scraper/search')}
              sx={{
                pl: 4,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <WebIcon />
              </ListItemIcon>
              <ListItemText primary="Search & Scrape" />
            </ListItem>
          </List>
        </Collapse>
        
        {/* eCommerce Section */}
        <ListItem button onClick={handleEcommerceClick}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="eCommerce" />
          {openEcommerce ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        
        <Collapse in={openEcommerce} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={RouterLink}
              to="/ecommerce/batch"
              selected={isActive('/ecommerce/batch')}
              sx={{
                pl: 4,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Listings" />
            </ListItem>
          </List>
        </Collapse>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Profile */}
        <ListItem
          button
          component={RouterLink}
          to="/profile"
          selected={isActive('/profile')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        
        {/* Settings */}
        <ListItem
          button
          component={RouterLink}
          to="/settings"
          selected={isActive('/settings')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        
        {/* Admin section */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText
                primary="Admin"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
            
            <ListItem
              button
              component={RouterLink}
              to="/admin/users"
              selected={isActive('/admin/users')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Users" />
            </ListItem>
            
            <ListItem
              button
              component={RouterLink}
              to="/admin/settings"
              selected={isActive('/admin/settings')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="System Settings" />
            </ListItem>
          </>
        )}
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={!isMobile}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
