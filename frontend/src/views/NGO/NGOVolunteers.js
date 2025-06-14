import React, { useEffect, useState } from 'react';
import { fetchVolunteers } from '../../services/api'; // <-- Usa api.js agora
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Avatar, 
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { VolunteerActivism } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function NGOVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVolunteers()
      .then(res => setVolunteers(res.data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar voluntários: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        <VolunteerActivism sx={{ mr: 1, verticalAlign: 'middle' }} />
        Voluntários Cadastrados ({volunteers.length})
      </Typography>

      <Grid container spacing={3}>
        {volunteers.map((volunteer) => (
          <Grid item xs={12} md={6} key={volunteer.id}>
            <Card sx={{ 
              borderLeft: '4px solid', 
              borderColor: 'primary.main',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)'
              }
            }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{
                      bgcolor: 'primary.light',
                      color: 'white'
                    }}>
                      {volunteer.nome?.[0] || '?'}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{volunteer.nome || 'Sem nome'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {volunteer.mensagem || 'Sem mensagem'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nascimento: {volunteer.nascimento || 'Não informado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CPF: {volunteer.cpf || 'Não informado'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      component={Link}
                      to={`/ngo/volunteer/${volunteer.id}`}
                      size="small"
                    >
                      Ver Detalhes
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {volunteers.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Nenhum voluntário encontrado.
        </Alert>
      )}
    </div>
  );
}
