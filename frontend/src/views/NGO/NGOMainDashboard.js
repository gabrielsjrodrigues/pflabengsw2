import React from 'react';
import { Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom'; // Para navegação entre rotas
import { VolunteerActivism, Work } from '@mui/icons-material'; // Ícones para os botões

// Este componente será o dashboard principal da ONG, oferecendo opções de navegação.
export default function NGOMainDashboard() {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', mb: 5 }}>
        Bem-vindo, ONG!
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 600, margin: '0 auto', boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          O que você gostaria de fazer?
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {/* Botão para ir para a lista de Voluntários */}
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              component={Link} // Usa Link para navegar para a rota de voluntários
              to="/ngo/voluntarios" // Esta será a nova rota da lista de voluntários
              sx={{ py: 2 }} // Padding vertical para o botão
            >
              <VolunteerActivism sx={{ mr: 1 }} /> Ver Voluntários
            </Button>
          </Grid>
          {/* Botão para ir para a página de Gerenciamento de Oportunidades (Vagas) */}
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="secondary" // Cor diferente para distinguir
              fullWidth
              size="large"
              component={Link} // Usa Link para navegar para a rota de oportunidades
              to="/ngo/oportunidades" // Esta será a nova rota para gerenciar oportunidades
              sx={{ py: 2 }}
            >
              <Work sx={{ mr: 1 }} /> Gerenciar Oportunidades
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}