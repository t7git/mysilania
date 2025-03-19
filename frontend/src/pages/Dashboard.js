import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    recentItems: [],
    ocrCount: 0,
    scrapeCount: 0,
    listingCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be a single API call to get dashboard data
        // For now, we'll simulate with mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalItems: 42,
          recentItems: [
            { id: 1, name: 'Brake Rotor', part_number: 'BR-1234', vehicle_make: 'Toyota', vehicle_model: 'Camry' },
            { id: 2, name: 'Oil Filter', part_number: 'OF-5678', vehicle_make: 'Honda', vehicle_model: 'Accord' },
            { id: 3, name: 'Spark Plug', part_number: 'SP-9012', vehicle_make: 'Ford', vehicle_model: 'F-150' },
          ],
          ocrCount: 15,
          scrapeCount: 28,
          listingCount: 10,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prevStats => ({ ...prevStats, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your inventory and activities
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            className="hover-card"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Total Items
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 2 }}>
              {stats.totalItems}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                In your inventory
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            className="hover-card"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderLeft: `4px solid ${theme.palette.info.main}`,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              OCR Scans
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 2 }}>
              {stats.ocrCount}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Images processed
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            className="hover-card"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderLeft: `4px solid ${theme.palette.success.main}`,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Web Scrapes
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 2 }}>
              {stats.scrapeCount}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Data enrichments
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            className="hover-card"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderLeft: `4px solid ${theme.palette.warning.main}`,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              eCommerce Listings
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, mt: 2 }}>
              {stats.listingCount}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Active listings
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} className="hover-card">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem button component={RouterLink} to="/items/create">
                  <ListItemIcon>
                    <AddIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Add New Item" />
                </ListItem>
                <ListItem button component={RouterLink} to="/ocr/upload">
                  <ListItemIcon>
                    <ImageIcon color="info" />
                  </ListItemIcon>
                  <ListItemText primary="Upload & Extract Text" />
                </ListItem>
                <ListItem button component={RouterLink} to="/scraper/search">
                  <ListItemIcon>
                    <SearchIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Search & Scrape Data" />
                </ListItem>
                <ListItem button component={RouterLink} to="/ecommerce/batch">
                  <ListItemIcon>
                    <ShoppingCartIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Create Batch Listings" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {stats.recentItems.length > 0 ? (
                <List>
                  {stats.recentItems.map((item) => (
                    <ListItem
                      key={item.id}
                      button
                      component={RouterLink}
                      to={`/items/${item.id}`}
                      sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
                    >
                      <ListItemIcon>
                        <InventoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.part_number} | ${item.vehicle_make} ${item.vehicle_model}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No items found in your inventory
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/items/create"
                    sx={{ mt: 2 }}
                  >
                    Add Your First Item
                  </Button>
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                component={RouterLink}
                to="/items"
                endIcon={<TrendingUpIcon />}
              >
                View All Items
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
