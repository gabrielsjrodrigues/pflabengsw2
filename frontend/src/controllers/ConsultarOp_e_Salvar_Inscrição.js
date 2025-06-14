// Importa as funções necessárias do seu api.js
// Ajuste o caminho relativo se o seu api.js estiver em outro lugar
import { fetchOpportunities, submitApplication } from '../../services/api';

// A função consultar_oportunidades será substituída pela chamada a fetchOpportunities do api.js
// A função salvarInscricao será substituída pela chamada a submitApplication do api.js

// Iniciar todo o processo
async function iniciarProcesso() {
    try {
        // 1. Consultar Oportunidades
        // Usa fetchOpportunities do api.js. Axios retorna a resposta em 'response.data'.
        const oportunidadesResponse = await fetchOpportunities();
        const oportunidades = oportunidadesResponse.data; // Dados das oportunidades

        if (oportunidades && oportunidades.length > 0) {
            const primeiraOportunidade = oportunidades[0];
            console.log("Oportunidade encontrada:", primeiraOportunidade);

            // 2. Preparar Dados para Inscrição (usando dados fixos como no seu original)
            const dadosParaInscricao = {
                nome: "Petrônio Brás de Cunha",
                nascimento: "1967-02-19",
                cpf: "81909010", // Certifique-se que o CPF tem 11 dígitos, se o backend validar
                mensagem: "Eu sou Petrônio \"Petrobras\" Bras de Cunha",
                oportunidade_id: primeiraOportunidade.id // Usa o ID da oportunidade real
            };

            // 3. Salvar Inscrição
            // Usa submitApplication do api.js. Axios retorna a resposta em 'response.data'.
            const inscricaoResponse = await submitApplication(dadosParaInscricao);

            if (inscricaoResponse.data && inscricaoResponse.data.success) {
                console.log('Inscrição enviada com sucesso:', inscricaoResponse.data);
            } else {
                console.error('Falha ao enviar inscrição: Sucesso não confirmado pelo backend.', inscricaoResponse.data);
            }

        } else {
            console.log("Nenhuma oportunidade encontrada para inscrição.");
        }
    } catch (error) {
        // Tratamento de erros com Axios
        if (error.response) {
            console.error('Erro de API:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Erro de rede (sem resposta):', error.request);
        } else {
            console.error('Erro inesperado:', error.message);
        }
    }
}

// Chama a função principal para iniciar o processo
iniciarProcesso();