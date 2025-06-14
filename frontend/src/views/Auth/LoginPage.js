import React, { useState } from 'react';
import { 
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Box
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import BusinessIcon from '@mui/icons-material/Business';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  setTimeout(() => {
    setIsLoading(false);
    // Redireciona para as páginas corretas
    if (activeTab === 0) {
      navigate('/volunteer'); // OpportunityList
    } else {
      navigate('/ngo'); // AssignedVolunteers
    }
  }, 1000);
};

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2E7D32 30%, #1976D2 90%)'
    }}>
      <Paper elevation={6} sx={{ 
        width: 400, 
        p: 4,
        borderRadius: 4
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<VolunteerActivismIcon />} 
            label="Voluntário" 
            sx={{ fontSize: 16 }}
          />
          <Tab 
            icon={<BusinessIcon />} 
            label="ONG" 
            sx={{ fontSize: 16 }}
          />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            type="email"
          />
          
          <TextField
            label="Senha"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            type="password"
          />

          <Button 
            type="submit"
            variant="contained" 
            fullWidth 
            size="large"
            disabled={isLoading}
            sx={{ mt: 3 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeTab === 0 ? (
              'Entrar como Voluntário'
            ) : (
              'Entrar como ONG'
            )}
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Não tem conta?{' '}
            <Link 
              to="/signup" 
              style={{ 
                color: '#1976D2',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Criar conta
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}