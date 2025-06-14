// No topo do arquivo:
// Importe a função 'createOpportunity' do seu api.js
import { createOpportunity } from '../../services/api'; // Ajuste o caminho relativo se necessário

async function salvar_ONG_Oportunidade() {
    // IMPORTANTE: O backend espera os campos 'titulo', 'descricao', 'ong_nome', 'endereco'.
    // O seu objeto 'DataOportunidade' está ligeiramente diferente (tem 'nome' e 'endereco' fora do que o backend espera no root).
    // O modelo OportunidadeONG no backend é: titulo, descricao, ong_nome, endereco.
    // Vamos garantir que os nomes das propriedades coincidam com o que o backend espera.
    const dadosParaBackend = {
        titulo: "Voluntário para Horta Comunitária", // Exemplo de título
        descricao: "Precisamos de ajuda para cuidar da nossa horta. Experiência não necessária, apenas boa vontade!", // Exemplo de descrição
        ong_nome: "ONG Jardineiros do Futuro", // Exemplo de nome da ONG
        endereco: "Rua das Flores, 123, São Paulo" // Exemplo de endereço
    };

    try {
        // Usa a função createOpportunity do api.js
        // Ela já faz o POST para '/ongs/oportunidades' e envia o JSON.
        const response = await createOpportunity(dadosParaBackend); 

        // Axios retorna a resposta diretamente em 'response.data' se for status 2xx.
        // O backend retorna {"success": true} para esta rota.
        if (response.data && response.data.success) {
            console.log('Oportunidade criada com sucesso!');
            // Aqui você pode adicionar lógica para limpar o formulário ou mostrar uma mensagem.
        } else {
            // Se o backend retornou 200, mas com um "success": false ou outra estrutura.
            console.error('Sucesso não confirmado pelo backend:', response.data);
        }

    } catch (error) { // O Axios lida com erros de HTTP (4xx, 5xx) no bloco catch
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx (ex: 400, 404, 500)
            console.error('Erro ao salvar oportunidade (resposta do servidor):', error.response.status, error.response.data);
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Erro ao salvar oportunidade (sem resposta do servidor):', error.request);
        } else {
            // Algo aconteceu na configuração da requisição que disparou um erro
            console.error('Erro ao salvar oportunidade:', error.message);
        }
    }
}

salvar_ONG_Oportunidade();