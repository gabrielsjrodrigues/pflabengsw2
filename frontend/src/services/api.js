import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    timeout: 30000 // Define um timeout de 30 segundos (30000 milissegundos)
});

// Oportunidades
export const fetchOpportunities = () => API.get('/oportunidades/');
export const createOpportunity = (data) => API.post('/oportunidades/', data);
// NOVAS FUNÇÕES PARA EDIÇÃO E EXCLUSÃO
export const updateOpportunity = (id, data) => API.put(`/oportunidades/${id}/`, data); // <<--- CORRIGIDO: ADICIONADA BARRA FINAL AQUI
// Se o backend tiver PATCH para atualização parcial, você pode usar:
// export const updatePartialOpportunity = (id, data) => API.patch(`/oportunidades/${id}/`, data); // Já tinha barra final
export const deleteOpportunity = (id) => API.delete(`/oportunidades/${id}/`); // <<--- CORRIGIDO: ADICIONADA BARRA FINAL AQUI

// Voluntários - Para consistência e evitar problemas futuros, adicionei barras finais aqui também,
// ASSUMINDO que as rotas do backend em volunteer_routes.py esperam isso (e.g., router.get("/"))
export const fetchVolunteers = () => API.get('/voluntarios/');
export const fetchVolunteerById = (id) => API.get(`/voluntarios/${id}/`);

// Inscrições - Para consistência e evitar problemas futuros, adicionei barras finais aqui também,
// ASSUMINDO que as rotas do backend em inscricoes_routes.py esperam isso
export const submitApplication = (data) => API.post('/inscricoes/', data);
export const updateApplicationStatus = (id, status) => API.patch(`/inscricoes/${id}/`, { status });
export const fetchApplications = () => API.get('/inscricoes/');

// ONGs - Para consistência e evitar problemas futuros, adicionei barra final aqui também,
// ASSUMINDO que as rotas do backend esperam isso
export const fetchNGOs = () => API.get('/ongs/');