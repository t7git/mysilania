import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Mock data for dropdowns
const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];
const itemTypes = ['Brake System', 'Engine', 'Transmission', 'Suspension', 'Electrical', 'Exterior', 'Interior', 'Lighting', 'Ignition'];

const ItemForm = ({ itemId, initialData }) => {
  const navigate = useNavigate();
  const isEditMode = Boolean(itemId);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    part_number: '',
    vehicle_make: '',
    vehicle_model: '',
    weight: '',
    width: '',
    height: '',
    depth: '',
    color: '',
    price: '',
    sku: '',
    description: '',
    notes: '',
    bay: '',
    item_type: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Load initial data if in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        part_number: initialData.part_number || '',
        vehicle_make: initialData.vehicle_make || '',
        vehicle_model: initialData.vehicle_model || '',
        weight: initialData.weight || '',
        width: initialData.width || '',
        height: initialData.height || '',
        depth: initialData.depth || '',
        color: initialData.color || '',
        price: initialData.price || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        notes: initialData.notes || '',
        bay: initialData.bay || '',
        item_type: initialData.item_type || '',
      });
      
      if (initialData.thumbnail_url) {
        setImagePreview(initialData.thumbnail_url);
      }
    }
  }, [isEditMode, initialData]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   formDataToSend.append(key, value);
      // });
      // if (imageFile) {
      //   formDataToSend.append('image', imageFile);
      // }
      
      // if (isEditMode) {
      //   await axios.put(`/api/items/${itemId}`, formDataToSend);
      // } else {
      //   await axios.post('/api/items', formDataToSend);
      // }
      
      // For now, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(isEditMode ? `/items/${itemId}` : '/items');
      }, 1500);
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Left Column - Basic Info */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Part Number"
                    name="part_number"
                    value={formData.part_number}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SKU"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Make</InputLabel>
                    <Select
                      name="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={handleChange}
                      label="Vehicle Make"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {vehicleMakes.map(make => (
                        <MenuItem key={make} value={make}>{make}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vehicle Model"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Item Type</InputLabel>
                    <Select
                      name="item_type"
                      value={formData.item_type}
                      onChange={handleChange}
                      label="Item Type"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {itemTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Storage Location (Bay)"
                    name="bay"
                    value={formData.bay}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Dimensions & Weight
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">in</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">in</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Depth"
                    name="depth"
                    type="number"
                    value={formData.depth}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">in</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Description & Notes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    helperText="Internal notes, compatibility information, etc."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Image Upload & Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Item Image
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 2,
                  mb: 2,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                {imagePreview ? (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Item preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      mb: 2,
                    }}
                  />
                ) : (
                  <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                )}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Upload a clear image of the item. Recommended size: 800x600 pixels.
              </Typography>
            </CardContent>
          </Card>
          
          <Paper elevation={3} sx={{ p: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Item {isEditMode ? 'updated' : 'created'} successfully!
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => navigate(isEditMode ? `/items/${itemId}` : '/items')}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default ItemForm;
