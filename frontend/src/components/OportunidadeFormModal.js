// frontend/src/components/OportunidadeFormModal.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField, Button, Typography, CircularProgress, Alert,
    MenuItem, Select, InputLabel, FormControl, Modal, Box, IconButton, Divider, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IMaskInput } from 'react-imask';

// Função auxiliar para converter DD/MM/AAAA para objeto Date
const parseDateString = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    // Mês é 0-indexado no JavaScript
    const date = new Date(year, month - 1, day);
    // Verificar se a data é válida (e.g., 31 de fev vira 2 de mar ou 40 de out)
    // Se o ano, mês ou dia do objeto Date não corresponder ao que foi passado, é inválido
    if (date.getFullYear() !== year || date.getMonth() !== (month - 1) || date.getDate() !== day) {
        return null; // Data inválida
    }
    return date;
};

// Função auxiliar para converter HH:MM para objeto Date (com data arbitrária)
const parseTimeString = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    // Usamos uma data arbitrária (e.g., 2000-01-01) apenas para comparar horários
    return new Date(2000, 0, 1, hours, minutes);
};


// --- SCHEMA DE VALIDAÇÃO YUP COMPLETO E ATUALIZADO ---
const opportunityValidationSchema = Yup.object().shape({
    titulo: Yup.string().required('O nome da ação é obrigatório'),
    tipo_acao: Yup.string().oneOf(
        ['Educação', 'Saúde', 'Direitos Humanos', 'Meio Ambiente', 'Assistência Social', 'Cultura e Esporte', 'Causa Animal', 'Inclusão Digital', 'Desenvolvimento Comunitário', 'Outros'],
        'Selecione um tipo de ação válido'
    ).required('O tipo de ação é obrigatório'),
    endereco: Yup.string().required('O endereço é obrigatório'),

    data_inicio: Yup.string()
        .matches(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
            'Insira uma data válida (DD/MM/AAAA).'
        )
        .nullable()
        .test(
            'data-inicio-valida-calendario',
            'Insira uma data de início válida (ex: 29/02 em ano bissexto).',
            function (value) {
                if (!value) return true;
                return parseDateString(value) !== null;
            }
        )
        .test(
            'data-inicio-requerida-se-termino',
            'Data de início é obrigatória se data/hora de término for preenchida.',
            function (value) {
                const { data_termino, hora_inicio, hora_termino } = this.parent;
                if ((data_termino && data_termino.length > 0) || (hora_inicio && hora_inicio.length > 0) || (hora_termino && hora_termino.length > 0)) {
                    return (value && value.length > 0);
                }
                return true;
            }
        ),

    data_termino: Yup.string()
        .matches(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
            'Insira uma data válida (DD/MM/AAAA).'
        )
        .nullable()
        .test(
            'data-termino-valida-calendario',
            'Insira uma data de término válida (ex: 31/04 não existe).',
            function (value) {
                if (!value) return true;
                return parseDateString(value) !== null;
            }
        )
        .test(
            'data-termino-posterior-inicio',
            'Data de término não pode ser anterior à data de início.',
            function (value) {
                const { data_inicio } = this.parent;
                if (!value || !data_inicio || parseDateString(value) === null || parseDateString(data_inicio) === null) {
                    return true;
                }
                const inicio = parseDateString(data_inicio);
                const termino = parseDateString(value);
                return termino >= inicio;
            }
        ),

    hora_inicio: Yup.string()
        .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            'Insira um horário válido (HH:MM).'
        )
        .nullable()
        .test(
            'hora-inicio-requerida-se-termino',
            'Horário de início é obrigatório se horário de término for preenchido.',
            function (value) {
                const { hora_termino } = this.parent;
                if ((hora_termino && hora_termino.length > 0) && (!value || value.length === 0)) {
                    return false;
                }
                return true;
            }
        ),
        
    hora_termino: Yup.string()
        .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            'Insira um horário válido (HH:MM).'
        )
        .nullable()
        .test(
            'hora-termino-posterior-inicio-mesmo-dia',
            'Horário de término deve ser posterior ao de início no mesmo dia.',
            function (value) {
                const { data_inicio, data_termino, hora_inicio } = this.parent;

                if (!value || !hora_inicio) {
                    return true;
                }

                const parsedHoraInicio = parseTimeString(hora_inicio);
                const parsedHoraTermino = parseTimeString(value);

                if (parsedHoraInicio === null || parsedHoraTermino === null) {
                    return true;
                }

                const parsedDataInicio = parseDateString(data_inicio);
                const parsedDataTermino = parseDateString(data_termino);

                if (parsedDataInicio && parsedDataTermino &&
                    parsedDataInicio.getTime() === parsedDataTermino.getTime()) {
                    return parsedHoraTermino > parsedHoraInicio;
                }
                
                return true;
            }
        ),

    perfil_voluntario: Yup.string().nullable(),
    descricao: Yup.string().required('A descrição da oportunidade é obrigatória'),
    ong_nome: Yup.string().required('O nome da ONG é obrigatório'),
    num_vagas: Yup.number().nullable().min(1, 'Mínimo 1 vaga').integer('Deve ser um número inteiro'),
    status_vaga: Yup.string().oneOf(['ativa', 'inativa', 'encerrada', 'em_edicao'], 'Status inválido').required('O status é obrigatório'),
});

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '60%', md: '500px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '95vh',
    overflowY: 'auto',
};

const MaskedInputCustom = React.forwardRef(function MaskedInputCustom(props, ref) {
    const { onChange, mask, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask={mask}
            definitions={{
                '#': /[0-9]/,
            }}
            inputRef={ref}
            onAccept={(value) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

export default function OportunidadeFormModal({ isOpen, onClose, onSubmit, initialValues, isSubmitting, formAlert, setFormAlert }) {
    // Estado para armazenar os valores originais da oportunidade para comparação de alterações
    const [originalOpportunityValues, setOriginalOpportunityValues] = React.useState(null);

    const opportunityFormik = useFormik({
        initialValues: initialValues || {
            titulo: '',
            tipo_acao: '',
            endereco: '',
            data_inicio: '',
            data_termino: '',
            hora_inicio: '',
            hora_termino: '',
            perfil_voluntario: '',
            descricao: '',
            ong_nome: '',
            num_vagas: '',
            status_vaga: 'ativa',
        },
        validationSchema: opportunityValidationSchema,
        onSubmit: async (values) => {
            // Inicia a medição de tempo no clique do botão
            console.time('Modal Close Time - Desde o Clique do Botão');

            // 2. Lógica de "Nenhuma alteração detectada"
            if (initialValues?.id) { // Apenas se estiver no modo de edição
                const cleanCurrentValues = { ...values };
                const cleanOriginalValues = { ...originalOpportunityValues };

                delete cleanCurrentValues.id;
                delete cleanOriginalValues.id;

                Object.keys(cleanCurrentValues).forEach(key => {
                    if (cleanCurrentValues[key] === null || cleanCurrentValues[key] === undefined) {
                        cleanCurrentValues[key] = '';
                    }
                });
                Object.keys(cleanOriginalValues).forEach(key => {
                    if (cleanOriginalValues[key] === null || cleanOriginalValues[key] === undefined) {
                        cleanOriginalValues[key] = '';
                    }
                });

                const hasChanges = JSON.stringify(cleanCurrentValues) !== JSON.stringify(cleanOriginalValues);

                if (!hasChanges) {
                    setFormAlert({ severity: 'info', message: 'Nenhuma alteração detectada.' });
                    console.log('Nenhuma alteração detectada. Prosseguindo com o salvamento.');
                } else {
                    if (formAlert?.severity === 'info' && formAlert?.message === 'Nenhuma alteração detectada.') {
                         setFormAlert(null);
                    }
                }
            }

            // Ação principal: Submissão da API
            // Envolver a chamada onSubmit em uma Promise para controlar o tempo
            const submitApiPromise = onSubmit(values); // Esta função já deve retornar uma Promise

            // Criar uma Promise para o tempo limite do fechamento
            // Queremos que o modal feche no máximo em 900ms a partir do clique
            const MIN_CLOSE_TIME_MS = 300; // Tempo mínimo para o modal ficar aberto (feedback visual)
            const MAX_CLOSE_TIME_MS = 900; // Tempo máximo para o modal fechar desde o clique

            const apiResponseReceivedTime = Date.now(); // Tempo em que a chamada da API foi feita

            try {
                // Aguarda a resposta da API OU o tempo limite mínimo para fechamento
                await Promise.race([
                    submitApiPromise, // Resposta da API
                    new Promise(resolve => setTimeout(resolve, MIN_CLOSE_TIME_MS)) // Tempo mínimo de exibição
                ]);
                console.log('Resposta da API ou tempo mínimo de exibição alcançado.');

                // Calcula quanto tempo se passou desde o clique
                const timeElapsedSinceClick = Date.now() - console.time('Modal Close Time - Desde o Clique do Botão'); // Re-inicia o timer para obter o elapsed time
                
                // Calcula o tempo restante para atingir o MAX_CLOSE_TIME_MS
                const remainingTimeForMaxClose = MAX_CLOSE_TIME_MS - timeElapsedSinceClick;

                // Garante que o modal feche após um tempo mínimo total, mas não mais que o máximo
                if (remainingTimeForMaxClose > 0) {
                    console.log(`Fechando modal em ${remainingTimeForMaxClose}ms para atingir o tempo máximo de 900ms.`);
                    setTimeout(onClose, remainingTimeForMaxClose);
                } else {
                    console.log('Fechando modal imediatamente, tempo máximo já excedido.');
                    onClose(); // Fecha imediatamente se o tempo já excedeu o máximo
                }

                console.log('Submissão da API concluída com sucesso.');

            } catch (error) {
                console.error("Erro ao submeter o formulário (tratado no onSubmit da prop):", error);
                // Em caso de erro, talvez não queiramos fechar o modal imediatamente para mostrar o erro.
                // Mas se o objetivo é sempre fechar rápido, podemos fechar aqui também.
                // Por agora, vamos manter o modal aberto para que o usuário veja a mensagem de erro.
            } finally {
                // Termina a medição de tempo total da submissão
                console.timeEnd('Modal Close Time - Desde o Clique do Botão');
            }
        },
        enableReinitialize: true,
    });

    // Efeito para resetar o formulário ou carregar valores iniciais quando o modal abre/fecha
    React.useEffect(() => {
        if (!isOpen) {
            opportunityFormik.resetForm();
            setOriginalOpportunityValues(null); // Limpar os valores originais
            if (setFormAlert) { // Limpar o alerta ao fechar
                setFormAlert(null);
            }
        } else if (initialValues) {
            const sanitizedValues = {
                ...initialValues,
                data_inicio: initialValues.data_inicio || '',
                data_termino: initialValues.data_termino || '',
                hora_inicio: initialValues.hora_inicio || '',
                hora_termino: initialValues.hora_termino || '',
                num_vagas: initialValues.num_vagas !== null && initialValues.num_vagas !== undefined ? String(initialValues.num_vagas) : '',
                status_vaga: initialValues.status_vaga || 'ativa',
            };
            opportunityFormik.setValues(sanitizedValues);
            setOriginalOpportunityValues(JSON.parse(JSON.stringify(sanitizedValues)));
        }
    }, [isOpen, initialValues, opportunityFormik.resetForm, opportunityFormik.setValues]);

    return (
        <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box sx={modalStyle}>
                <IconButton onClick={() => {
                    console.time('Modal Close Time - Cancel Button'); // Medição ao cancelar
                    onClose();
                    console.timeEnd('Modal Close Time - Cancel Button'); // Fim da medição
                }} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" component="h2" gutterBottom>
                    {initialValues?.id ? 'Editar Oportunidade' : 'Cadastrar Nova Oportunidade'}
                </Typography>

                {formAlert && (
                    <Alert severity={formAlert.severity} sx={{ mb: 2 }}>
                        {formAlert.message}
                    </Alert>
                )}

                <form onSubmit={opportunityFormik.handleSubmit}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>Identificação da ONG</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <TextField
                                fullWidth
                                label="Nome da ONG"
                                name="ong_nome"
                                value={opportunityFormik.values.ong_nome}
                                onChange={opportunityFormik.handleChange}
                                error={opportunityFormik.touched.ong_nome && Boolean(opportunityFormik.errors.ong_nome)}
                                helperText={opportunityFormik.touched.ong_nome && opportunityFormik.errors.ong_nome}
                                disabled={!!initialValues?.id}
                                InputProps={initialValues?.id ? { readOnly: true } : {}}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" gutterBottom>Informações da Oportunidade</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Nome da Oportunidade"
                                    name="titulo"
                                    value={opportunityFormik.values.titulo}
                                    onChange={opportunityFormik.handleChange}
                                    error={opportunityFormik.touched.titulo && Boolean(opportunityFormik.errors.titulo)}
                                    helperText={opportunityFormik.touched.titulo && opportunityFormik.errors.titulo}
                                />

                                <FormControl fullWidth error={opportunityFormik.touched.tipo_acao && Boolean(opportunityFormik.errors.tipo_acao)}>
                                    <InputLabel>Tipo de Oportunidade</InputLabel>
                                    <Select
                                        name="tipo_acao"
                                        label="Tipo de Oportunidade"
                                        value={opportunityFormik.values.tipo_acao}
                                        onChange={opportunityFormik.handleChange}
                                    >
                                        <MenuItem value=""><em>Nenhum</em></MenuItem>
                                        {['Educação', 'Saúde', 'Direitos Humanos', 'Meio Ambiente', 'Assistência Social', 'Cultura e Esporte', 'Causa Animal', 'Inclusão Digital', 'Desenvolvimento Comunitário', 'Outros'].map((tipo) => (
                                            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                        ))}
                                    </Select>
                                    {opportunityFormik.touched.tipo_acao && opportunityFormik.errors.tipo_acao && (
                                        <Typography variant="caption" color="error">{opportunityFormik.errors.tipo_acao}</Typography>
                                    )}
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label="Endereço Completo"
                                    name="endereco"
                                    value={opportunityFormik.values.endereco}
                                    onChange={opportunityFormik.handleChange}
                                    error={opportunityFormik.touched.endereco && Boolean(opportunityFormik.errors.endereco)}
                                    helperText={opportunityFormik.touched.endereco && opportunityFormik.errors.endereco}
                                />

                                {/* CAMPOS DE DATA INÍCIO E DATA TÉRMINO */}
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <TextField
                                        fullWidth
                                        label="Data de Início (DD/MM/AAAA)"
                                        name="data_inicio"
                                        value={opportunityFormik.values.data_inicio}
                                        onChange={opportunityFormik.handleChange}
                                        error={opportunityFormik.touched.data_inicio && Boolean(opportunityFormik.errors.data_inicio)}
                                        helperText={opportunityFormik.touched.data_inicio && opportunityFormik.errors.data_inicio}
                                        InputProps={{
                                            inputComponent: MaskedInputCustom,
                                            inputProps: { mask: '00/00/0000' },
                                        }}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Data de Término (DD/MM/AAAA)"
                                        name="data_termino"
                                        value={opportunityFormik.values.data_termino}
                                        onChange={opportunityFormik.handleChange}
                                        error={opportunityFormik.touched.data_termino && Boolean(opportunityFormik.errors.data_termino)}
                                        helperText={opportunityFormik.touched.data_termino && opportunityFormik.errors.data_termino}
                                        InputProps={{
                                            inputComponent: MaskedInputCustom,
                                            inputProps: { mask: '00/00/0000' },
                                        }}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                </Box>

                                {/* CAMPOS DE HORÁRIO INÍCIO E HORÁRIO TÉRMINO */}
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <TextField
                                        fullWidth
                                        label="Horário de Início (HH:MM)"
                                        name="hora_inicio"
                                        value={opportunityFormik.values.hora_inicio}
                                        onChange={opportunityFormik.handleChange}
                                        error={opportunityFormik.touched.hora_inicio && Boolean(opportunityFormik.errors.hora_inicio)}
                                        helperText={opportunityFormik.touched.hora_inicio && opportunityFormik.errors.hora_inicio}
                                        InputProps={{
                                            inputComponent: MaskedInputCustom,
                                            inputProps: { mask: '00:00' }
                                        }}
                                        sx={{ flex: 1, minWidth: '100px' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Horário de Término (HH:MM)"
                                        name="hora_termino"
                                        value={opportunityFormik.values.hora_termino}
                                        onChange={opportunityFormik.handleChange}
                                        error={opportunityFormik.touched.hora_termino && Boolean(opportunityFormik.errors.hora_termino)}
                                        helperText={opportunityFormik.touched.hora_termino && opportunityFormik.errors.hora_termino}
                                        InputProps={{
                                            inputComponent: MaskedInputCustom,
                                            inputProps: { mask: '00:00' }
                                        }}
                                        sx={{ flex: 1, minWidth: '100px' }}
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Perfil do Voluntário"
                                    name="perfil_voluntario"
                                    multiline
                                    rows={2}
                                    value={opportunityFormik.values.perfil_voluntario}
                                    onChange={opportunityFormik.handleChange}
                                    error={opportunityFormik.touched.perfil_voluntario && Boolean(opportunityFormik.errors.perfil_voluntario)}
                                    helperText={opportunityFormik.touched.perfil_voluntario && opportunityFormik.errors.perfil_voluntario}
                                />

                                <TextField
                                    fullWidth
                                    label="Descrição da Oportunidade"
                                    name="descricao"
                                    multiline
                                    rows={4}
                                    value={opportunityFormik.values.descricao}
                                    onChange={opportunityFormik.handleChange}
                                    error={opportunityFormik.touched.descricao && Boolean(opportunityFormik.errors.descricao)}
                                    helperText={opportunityFormik.touched.descricao && opportunityFormik.errors.descricao}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" gutterBottom>Detalhes da Vaga</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    fullWidth
                                    label="Número de Vagas"
                                    name="num_vagas"
                                    type="number"
                                    value={opportunityFormik.values.num_vagas}
                                    onChange={opportunityFormik.handleChange}
                                    error={opportunityFormik.touched.num_vagas && Boolean(opportunityFormik.errors.num_vagas)}
                                    helperText={opportunityFormik.touched.num_vagas && opportunityFormik.errors.num_vagas}
                                    sx={{ flex: 1, minWidth: '150px' }}
                                />
                                <FormControl fullWidth error={opportunityFormik.touched.status_vaga && Boolean(opportunityFormik.errors.status_vaga)} sx={{ flex: 1, minWidth: '150px' }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status_vaga"
                                        label="Status"
                                        value={opportunityFormik.values.status_vaga}
                                        onChange={opportunityFormik.handleChange}
                                    >
                                        <MenuItem value="ativa">Ativa</MenuItem>
                                        <MenuItem value="inativa">Inativa</MenuItem>
                                        <MenuItem value="encerrada">Encerrada</MenuItem>
                                        <MenuItem value="em_edicao">Em Edição</MenuItem>
                                    </Select>
                                    {opportunityFormik.touched.status_vaga && opportunityFormik.errors.status_vaga && (
                                        <Typography variant="caption" color="error">{opportunityFormik.errors.status_vaga}</Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Box>

                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                                sx={{
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        backgroundColor: '#333',
                                    },
                                    width: '100%',
                                }}
                            >
                                {initialValues?.id ? 'Atualizar Oportunidade' : 'Cadastrar Oportunidade'}
                            </Button>
                            {initialValues?.id && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                        console.time('Modal Close Time - Cancel Button'); // Medição ao cancelar
                                        onClose();
                                        console.timeEnd('Modal Close Time - Cancel Button'); // Fim da medição
                                    }}
                                    sx={{ width: '100%' }}
                                >
                                    Cancelar Edição
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}