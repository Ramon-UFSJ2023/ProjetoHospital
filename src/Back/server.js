const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors'); 
const bcrypt = require('bcryptjs');

const app = express();
const port = 3001; 

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'R@mon84149845',
  database: 'hospital',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/api/cadastro-paciente', async (req, res) => {
  const {
    cpf, email, senha, genero, data_nascimento,
    primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep,
    telefone
  } = req.body;

  if (!cpf || !email || !senha || !primeiro_nome || !telefone) {
    return res.status(400).json({ message: 'Dados obrigatórios faltando.' });
  }
  
  const salt = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash(senha, salt);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const queryUsuario = `
      INSERT INTO hospital.usuario 
      (cpf, email, senha, genero, data_nascimento, primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(queryUsuario, [
      cpf, email, senhaCriptografada, genero, data_nascimento,
      primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep
    ]);

    const queryPaciente = 'INSERT INTO hospital.paciente (cpf) VALUES (?)';
    await connection.execute(queryPaciente, [cpf]);

    const queryTelefone = 'INSERT INTO hospital.telefone (cpf, N_Telefone) VALUES (?, ?)';
    await connection.execute(queryTelefone, [cpf, telefone]);

    await connection.commit();
    res.status(201).json({ message: 'Paciente cadastrado com sucesso!' });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Erro no cadastro:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Erro: CPF ou Email já está cadastrado.' });
    }
    
    res.status(500).json({ message: 'Erro interno no servidor ao tentar cadastrar.' });
  
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { cpf, password } = req.body;

  if (!cpf || !password) {
    return res.status(400).json({ message: 'CPF e Senha são obrigatórios.' });
  }

  const cpfLimpo = cpf.replace(/\D/g, '');

  let connection;
  try {
    connection = await pool.getConnection();

    // Query única com LEFT JOINs para buscar todos os papéis do usuário
    // O 'f.cpf' é usado para os joins de medico e enfermeiro, conforme seu schema
    const queryLogin = `
      SELECT 
        u.cpf, 
        u.senha,
        u.primeiro_nome,
        p.cpf IS NOT NULL AS eh_paciente,
        f.cpf IS NOT NULL AS eh_funcionario,
        f.Eh_admin,
        m.cpf IS NOT NULL AS eh_medico,
        e.cpf IS NOT NULL AS eh_enfermeiro
      FROM 
        hospital.usuario u
      LEFT JOIN 
        hospital.paciente p ON u.cpf = p.cpf
      LEFT JOIN 
        hospital.funcionario f ON u.cpf = f.cpf
      LEFT JOIN 
        hospital.medico m ON f.cpf = m.cpf
      LEFT JOIN 
        hospital.enfermeiro e ON f.cpf = e.cpf
      WHERE 
        u.cpf = ?;
    `;
    
    const [rows] = await connection.execute(queryLogin, [cpfLimpo]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
    }

    const user = rows[0];
    const senhaSalva = user.senha;
    const isMatch = await bcrypt.compare(password, senhaSalva);

    if (!isMatch) {
      return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
    }

    // O '!!' (dupla negação) converte os valores (1, 0, NULL) 
    // do MySQL para 'true' ou 'false' no JSON.
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: {
        cpf: user.cpf,
        primeiro_nome: user.primeiro_nome,
        eh_paciente: !!user.eh_paciente,
        eh_funcionario: !!user.eh_funcionario,
        eh_admin: !!user.Eh_admin, // 'Eh_admin' vem do 'f.Eh_admin'
        eh_medico: !!user.eh_medico,
        eh_enfermeiro: !!user.eh_enfermeiro
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor durante o login.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post('/api/admin/cadastro-geral', async (req, res) => {
  const {
    typeCad,
    cpf, email, senha, genero, data_nascimento,
    primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep,
    telefone,
    salario, eh_admin, eh_conselho, carga_horaria,
    crm, especialidade,
    cofen, formacao
  } = req.body;

  if (!cpf || !email || !senha || !primeiro_nome || !telefone || !typeCad) {
    return res.status(400).json({ message: 'Dados básicos obrigatórios faltando.' });
  }

  const salt = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash(senha, salt);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const queryUsuario = `
      INSERT INTO hospital.usuario 
      (cpf, email, senha, genero, data_nascimento, primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(queryUsuario, [
      cpf, email, senhaCriptografada, genero, data_nascimento,
      primeiro_nome, sobrenome, rua, cidade, bairro, numero, cep
    ]);

    const queryTelefone = 'INSERT INTO hospital.telefone (cpf, N_Telefone) VALUES (?, ?)';
    await connection.execute(queryTelefone, [cpf, telefone]);

    if (typeCad === 'paciente') {
      const queryPaciente = 'INSERT INTO hospital.paciente (cpf, Observacoes) VALUES (?, NULL)';
      await connection.execute(queryPaciente, [cpf]);
    
    } else if (typeCad === 'medico' || typeCad === 'enfermeiro' || typeCad === 'funcionario') { // Adicionado 'funcionario'
      
      const queryFuncionario = `
        INSERT INTO hospital.funcionario (cpf, Salario, Eh_admin, Eh_Conselho, Carga_Horaria)
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.execute(queryFuncionario, [
        cpf, salario, eh_admin, eh_conselho, carga_horaria
      ]);

      if (typeCad === 'medico') {
        if (!crm || !especialidade) {
          await connection.rollback(); // Desfaz a transação
          return res.status(400).json({ message: 'CRM e Especialidade são obrigatórios para Médicos.' });
        }
        const queryMedico = 'INSERT INTO hospital.medico (cpf, CRM, Especialidade) VALUES (?, ?, ?)';
        await connection.execute(queryMedico, [cpf, crm, especialidade]);
      
      } else if (typeCad === 'enfermeiro') {
        if (!cofen || !formacao) {
          await connection.rollback(); // Desfaz a transação
          return res.status(400).json({ message: 'COFEN e Formação são obrigatórios para Enfermeiros.' });
        }
        const queryEnfermeiro = 'INSERT INTO hospital.enfermeiro (cpf, COFEN, Formacao) VALUES (?, ?, ?)';
        await connection.execute(queryEnfermeiro, [cpf, cofen, formacao]);
      }
      // Se for 'funcionario', não faz mais nada (já inseriu em 'funcionario')
    
    } else {
      await connection.rollback(); // Desfaz a transação
      return res.status(400).json({ message: 'Tipo de cadastro inválido.' });
    }

    await connection.commit();
    res.status(201).json({ message: `Cadastro de ${typeCad} realizado com sucesso!` });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Erro no cadastro geral:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Erro: CPF, Email, CRM ou COFEN já está cadastrado.' });
    }
    
    res.status(500).json({ message: 'Erro interno no servidor ao tentar o cadastro.' });
  
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-pacientes', async (req, res) => {
  const { busca } = req.query; // Pega o termo de busca (ex: ?busca=Davy)
  
  // Se 'busca' estiver vazio, searchTerm será '%%', que busca todos.
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query que busca em Pacientes, juntando com Usuário para pegar os nomes/emails
    // Busca por CPF OU por Nome Completo
    const query = `
      SELECT 
        u.cpf, 
        u.primeiro_nome, 
        u.sobrenome, 
        u.email, 
        u.cidade, 
        DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS data_nascimento_formatada
      FROM 
        hospital.usuario u
      JOIN 
        hospital.paciente p ON u.cpf = p.cpf
      WHERE 
        u.cpf LIKE ? OR CONCAT(u.primeiro_nome, ' ', u.sobrenome) LIKE ?
      ORDER BY 
        u.primeiro_nome;
    `;
    
    const [rows] = await connection.execute(query, [searchTerm, searchTerm]);
    
    res.status(200).json(rows); // Retorna a lista de pacientes

  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar pacientes.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-funcionarios', async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query que busca em Funcionários e junta com Usuário, Médico e Enfermeiro
    const query = `
      SELECT 
        u.cpf, 
        u.primeiro_nome, 
        u.sobrenome, 
        u.email, 
        f.Salario,
        f.Eh_admin,
        -- Cria uma coluna 'cargo' baseada nas outras tabelas
        CASE
            WHEN m.cpf IS NOT NULL THEN CONCAT('Médico (', m.Especialidade, ')')
            WHEN e.cpf IS NOT NULL THEN e.Formacao
            ELSE 'Administrativo/Outro'
        END AS cargo
      FROM 
        hospital.usuario u
      JOIN 
        hospital.funcionario f ON u.cpf = f.cpf
      LEFT JOIN
        hospital.medico m ON f.cpf = m.cpf
      LEFT JOIN
        hospital.enfermeiro e ON f.cpf = e.cpf
      WHERE 
        u.cpf LIKE ? OR CONCAT(u.primeiro_nome, ' ', u.sobrenome) LIKE ?
      ORDER BY 
        u.primeiro_nome;
    `;
    
    const [rows] = await connection.execute(query, [searchTerm, searchTerm]);
    
    res.status(200).json(rows); // Retorna a lista de funcionários

  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar funcionários.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-consultas', async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query que junta consulta com os nomes de usuário do paciente (up) e do médico (um)
    const query = `
      SELECT 
        c.CPF_P,
        c.Numero,
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
        CONCAT(um.primeiro_nome, ' ', um.sobrenome) AS nome_medico,
        DATE_FORMAT(c.Data_Inicio, '%d/%m/%Y %H:%i') AS data_consulta,
        CONCAT(c.Bloco_Consultorio, ' / Andar ', c.Andar_Consultorio, ' / Sala ', c.N_Consultorio) AS localizacao,
        c.Valor,
        c.Esta_Paga,
        c.Internacao
      FROM 
        hospital.consulta c
      JOIN 
        hospital.usuario up ON c.CPF_P = up.cpf -- 'up' = Usuário Paciente
      JOIN 
        hospital.usuario um ON c.CPF_M = um.cpf -- 'um' = Usuário Médico
      WHERE
        -- Busca pelo nome do paciente, nome do médico, ou CPF de um deles
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) LIKE ? OR
        CONCAT(um.primeiro_nome, ' ', um.sobrenome) LIKE ? OR
        c.CPF_P LIKE ? OR
        c.CPF_M LIKE ?
      ORDER BY 
        c.Data_Inicio DESC; -- Mostra as consultas mais recentes primeiro
    `;
    
    // Precisamos passar o searchTerm 4 vezes, uma para cada '?' na query
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows); // Retorna a lista de consultas

  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar consultas.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-cirurgias', async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query complexa que junta cirurgia, paciente (up), e médicos (um)
    const query = `
      SELECT 
        c.CPF_P,
        c.Numero,
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
        
        -- Concatena todos os médicos que realizaram a cirurgia em uma string
        GROUP_CONCAT(DISTINCT CONCAT(um.primeiro_nome, ' ', um.sobrenome) SEPARATOR ', ') AS medicos,
        
        DATE_FORMAT(c.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
        DATE_FORMAT(c.Data_Finalizacao, '%d/%m/%Y %H:%i') AS data_finalizacao_formatada,
        CONCAT(c.Bloco_Sala_Cirurgia, ' / Sala ', c.N_Sala_Cirurgia) AS localizacao,
        c.Valor,
        c.Esta_Paga
      FROM 
        hospital.cirurgia c
      JOIN 
        hospital.usuario up ON c.CPF_P = up.cpf -- 'up' = Usuário Paciente
      LEFT JOIN 
        hospital.realiza r ON c.CPF_P = r.CPF_P AND c.Numero = r.N_Cirurgia
      LEFT JOIN 
        hospital.usuario um ON r.CPF_M = um.cpf -- 'um' = Usuário Médico
      
      -- Agrupamos por cirurgia para o GROUP_CONCAT funcionar
      GROUP BY
        c.CPF_P, c.Numero
      
      -- HAVING filtra *depois* do agrupamento, permitindo buscar no nome do médico
      HAVING 
        nome_paciente LIKE ? OR
        c.CPF_P LIKE ? OR
        medicos LIKE ?
        
      ORDER BY 
        c.Data_Entrada DESC; -- Cirurgias mais recentes primeiro
    `;
    
    // Passa o searchTerm 3 vezes (para os 3 '?' do HAVING)
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows); // Retorna a lista de cirurgias

  } catch (error) {
    console.error('Erro ao buscar cirurgias:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar cirurgias.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/medicos', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT 
        u.cpf, 
        CONCAT(u.primeiro_nome, ' ', u.sobrenome) AS nome_completo, 
        m.Especialidade
      FROM 
        hospital.usuario u
      JOIN 
        hospital.medico m ON u.cpf = m.cpf
      ORDER BY
        u.primeiro_nome;
    `;
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/consultorios', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT Bloco, Anexo, Andar, Numero, Especialidade 
      FROM hospital.consultorio
      ORDER BY Bloco, Andar, Numero;
    `;
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao buscar consultórios:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/alocacoes', async (req, res) => {
  const { Bloco, Anexo, Andar, Numero, data_inicio_semana, data_fim_semana } = req.query;

  if (!Bloco || !Anexo || !Andar || !Numero || !data_inicio_semana || !data_fim_semana) {
    return res.status(400).json({ message: 'Parâmetros de consultório e semana são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    // Busca todas as alocações para aquele consultório, naquela semana, e traz o nome do médico
    const query = `
      SELECT 
        t.CPF_M,
        t.Data_Inicio,
        t.Data_Fim,
        CONCAT(u.primeiro_nome, ' ', u.sobrenome) AS nome_medico
      FROM 
        hospital.trabalha_em t
      JOIN 
        hospital.usuario u ON t.CPF_M = u.cpf
      WHERE 
        t.Bloco_Consultorio = ? AND
        t.Anexo_Consultorio = ? AND
        t.Andar_Consultorio = ? AND
        t.N_Consultorio = ? AND
        t.Data_Inicio >= ? AND
        t.Data_Fim <= ?
    `;
    const [rows] = await connection.execute(query, [Bloco, Anexo, Andar, Numero, data_inicio_semana, data_fim_semana]);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao buscar alocações:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/alocar', async (req, res) => {
  const { cpf_m, bloco, anexo, andar, numero, data_inicio, data_fim } = req.body;

  if (!cpf_m || !bloco || !andar || !anexo || !numero || !data_inicio || !data_fim) {
    return res.status(400).json({ message: 'Dados de alocação incompletos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      INSERT INTO hospital.trabalha_em 
      (CPF_M, Bloco_Consultorio, Anexo_Consultorio, Andar_Consultorio, N_Consultorio, Data_Inicio, Data_Fim)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [cpf_m, bloco, anexo, andar, numero, data_inicio, data_fim]);
    res.status(201).json({ message: 'Médico alocado com sucesso!' });

  } catch (error) {
    console.error('Erro ao alocar:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Conflito! Este horário já está ocupado.' });
    }
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/desalocar', async (req, res) => {
  const { cpf_m, bloco, anexo, andar, numero, data_inicio } = req.body;

  if (!cpf_m || !bloco || !andar || !numero || !data_inicio) {
    return res.status(400).json({ message: 'Dados de desalocação incompletos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      DELETE FROM hospital.trabalha_em 
      WHERE
        CPF_M = ? AND
        Bloco_Consultorio = ? AND
        Anexo_Consultorio = ? AND
        Andar_Consultorio = ? AND
        N_Consultorio = ? AND
        Data_Inicio = ?
    `;
    const [result] = await connection.execute(query, [cpf_m, bloco, anexo, andar, numero, data_inicio]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Horário liberado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Alocação não encontrada para remover.' });
    }
    
  } catch (error) {
    console.error('Erro ao desalocar:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/buscar-alocacoes-leitos', async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Query que junta 'cuida_leito' com 'usuario' (para nome do enfermeiro)
    // e 'leito' (para status de ocupação)
    const query = `
      SELECT 
        cl.CPF_E,
        CONCAT(u.primeiro_nome, ' ', u.sobrenome) AS nome_enfermeiro,
        
        -- Concatena a localização completa do leito
        CONCAT(
            'Bloco ', cl.Bloco_Leito, 
            ', Anexo ', cl.Anexo_Leito, 
            ', Andar ', cl.Andar_Leito, 
            ', Sala ', cl.N_Sala_Leito, 
            ', Leito ', cl.N_Leito
        ) AS localizacao_leito,
        
        l.Ocupado AS leito_ocupado,
        DATE_FORMAT(cl.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
        DATE_FORMAT(cl.Data_Saida, '%d/%m/%Y %H:%i') AS data_saida_formatada,
        
        -- Coluna de status para saber se a alocação está ativa
        CASE
            WHEN cl.Data_Saida IS NULL THEN 'ATIVO'
            ELSE 'FINALIZADO'
        END AS status_alocacao
      FROM 
        hospital.cuida_leito cl
      JOIN 
        hospital.usuario u ON cl.CPF_E = u.cpf
      LEFT JOIN 
        hospital.leito l ON cl.Bloco_Leito = l.Bloco_Leito AND 
                           cl.Anexo_Leito = l.Anexo_Leito AND 
                           cl.Andar_Leito = l.Andar_Leito AND 
                           cl.N_Sala_Leito = l.N_Sala AND 
                           cl.N_Leito = l.N_Leito
      WHERE
        -- Busca por nome do enfermeiro, CPF ou número do leito
        CONCAT(u.primeiro_nome, ' ', u.sobrenome) LIKE ? OR
        cl.CPF_E LIKE ? OR
        cl.N_Leito LIKE ?
      ORDER BY 
        cl.Data_Saida IS NULL DESC, -- Mostra ativos primeiro
        cl.Data_Entrada DESC;      -- Depois os mais recentes
    `;
    
    // 3 parâmetros de busca (para os 3 '?' da query)
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json(rows); 

  } catch (error) {
    console.error('Erro ao buscar alocações de leitos:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar alocações.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});