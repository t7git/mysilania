import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    
    // Reset form data when entering edit mode
    if (!editMode) {
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
      });
      setFormError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (formData.password && formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Prepare update data
    const updateData = {};
    
    if (formData.username !== user.username) {
      updateData.username = formData.username;
    }
    
    if (formData.email !== user.email) {
      updateData.email = formData.email;
    }
    
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      setEditMode(false);
      return;
    }
    
    // Update profile
    const result = await updateProfile(updateData);
    
    if (result.success) {
      setEditMode(false);
      setSuccessMessage('Profile updated successfully');
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };
  
  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Profile sidebar */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: theme.primaryColor,
                  fontSize: '2.5rem',
                  mb: 2,
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Member since: {new Date(user?.created_at).toLocaleDateString()}
              </Typography>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Last Login
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleString()} {/* This would come from the user object in a real app */}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="profile tabs"
                variant="fullWidth"
              >
                <Tab
                  icon={<PersonIcon />}
                  label="Account"
                  id="profile-tab-0"
                  aria-controls="profile-tabpanel-0"
                />
                <Tab
                  icon={<SecurityIcon />}
                  label="Security"
                  id="profile-tab-1"
                  aria-controls="profile-tabpanel-1"
                />
                <Tab
                  icon={<HistoryIcon />}
                  label="Activity"
                  id="profile-tab-2"
                  aria-controls="profile-tabpanel-2"
                />
              </Tabs>
            </Box>
            
            {/* Account Tab */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 0}
              id="profile-tabpanel-0"
              aria-labelledby="profile-tab-0"
              sx={{ p: 3 }}
            >
              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Account Information</Typography>
                    <Button
                      variant={editMode ? 'outlined' : 'contained'}
                      color={editMode ? 'secondary' : 'primary'}
                      startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                      onClick={editMode ? handleSubmit : handleToggleEditMode}
                      disabled={loading}
                    >
                      {editMode ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </Box>
                  
                  {(error || formError) && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {formError || error}
                    </Alert>
                  )}
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!editMode || loading}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode || loading}
                        variant={editMode ? 'outlined' : 'filled'}
                        InputProps={{
                          readOnly: !editMode,
                        }}
                      />
                    </Grid>
                    
                    {editMode && (
                      <>
                        <Grid item xs={12}>
                          <Divider>
                            <Typography variant="body2" color="text.secondary">
                              Change Password (optional)
                            </Typography>
                          </Divider>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  
                  {editMode && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleToggleEditMode}
                        sx={{ mr: 2 }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Security Tab */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 1}
              id="profile-tabpanel-1"
              aria-labelledby="profile-tab-1"
              sx={{ p: 3 }}
            >
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage your account security settings and preferences.
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Coming Soon
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Additional security features like two-factor authentication and login history
                    will be available in a future update.
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Activity Tab */}
            <Box
              role="tabpanel"
              hidden={activeTab !== 2}
              id="profile-tabpanel-2"
              aria-labelledby="profile-tab-2"
              sx={{ p: 3 }}
            >
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    View your recent account activity and actions.
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Coming Soon
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Activity tracking and history will be available in a future update.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Container>
  );
};

export default Profile;
