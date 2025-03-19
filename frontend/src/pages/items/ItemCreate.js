import React from 'react';
import { Container, Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ItemForm from '../../components/items/ItemForm';

const ItemCreate = () => {
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/items" color="inherit">
            Inventory
          </Link>
          <Typography color="text.primary">Add New Item</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Item
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Fill in the details below to add a new item to your inventory.
        </Typography>
      </Box>
      
      <ItemForm />
    </Container>
  );
};

export default ItemCreate;
