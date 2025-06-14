import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importa as funções de API do seu api.js
// Ajuste o caminho relativo se o seu api.js estiver em outro lugar
import { fetchOpportunities, submitApplication } from '../../services/api'; 

// Validação do formulário
const validationSchema = Yup.object({
    fullName: Yup.string().required('Obrigatório'),
    birthDate: Yup.date().required('Obrigatório'),
    cpf: Yup.string().matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    motivation: Yup.string().required('Explique sua motivação')
});

// REMOVEMOS AS FUNÇÕES consultar_oportunidades e salvarInscricao DAQUI,
// POIS USAREMOS AS VERSÕES DO api.js DIRETAMENTE NO COMPONENTE

// Componente principal
export default function SubscriptionForm() {
    const [oportunidadeId, setOportunidadeId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Usa a função fetchOpportunities do api.js
        fetchOpportunities().then(response => {
            const oportunidades = response.data; // Axios retorna os dados em .data
            if (oportunidades && oportunidades.length > 0) {
                setOportunidadeId(oportunidades[0].id);
            } else {
                console.warn('Nenhuma oportunidade encontrada.');
            }
        }).catch(error => { // Captura erros da requisição GET
            console.error('Erro ao carregar oportunidades:', error.response ? error.response.data : error.message);
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            fullName: '',
            birthDate: '',
            cpf: '',
            motivation: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!oportunidadeId) {
                alert("Nenhuma oportunidade disponível para inscrição.");
                return;
            }

            const dadosInscricao = {
                nome: values.fullName,
                nascimento: values.birthDate,
                cpf: values.cpf,
                mensagem: values.motivation,
                oportunidade_id: oportunidadeId
            };

            try {
                // Usa a função submitApplication do api.js
                const response = await submitApplication(dadosInscricao); 
                // O backend retorna {"success": true} para esta rota
                if (response.data && response.data.success) {
                    alert("Inscrição enviada com sucesso!");
                    navigate('/volunteer'); // Ajuste a rota se necessário
                } else {
                    alert("Erro ao enviar inscrição: Sucesso não confirmado pelo backend.");
                    console.error('Sucesso não confirmado pelo backend:', response.data);
                }
            } catch (error) { // Captura erros da requisição POST
                let errorMessage = "Erro ao enviar inscrição.";
                if (error.response) {
                    errorMessage += ` Detalhes: ${error.response.data.detail || error.response.data.error || error.message}`;
                } else {
                    errorMessage += ` Detalhes: ${error.message}`;
                }
                alert(errorMessage);
                console.error('Erro ao enviar inscrição:', error);
            }
        }
    });

    return (
        <Paper sx={{ p: 3, maxWidth: 600, margin: '20px auto' }}>
            <Typography variant="h4" gutterBottom>Candidatura</Typography>

            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nome Completo"
                            name="fullName"
                            value={formik.values.fullName}
                            onChange={formik.handleChange}
                            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                            helperText={formik.touched.fullName && formik.errors.fullName}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Data de Nascimento"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            name="birthDate"
                            value={formik.values.birthDate}
                            onChange={formik.handleChange}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="CPF"
                            name="cpf"
                            placeholder="000.000.000-00"
                            value={formik.values.cpf}
                            onChange={formik.handleChange}
                            error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                            helperText={formik.touched.cpf && formik.errors.cpf}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Motivação"
                            name="motivation"
                            value={formik.values.motivation}
                            onChange={formik.handleChange}
                            error={formik.touched.motivation && Boolean(formik.errors.motivation)}
                            helperText={formik.touched.motivation && formik.errors.motivation}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={formik.isSubmitting || !oportunidadeId} // Adicione formik.isSubmitting para desabilitar enquanto envia
                        >
                            Enviar Candidatura
                        </Button>
                        <Button variant="outlined" sx={{ ml: 2 }}>Cancelar</Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}