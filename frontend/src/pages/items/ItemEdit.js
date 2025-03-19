import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Breadcrumbs, Link, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ItemForm from '../../components/items/ItemForm';
import axios from 'axios';

const ItemEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/items/${id}`);
        // setItem(response.data);
        
        // For now, we'll simulate with a timeout and mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockItem = {
          id: parseInt(id),
          name: 'Brake Rotor',
          part_number: 'BR-1234',
          vehicle_make: 'Toyota',
          vehicle_model: 'Camry',
          weight: 12.5,
          width: 10.2,
          height: 2.3,
          depth: 10.2,
          color: 'Silver',
          price: 89.99,
          sku: 'BR-1234-TYC',
          description: 'High-performance brake rotor for Toyota Camry. Provides excellent stopping power and heat dissipation. Made from premium materials for durability and long life.',
          notes: 'Compatible with 2018-2022 models. Sold individually, not as a pair.',
          bay: 'A-12',
          item_type: 'Brake System',
          thumbnail_url: null,
          created_at: '2025-01-15T12:00:00Z',
          updated_at: '2025-03-10T09:30:00Z',
        };
        
        setItem(mockItem);
        setError(null);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to fetch item details. Please try again later.');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !item) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            {error || 'Item not found'}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/items">
              Back to Inventory
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }
  
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
          <Link component={RouterLink} to={`/items/${id}`} color="inherit">
            {item.name}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Item: {item.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Update the details for this inventory item.
        </Typography>
      </Box>
      
      <ItemForm itemId={id} initialData={item} />
    </Container>
  );
};

export default ItemEdit;
