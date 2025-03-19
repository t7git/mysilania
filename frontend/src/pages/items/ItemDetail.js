import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  Image as ImageIcon,
  TextFields as OCRIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for item data
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch item data
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
          images: [],
          ocr_results: [
            {
              id: 1,
              raw_text: 'Toyota Camry Brake Rotor\nPart #: BR-1234\nWeight: 12.5 lbs\nDimensions: 10.2" x 2.3" x 10.2"',
              processed_text: 'Toyota Camry Brake Rotor Part #: BR-1234 Weight: 12.5 lbs Dimensions: 10.2" x 2.3" x 10.2"',
              image_url: null,
              created_at: '2025-01-15T12:00:00Z',
            }
          ],
          scrape_results: [
            {
              id: 1,
              source_url: 'https://example.com/parts/BR-1234',
              scraped_data: {
                title: 'Toyota Camry Brake Rotor',
                part_number: 'BR-1234',
                price: 89.99,
                description: 'High-performance brake rotor for Toyota Camry. Provides excellent stopping power and heat dissipation.',
                specifications: {
                  weight: '12.5 lbs',
                  dimensions: '10.2" x 2.3" x 10.2"',
                  material: 'Cast iron with zinc coating',
                  position: 'Front',
                }
              },
              created_at: '2025-01-15T14:30:00Z',
            }
          ],
          ecommerce_listings: [
            {
              id: 1,
              platform: 'ebay',
              platform_listing_id: 'ebay-12345',
              listing_url: 'https://ebay.com/listing/12345',
              listing_status: 'active',
              created_at: '2025-01-16T10:00:00Z',
            }
          ]
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle delete dialog
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteItem = async () => {
    try {
      // In a real app, this would be an API call
      // await axios.delete(`/api/items/${id}`);
      
      // Navigate back to items list
      navigate('/items');
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again later.');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !item) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            {error || 'Item not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/items"
            sx={{ mt: 2 }}
          >
            Back to Items
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" className="fade-in">
      {/* Header */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={RouterLink}
              to="/items"
              sx={{ mb: 2 }}
            >
              Back to Items
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {item.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Part #: {item.part_number}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/items/${id}/edit`}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDialogOpen}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Item Image and Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardMedia
              component="div"
              sx={{
                height: 250,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <ImageIcon sx={{ fontSize: 80, color: 'grey.400' }} />
              )}
            </CardMedia>
            
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                ${item.price.toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={item.item_type} color="primary" variant="outlined" />
                <Chip label={`${item.vehicle_make} ${item.vehicle_model}`} variant="outlined" />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    component={RouterLink}
                    to={`/ecommerce/listing/${id}`}
                  >
                    Create Listing
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<OCRIcon />}
                    component={RouterLink}
                    to="/ocr/upload"
                  >
                    OCR Scan
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    component={RouterLink}
                    to="/scraper/search"
                  >
                    Web Scrape
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Item Details Tabs */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="item details tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Details" id="item-tab-0" aria-controls="item-tabpanel-0" />
                <Tab label="Images" id="item-tab-1" aria-controls="item-tabpanel-1" />
                <Tab label="OCR Results" id="item-tab-2" aria-controls="item-tabpanel-2" />
                <Tab label="Web Scrape Data" id="item-tab-3" aria-controls="item-tabpanel-3" />
                <Tab label="eCommerce Listings" id="item-tab-4" aria-controls="item-tabpanel-4" />
              </Tabs>
            </Box>
            
            {/* Details Tab */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 0}
              id="item-tabpanel-0"
              aria-labelledby="item-tab-0"
              sx={{ p: 3 }}
            >
              {activeTab === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Item Specifications
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Part Number
                          </TableCell>
                          <TableCell>{item.part_number}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Vehicle Make
                          </TableCell>
                          <TableCell>{item.vehicle_make}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Vehicle Model
                          </TableCell>
                          <TableCell>{item.vehicle_model}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Weight
                          </TableCell>
                          <TableCell>{item.weight} lbs</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Dimensions
                          </TableCell>
                          <TableCell>{item.width}" × {item.height}" × {item.depth}"</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Color
                          </TableCell>
                          <TableCell>{item.color}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            SKU
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Item Type
                          </TableCell>
                          <TableCell>{item.item_type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Storage Location
                          </TableCell>
                          <TableCell>Bay {item.bay}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'action.hover' }}>
                            Price
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {item.description || 'No description available.'}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {item.notes || 'No notes available.'}
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Other tabs would go here in a real implementation */}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetail;
