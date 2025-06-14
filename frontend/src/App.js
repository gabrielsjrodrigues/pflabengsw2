import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

// Componentes de Autenticação
import LoginPage from './views/Auth/LoginPage';
import SignupPage from './views/Auth/SignupPage';

// Componentes do Voluntário
import VolunteerDashboard from './views/Volunteer/OpportunityList'; // Continua sendo a lista de oportunidades para Voluntários
import SubscriptionForm from './views/Volunteer/SubscriptionForm'; // Formulário de candidatura

// Componentes da ONG
import NGOMainDashboard from './views/NGO/NGOMainDashboard'; // O NOVO Dashboard principal da ONG
import NGOVolunteers from './views/NGO/NGOVolunteers'; // O antigo NGODashboard, agora para lista de voluntários
import GerenciarOportunidades from './views/NGO/GerenciarOportunidades'; // O componente de gerenciamento de vagas
import VolunteerDetail from './views/NGO/VolunteerDetail'; // Detalhes do voluntário para ONG

// Tema Material-UI
const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' }, 
    secondary: { main: '#1976D2' }, 
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Rotas de Autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Rotas para o Voluntário */}
          <Route path="/volunteer" element={<VolunteerDashboard />} /> {/* Lista de oportunidades para voluntário */}
          <Route path="/volunteer/opportunity/:id" element={<SubscriptionForm />} /> {/* Formulário de inscrição */}

          {/* Rotas para a ONG */}
          <Route path="/ngo" element={<NGOMainDashboard />} /> {/* NOVO: Dashboard principal da ONG com opções */}
          <Route path="/ngo/voluntarios" element={<NGOVolunteers />} /> {/* NOVO: Rota para a lista de voluntários da ONG */}
          <Route path="/ngo/oportunidades" element={<GerenciarOportunidades />} /> {/* NOVO: Rota para o gerenciamento de oportunidades da ONG */}
          <Route path="/ngo/volunteer/:id" element={<VolunteerDetail />} /> {/* Detalhes de voluntário para ONG */}

          {/* Redirecionamentos padrão */}
          <Route path="/" element={<Navigate to="/login" />} /> {/* Redireciona a raiz para o login */}
          <Route path="*" element={<Navigate to="/login" />} /> {/* Redireciona rotas não encontradas para o login */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}