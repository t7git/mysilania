import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  ShoppingCart as ShoppingCartIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ItemsList = () => {
  // State for items and pagination
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vehicle_make: '',
    vehicle_model: '',
    item_type: '',
    min_price: '',
    max_price: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for filter menu
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // State for item action menu
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call with query parameters
        // For now, we'll simulate with a timeout and mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockItems = [
          {
            id: 1,
            name: 'Brake Rotor',
            part_number: 'BR-1234',
            vehicle_make: 'Toyota',
            vehicle_model: 'Camry',
            price: 89.99,
            thumbnail_url: null,
            item_type: 'Brake System',
            created_at: '2025-01-15T12:00:00Z',
          },
          {
            id: 2,
            name: 'Oil Filter',
            part_number: 'OF-5678',
            vehicle_make: 'Honda',
            vehicle_model: 'Accord',
            price: 12.99,
            thumbnail_url: null,
            item_type: 'Engine',
            created_at: '2025-02-20T14:30:00Z',
          },
          {
            id: 3,
            name: 'Spark Plug',
            part_number: 'SP-9012',
            vehicle_make: 'Ford',
            vehicle_model: 'F-150',
            price: 8.99,
            thumbnail_url: null,
            item_type: 'Ignition',
            created_at: '2025-03-10T09:15:00Z',
          },
          {
            id: 4,
            name: 'Air Filter',
            part_number: 'AF-3456',
            vehicle_make: 'Chevrolet',
            vehicle_model: 'Silverado',
            price: 19.99,
            thumbnail_url: null,
            item_type: 'Engine',
            created_at: '2025-03-05T11:45:00Z',
          },
          {
            id: 5,
            name: 'Wiper Blades',
            part_number: 'WB-7890',
            vehicle_make: 'Toyota',
            vehicle_model: 'Corolla',
            price: 24.99,
            thumbnail_url: null,
            item_type: 'Exterior',
            created_at: '2025-02-28T16:20:00Z',
          },
          {
            id: 6,
            name: 'Headlight Bulb',
            part_number: 'HB-2345',
            vehicle_make: 'Honda',
            vehicle_model: 'Civic',
            price: 15.99,
            thumbnail_url: null,
            item_type: 'Lighting',
            created_at: '2025-03-12T10:30:00Z',
          },
        ];
        
        // Apply filtering and sorting (in a real app, this would be done on the server)
        let filteredItems = [...mockItems];
        
        // Apply search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.part_number.toLowerCase().includes(term) ||
            item.vehicle_make.toLowerCase().includes(term) ||
            item.vehicle_model.toLowerCase().includes(term)
          );
        }
        
        // Apply filters
        if (filters.vehicle_make) {
          filteredItems = filteredItems.filter(item => 
            item.vehicle_make.toLowerCase() === filters.vehicle_make.toLowerCase()
          );
        }
        
        if (filters.vehicle_model) {
          filteredItems = filteredItems.filter(item => 
            item.vehicle_model.toLowerCase() === filters.vehicle_model.toLowerCase()
          );
        }
        
        if (filters.item_type) {
          filteredItems = filteredItems.filter(item => 
            item.item_type.toLowerCase() === filters.item_type.toLowerCase()
          );
        }
        
        if (filters.min_price) {
          filteredItems = filteredItems.filter(item => 
            item.price >= parseFloat(filters.min_price)
          );
        }
        
        if (filters.max_price) {
          filteredItems = filteredItems.filter(item => 
            item.price <= parseFloat(filters.max_price)
          );
        }
        
        // Apply sorting
        filteredItems.sort((a, b) => {
          if (sortBy === 'price') {
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
          } else if (sortBy === 'name') {
            return sortOrder === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          } else {
            // Default sort by created_at
            return sortOrder === 'asc' 
              ? new Date(a.created_at) - new Date(b.created_at) 
              : new Date(b.created_at) - new Date(a.created_at);
          }
        });
        
        // Apply pagination
        const itemsPerPage = 4;
        const totalItems = filteredItems.length;
        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Adjust page if it's out of bounds
        const adjustedPage = Math.min(page, calculatedTotalPages || 1);
        if (adjustedPage !== page) {
          setPage(adjustedPage);
        }
        
        const startIndex = (adjustedPage - 1) * itemsPerPage;
        const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
        
        setItems(paginatedItems);
        setTotalPages(calculatedTotalPages);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to fetch items. Please try again later.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [page, searchTerm, filters, sortBy, sortOrder]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1); // Reset to first page when filters change
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      vehicle_make: '',
      vehicle_model: '',
      item_type: '',
      min_price: '',
      max_price: '',
    });
    setSearchTerm('');
    setPage(1);
    setFilterMenuAnchorEl(null);
  };
  
  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setSortMenuAnchorEl(null);
  };
  
  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };
  
  // Handle sort menu
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchorEl(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };
  
  // Handle item action menu
  const handleActionMenuOpen = (event, item) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedItem(null);
  };
  
  // Handle delete dialog
  const handleDeleteDialogOpen = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
    handleActionMenuClose();
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  const handleDeleteItem = async () => {
    try {
      // In a real app, this would be an API call
      // await axios.delete(`/api/items/${itemToDelete.id}`);
      
      // For now, just remove from local state
      setItems(items.filter(item => item.id !== itemToDelete.id));
      
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again later.');
    }
  };
  
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Items
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your inventory of parts and items
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, part number, make, or model..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterMenuOpen}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterMenuAnchorEl}
              open={Boolean(filterMenuAnchorEl)}
              onClose={handleFilterMenuClose}
              PaperProps={{
                sx: { width: 300, maxHeight: 500, mt: 1 },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Filters
                </Typography>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Vehicle Make</InputLabel>
                  <Select
                    name="vehicle_make"
                    value={filters.vehicle_make}
                    onChange={handleFilterChange}
                    label="Vehicle Make"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Toyota">Toyota</MenuItem>
                    <MenuItem value="Honda">Honda</MenuItem>
                    <MenuItem value="Ford">Ford</MenuItem>
                    <MenuItem value="Chevrolet">Chevrolet</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Vehicle Model</InputLabel>
                  <Select
                    name="vehicle_model"
                    value={filters.vehicle_model}
                    onChange={handleFilterChange}
                    label="Vehicle Model"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Camry">Camry</MenuItem>
                    <MenuItem value="Corolla">Corolla</MenuItem>
                    <MenuItem value="Accord">Accord</MenuItem>
                    <MenuItem value="Civic">Civic</MenuItem>
                    <MenuItem value="F-150">F-150</MenuItem>
                    <MenuItem value="Silverado">Silverado</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Item Type</InputLabel>
                  <Select
                    name="item_type"
                    value={filters.item_type}
                    onChange={handleFilterChange}
                    label="Item Type"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Engine">Engine</MenuItem>
                    <MenuItem value="Brake System">Brake System</MenuItem>
                    <MenuItem value="Ignition">Ignition</MenuItem>
                    <MenuItem value="Exterior">Exterior</MenuItem>
                    <MenuItem value="Lighting">Lighting</MenuItem>
                  </Select>
                </FormControl>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Min Price"
                      name="min_price"
                      type="number"
                      size="small"
                      value={filters.min_price}
                      onChange={handleFilterChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Max Price"
                      name="max_price"
                      type="number"
                      size="small"
                      value={filters.max_price}
                      onChange={handleFilterChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearFilters}
                    sx={{ mr: 1 }}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleFilterMenuClose}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Menu>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortMenuOpen}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortMenuAnchorEl}
              open={Boolean(sortMenuAnchorEl)}
              onClose={handleSortMenuClose}
            >
              <MenuItem 
                selected={sortBy === 'created_at'}
                onClick={() => handleSortChange('created_at')}
              >
                Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '(Oldest)' : '(Newest)')}
              </MenuItem>
              <MenuItem 
                selected={sortBy === 'name'}
                onClick={() => handleSortChange('name')}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}
              </MenuItem>
              <MenuItem 
                selected={sortBy === 'price'}
                onClick={() => handleSortChange('price')}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '(Low-High)' : '(High-Low)')}
              </MenuItem>
            </Menu>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/items/create"
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Active Filters */}
      {(searchTerm || Object.values(filters).some(v => v !== '')) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {filters.vehicle_make && (
              <Chip
                label={`Make: ${filters.vehicle_make}`}
                onDelete={() => setFilters({ ...filters, vehicle_make: '' })}
                size="small"
              />
            )}
            {filters.vehicle_model && (
              <Chip
                label={`Model: ${filters.vehicle_model}`}
                onDelete={() => setFilters({ ...filters, vehicle_model: '' })}
                size="small"
              />
            )}
            {filters.item_type && (
              <Chip
                label={`Type: ${filters.item_type}`}
                onDelete={() => setFilters({ ...filters, item_type: '' })}
                size="small"
              />
            )}
            {filters.min_price && (
              <Chip
                label={`Min Price: $${filters.min_price}`}
                onDelete={() => setFilters({ ...filters, min_price: '' })}
                size="small"
              />
            )}
            {filters.max_price && (
              <Chip
                label={`Max Price: $${filters.max_price}`}
                onDelete={() => setFilters({ ...filters, max_price: '' })}
                size="small"
              />
            )}
            <Chip
              label="Clear All"
              onClick={handleClearFilters}
              color="primary"
              size="small"
            />
          </Box>
        </Box>
      )}
      
      {/* Items Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : items.length > 0 ? (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card 
                elevation={3} 
                className="hover-card"
                component={RouterLink}
                to={`/items/${item.id}`}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  )}
                </CardMedia>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {item.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Part #: {item.part_number}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {item.vehicle_make} {item.vehicle_model}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${item.price.toFixed(2)}
                    </Typography>
                    
                    <Chip
                      label={item.item_type}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    component={RouterLink}
                    to={`/items/${item.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Button>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionMenuOpen(e, item)}
                    aria-label="more options"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your search or filters, or add a new item.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/items/create"
          >
            Add New Item
          </Button>
        </Paper>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {/* Item Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem
          component={RouterLink}
          to={selectedItem ? `/items/${selectedItem.id}/edit` : '#'}
          onClick={handleActionMenuClose}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Item
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={selectedItem ? `/ecommerce/listing/${selectedItem.id}` : '#'}
          onClick={handleActionMenuClose}
        >
          <ShoppingCartIcon fontSize="small" sx={{ mr: 1 }} />
          Create Listing
        </MenuItem>
        <MenuItem
          onClick={() => selectedItem && handleDeleteDialogOpen(selectedItem)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Item
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
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

export default ItemsList;
