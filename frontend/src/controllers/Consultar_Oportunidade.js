// Importa a função fetchOpportunities do seu arquivo api.js
// O caminho relativo pode precisar de ajuste dependendo de onde este arquivo está em relação ao api.js
import { fetchOpportunities } from '../../services/api'; 

async function consultar_Oportunidade() {
    try {
        // Usa a função fetchOpportunities do api.js, que já está configurada com a URL correta
        // e usa Axios, que lida com JSON automaticamente.
        const response = await fetchOpportunities(); 

        // O Axios retorna a resposta diretamente em 'response.data' se a requisição for bem-sucedida (status 2xx).
        // Não é necessário verificar response.ok ou fazer response.json() como no fetch padrão.
        const data = response.data; 
        console.log('Oportunidades encontradas:', data);
        // Aqui você pode fazer algo com os dados, como exibir na página

    } catch (error) { // O Axios lança o erro diretamente no catch
        // Se houver um erro de resposta do servidor (ex: 404, 500), o Axios coloca em error.response
        if (error.response) {
            console.error('Erro ao consultar oportunidades (resposta do servidor):', error.response.status, error.response.data);
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Erro ao consultar oportunidades (sem resposta do servidor):', error.request);
        } else {
            // Algo aconteceu na configuração da requisição que disparou um erro
            console.error('Erro ao consultar oportunidades:', error.message);
        }
    }
}

// Chama a função para testar
consultar_Oportunidade();