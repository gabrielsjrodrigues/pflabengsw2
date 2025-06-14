// frontend/src/views/NGO/GerenciarOportunidades.js
import React, { useEffect, useState } from 'react';
import {
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
} from '../../services/api';
import {
    Card, CardContent, Button, Typography, Grid,
    CircularProgress, Alert, Box
} from '@mui/material';
import { Work } from '@mui/icons-material';
import OportunidadeFormModal from '../../components/OportunidadeFormModal';

// --- FUNÇÃO AUXILIAR PARA FORMATAR DATA E HORA ---
const formatarDataHoraOportunidade = (oportunidade) => {
    const { data_inicio, data_termino, hora_inicio, hora_termino } = oportunidade;

    if (!data_inicio && !data_termino && !hora_inicio && !hora_termino) {
        return "Não informado";
    }

    let dataPart = "";
    if (data_inicio && data_termino) {
        if (data_inicio === data_termino) {
            dataPart = `${data_inicio}`;
        } else {
            dataPart = `${data_inicio} a ${data_termino}`;
        }
    } else if (data_inicio) {
        dataPart = `${data_inicio}`;
    } else if (data_termino) {
        dataPart = `até ${data_termino}`;
    }

    let horaPart = "";
    if (hora_inicio && hora_termino) {
        horaPart = `${hora_inicio} às ${hora_termino}`;
    } else if (hora_inicio) {
        horaPart = `a partir das ${hora_inicio}`;
    } else if (hora_termino) {
        horaPart = `até as ${hora_termino}`;
    }

    if (dataPart && horaPart) {
        return `${dataPart} das ${horaPart}`;
    } else if (dataPart) {
        return `${dataPart}`;
    } else if (horaPart) {
        return `${horaPart}`;
    }
    return "Não informado";
};


// Componente principal para Gerenciar Oportunidades.
export default function GerenciarOportunidades() {
    const [opportunities, setOpportunities] = useState([]);
    const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
    const [errorOpportunities, setErrorOpportunities] = useState(null);

    // Estados para o Modal de Oportunidade
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalInitialValues, setModalInitialValues] = useState(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState(false);
    // Estado para exibir alertas DENTRO do modal (agora gerenciado pelo OportunidadeFormModal para algumas mensagens)
    const [modalFormAlert, setModalFormAlert] = useState(null); 
    // Estado para exibir alertas FORA do modal (após fechar, ex: sucesso/erro de exclusão)
    const [mainPageAlert, setMainPageAlert] = useState(null);


    // --- Função para Carregar Oportunidades ---
    const loadOpportunities = async () => {
        setIsLoadingOpportunities(true);
        setErrorOpportunities(null);
        try {
            const res = await fetchOpportunities();
            setOpportunities(res.data);
            // Limpa o alerta da página principal se a carga foi bem-sucedida
            if (mainPageAlert?.severity === 'success' || mainPageAlert?.severity === 'error') {
                setMainPageAlert(null);
            }
        } catch (err) {
            console.error("Erro ao carregar oportunidades:", err);
            setErrorOpportunities(err.message);
            setMainPageAlert({ severity: 'error', message: `Erro ao carregar oportunidades: ${err.message}` });
        } finally {
            setIsLoadingOpportunities(false);
        }
    };

    // --- Handler para submissão do formulário no Modal (Criação/Edição) ---
    const handleFormSubmit = async (values) => {
        setIsModalSubmitting(true);
        setModalFormAlert(null); // Limpa alertas internos antes de submeter
        setMainPageAlert(null); // Limpa alertas da página principal para não confundir

        return new Promise(async (resolve, reject) => { // Retorna uma Promise para o OportunidadeFormModal aguardar
            try {
                let response;
                if (modalInitialValues && modalInitialValues.id) {
                    // Lógica para atualização de oportunidade
                    response = await updateOpportunity(modalInitialValues.id, values);
                    if (response.data && response.data.success) {
                        setModalFormAlert({ severity: 'success', message: 'Oportunidade atualizada com sucesso!' });
                        setMainPageAlert({ severity: 'success', message: 'Oportunidade atualizada com sucesso!' }); // Alerta na página principal
                        console.log('Oportunidade atualizada com sucesso no backend.');
                    } else {
                        const msg = response.data?.detail || response.data?.error || 'Falha ao atualizar oportunidade.';
                        setModalFormAlert({ severity: 'error', message: `Erro: ${msg}` });
                        setMainPageAlert({ severity: 'error', message: `Erro ao atualizar oportunidade: ${msg}` });
                        console.error('Falha ao atualizar oportunidade no backend:', msg);
                        reject(new Error(msg)); // Rejeita a promise em caso de falha
                        return;
                    }
                } else {
                    // Lógica para criação de nova oportunidade
                    response = await createOpportunity(values);
                    if (response.data && response.data.success) {
                        setModalFormAlert({ severity: 'success', message: 'Oportunidade publicada com sucesso!' });
                        setMainPageAlert({ severity: 'success', message: 'Oportunidade publicada com sucesso!' }); // Alerta na página principal
                        console.log('Nova oportunidade publicada com sucesso no backend.');
                    } else {
                        const msg = response.data?.detail || response.data?.error || 'Falha ao publicar oportunidade.';
                        setModalFormAlert({ severity: 'error', message: `Erro: ${msg}` });
                        setMainPageAlert({ severity: 'error', message: `Erro ao publicar oportunidade: ${msg}` });
                        console.error('Falha ao publicar oportunidade no backend:', msg);
                        reject(new Error(msg)); // Rejeita a promise em caso de falha
                        return;
                    }
                }
                
                // Se chegou até aqui, a operação foi bem-sucedida.
                await loadOpportunities(); // Recarrega a lista de oportunidades
                resolve(response); // Resolve a promise para que o modal saiba que a submissão foi bem-sucedida

            } catch (error) {
                // Captura erros de rede ou outros erros não tratados pelas respostas do backend
                const msg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Erro desconhecido.';
                setModalFormAlert({ severity: 'error', message: `Erro: ${msg}` });
                setMainPageAlert({ severity: 'error', message: `Erro na submissão: ${msg}` });
                console.error("Erro na submissão do formulário:", error);
                reject(error); // Rejeita a promise
            } finally {
                setIsModalSubmitting(false);
                // Não fechamos o modal aqui; o OportunidadeFormModal agora gerencia o fechamento com delay.
                // Resetamos os valores iniciais e o alerta do modal APENAS quando o modal é fechado pela prop onClose.
            }
        });
    };

    // --- Função para Abrir Modal em Modo Edição ---
    const handleEditClick = (opportunity) => {
        setModalInitialValues(opportunity);
        setModalFormAlert(null); // Limpa qualquer alerta anterior do modal
        setIsFormModalOpen(true);
    };

    // --- Função para Excluir Vaga ---
    const handleDeleteClick = async (opportunityId) => {
        if (window.confirm('Tem certeza que deseja excluir esta oportunidade?')) {
            setMainPageAlert(null); // Limpa alertas anteriores
            try {
                await deleteOpportunity(opportunityId);
                setMainPageAlert({ severity: 'success', message: 'Oportunidade excluída com sucesso!' });
                await loadOpportunities(); // Recarrega a lista
            } catch (error) {
                const msg = error.response?.data?.detail || error.response?.data?.error || error.message || 'Erro desconhecido.';
                setMainPageAlert({ severity: 'error', message: `Erro ao excluir: ${msg}` });
                console.error("Erro ao excluir oportunidade:", error);
            }
        }
    };

    // --- Efeito para carregar oportunidades ao montar o componente ---
    useEffect(() => {
        loadOpportunities();
    }, []);

    // --- Renderização do Componente ---
    return (
        <div style={{ padding: 20 }}>
            {/* Título da seção de Gerenciamento de Oportunidades e botão Cadastrar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>
                    <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Oportunidades
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'darkgrey',
                        },
                        whiteSpace: 'nowrap',
                        padding: '10px 20px',
                        fontSize: '0.9rem'
                    }}
                    onClick={() => {
                        setModalInitialValues(null); // Para garantir que é um formulário de criação
                        setModalFormAlert(null); // Limpa alertas internos do modal
                        setMainPageAlert(null); // Limpa alertas da página principal
                        setIsFormModalOpen(true);
                    }}
                >
                    CADASTRAR NOVA OPORTUNIDADE {/* Alterado o texto do botão */}
                </Button>
            </Box>

            {/* Mensagem de alerta da página principal (fora do modal) */}
            {mainPageAlert && (
                <Alert severity={mainPageAlert.severity} sx={{ mb: 2 }}>
                    {mainPageAlert.message}
                </Alert>
            )}

            {/* Lista de Vagas Publicadas */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Oportunidades cadastradas</Typography>
            {isLoadingOpportunities ? (
                <CircularProgress />
            ) : errorOpportunities ? (
                <Alert severity="error">Erro ao carregar vagas: {errorOpportunities}</Alert>
            ) : opportunities.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>Nenhuma vaga publicada ainda.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {opportunities.map((opportunity) => (
                        <Grid item xs={12} sm={6} md={4} key={opportunity.id}>
                            <Card sx={{
                                borderLeft: '4px solid',
                                borderColor: 'secondary.main',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-3px)' },
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                            {opportunity.titulo || 'Sem título'}
                                        </Typography>
                                        {opportunity.status_vaga && (
                                            <Typography variant="caption" sx={{
                                                backgroundColor: 'lightgrey',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                fontWeight: 'bold',
                                            }}>
                                                Status: {opportunity.status_vaga}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {opportunity.descricao || 'Sem descrição'}
                                    </Typography>

                                    {/* --- ALINHAMENTO DE DOIS LADOS PARA DETALHES --- */}
                                    {/* ONG */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            ONG:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {opportunity.ong_nome || 'Não informado'}
                                        </Typography>
                                    </Box>
                                    {/* Tipo de Ação (LINHA EXCLUSIVA) */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            Tipo de Ação:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {opportunity.tipo_acao || 'Não informado'}
                                        </Typography>
                                    </Box>
                                    {/* Endereço (AGORA SEM O TIPO DE AÇÃO) */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            Endereço:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {opportunity.endereco || 'Não informado'}
                                        </Typography>
                                    </Box>
                                    {/* Data e Hora (usando a nova função de formatação) */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            Data e hora:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {formatarDataHoraOportunidade(opportunity)}
                                        </Typography>
                                    </Box>
                                    {/* Perfil do Voluntário */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            Perfil do voluntário:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {opportunity.perfil_voluntario || 'Não informado'}
                                        </Typography>
                                    </Box>
                                    {/* Número de vagas */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 1, whiteSpace: 'nowrap' }}>
                                            Número de vagas:
                                        </Typography>
                                        <Typography variant="body2" component="span" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 1 }}>
                                            {opportunity.num_vagas || 'Não informado'}
                                        </Typography>
                                    </Box>
                                    {/* --- FIM DO ALINHAMENTO DE DOIS LADOS --- */}

                                    {/* Botão Editar Oportunidade no rodapé do card */}
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            mt: 2,
                                            backgroundColor: 'black',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'darkgrey',
                                            },
                                            width: '100%',
                                            padding: '8px 0',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => handleEditClick(opportunity)}
                                    >
                                        Editar oportunidade
                                    </Button>
                                    {/* Botão Excluir pode ser adicionado aqui ou em um menu de ações no card */}
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        sx={{ mt: 1, width: '100%' }}
                                        onClick={() => handleDeleteClick(opportunity.id)}
                                    >
                                        Excluir
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Renderiza o Modal do Formulário */}
            <OportunidadeFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    // Limpar valores e alertas ao fechar o modal
                    setIsFormModalOpen(false);
                    setModalInitialValues(null);
                    setModalFormAlert(null); // Limpa alerta interno do modal ao fechar
                    console.log('Modal fechado.'); // Log para o fechamento
                }}
                onSubmit={handleFormSubmit}
                initialValues={modalInitialValues}
                isSubmitting={isModalSubmitting}
                formAlert={modalFormAlert}
                setFormAlert={setModalFormAlert} 
            />
        </div>
    );
}