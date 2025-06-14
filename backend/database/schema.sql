-- backend/database/schema.sql

-- NOTA: As linhas CREATE DATABASE e USE site_voluntariado foram removidas.
-- As tabelas serão criadas diretamente no banco de dados "railway" fornecido pelo Railway.

-- ===================================================================
-- 2) Tabela de ONGs
-- ===================================================================
CREATE TABLE IF NOT EXISTS ongs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 3) Tabela de Oportunidades
-- ===================================================================
CREATE TABLE IF NOT EXISTS oportunidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ong_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo_acao VARCHAR(100) NULL,
    endereco VARCHAR(255) NOT NULL,
    data_inicio VARCHAR(10) NULL,
    data_termino VARCHAR(10) NULL,
    hora_inicio VARCHAR(5) NULL,
    hora_termino VARCHAR(5) NULL,
    perfil_voluntario TEXT,
    descricao TEXT NOT NULL,
    num_vagas INT,
    status_vaga ENUM('ativa', 'inativa', 'encerrada', 'em_edicao') DEFAULT 'ativa',
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE CASCADE
);

-- ===================================================================
-- 4) Tabela de Voluntários
-- ===================================================================
CREATE TABLE IF NOT EXISTS voluntarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    data_nascimento DATE,
    cpf VARCHAR(14) UNIQUE,
    interesses TEXT,
    disponibilidade TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5) Tabela de Inscrições
-- ===================================================================
CREATE TABLE IF NOT EXISTS inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    oportunidade_id INT NOT NULL,
    voluntario_id INT NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_inscricao ENUM('pendente', 'aprovada', 'rejeitada', 'cancelada') DEFAULT 'pendente',

    FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id) ON DELETE CASCADE,
    FOREIGN KEY (voluntario_id) REFERENCES voluntarios(id) ON DELETE CASCADE,
    UNIQUE (oportunidade_id, voluntario_id)
);

-- ===================================================================
-- 6) Dados de exemplo para testes iniciais (ONG de exemplo mantida)
-- ===================================================================

INSERT INTO ongs (nome, email, senha, endereco)
VALUES ('ONG Amor e Cuidado', 'amor.cuidado@exemplo.com', 'senha_hash_aqui', 'Rua da Solidariedade, 456, São Paulo')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email);
