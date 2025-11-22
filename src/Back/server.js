const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001; 

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '10.%7Mpa?6~V',
  database: 'hospital',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = '(o[26ofY48oj{ddde@i$~8^l%'; 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        req.user = user; 
        next();
    });
}

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

    const queryLogin = `
      SELECT 
        u.cpf, 
        u.senha,
        u.primeiro_nome,
        p.cpf IS NOT NULL AS eh_paciente,
        f.cpf IS NOT NULL AS eh_funcionario,
        f.Eh_admin,
        f.Eh_Conselho, 
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

    const userData = {
        cpf: user.cpf,
        primeiro_nome: user.primeiro_nome,
        eh_paciente: !!user.eh_paciente,
        eh_funcionario: !!user.eh_funcionario,
        eh_admin: !!user.Eh_admin, 
        eh_conselho: !!user.Eh_Conselho, 
        eh_medico: !!user.eh_medico,
        eh_enfermeiro: !!user.eh_enfermeiro
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '2h' }); 

    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: userData,
      token: token 
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
    crm, especialidades, 
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
    
    } else if (typeCad === 'medico' || typeCad === 'enfermeiro' || typeCad === 'funcionario') { 
      
      const queryPacienteFunc = 'INSERT IGNORE INTO hospital.paciente (cpf) VALUES (?)';
      await connection.execute(queryPacienteFunc, [cpf]);

      const queryFuncionario = `
        INSERT INTO hospital.funcionario (cpf, Salario, Eh_admin, Eh_Conselho, Carga_Horaria)
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.execute(queryFuncionario, [
        cpf, salario, eh_admin, eh_conselho, carga_horaria
      ]);

      if (typeCad === 'medico') {
        if (!crm || !especialidades || especialidades.length === 0) {
          await connection.rollback(); 
          return res.status(400).json({ message: 'CRM e pelo menos uma Especialidade são obrigatórios.' });
        }

        const queryMedico = 'INSERT INTO hospital.medico (cpf, CRM) VALUES (?, ?)';
        await connection.execute(queryMedico, [cpf, crm]);
        
        const queryMedicoEsp = 'INSERT INTO hospital.medico_especialidade (CPF_M, Especialidade) VALUES (?, ?)';
        
        for (const esp of especialidades) {
            await connection.execute('INSERT IGNORE INTO hospital.especialidade (Nome) VALUES (?)', [esp]);
            await connection.execute(queryMedicoEsp, [cpf, esp]);
        }
      
      } else if (typeCad === 'enfermeiro') {
        if (!cofen || !formacao) {
          await connection.rollback();  
          return res.status(400).json({ message: 'COFEN e Formação são obrigatórios para Enfermeiros.' });
        }
        const queryEnfermeiro = 'INSERT INTO hospital.enfermeiro (cpf, COFEN, Formacao) VALUES (?, ?, ?)';
        await connection.execute(queryEnfermeiro, [cpf, cofen, formacao]);
      }
    
    } else {
      await connection.rollback(); 
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
  const { busca } = req.query; 
  
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();

    const query = `
      SELECT 
        u.cpf, 
        u.primeiro_nome, 
        u.sobrenome, 
        u.email, 
        u.genero,
        u.rua, u.numero, u.bairro, u.cidade, u.cep,
        DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS data_nascimento_formatada,
        
        p.Observacoes,
        
        (SELECT N_Telefone FROM hospital.telefone t WHERE t.cpf = u.cpf LIMIT 1) AS telefone

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
    
    res.status(200).json(rows); 

  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar pacientes.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.delete('/api/admin/paciente/deletar', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'CPF do paciente é obrigatório.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = 'DELETE FROM hospital.usuario WHERE cpf = ?';
    
    const [result] = await connection.execute(query, [cpf]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Paciente excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Paciente não encontrado.' });
    }

  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir este paciente pois existem registros dependentes que impedem a ação.' });
    }
    res.status(500).json({ message: 'Erro interno ao tentar excluir.' });
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
    
    const query = `
      SELECT 
        u.cpf, 
        u.primeiro_nome, 
        u.sobrenome, 
        u.email,
        u.rua, u.numero, u.bairro, u.cidade, u.cep,
        DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS data_nascimento_formatada,
        u.genero,
        
        f.Salario,
        f.Eh_admin,
        f.Eh_Conselho,
        f.Carga_Horaria,
        
        m.CRM, 
        (SELECT GROUP_CONCAT(me.Especialidade SEPARATOR ', ') 
         FROM hospital.medico_especialidade me 
         WHERE me.CPF_M = m.cpf) AS Especialidade,
         
        e.COFEN, 
        e.Formacao,
        
        (SELECT N_Telefone FROM hospital.telefone t WHERE t.cpf = u.cpf LIMIT 1) AS telefone,

        CASE
            WHEN m.cpf IS NOT NULL THEN 
                CONCAT('Médico (', 
                    IFNULL((SELECT GROUP_CONCAT(me.Especialidade SEPARATOR ', ') 
                            FROM hospital.medico_especialidade me 
                            WHERE me.CPF_M = m.cpf), 'Sem Especialidade'), 
                ')')
            WHEN e.cpf IS NOT NULL THEN CONCAT('Enfermeiro (', e.Formacao, ')')
            ELSE 'Administrativo/Outro'
        END AS cargo,
        
        CASE
            WHEN m.cpf IS NOT NULL THEN 'MEDICO'
            WHEN e.cpf IS NOT NULL THEN 'ENFERMEIRO'
            ELSE 'OUTRO'
        END AS tipo_funcionario

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
    
    res.status(200).json(rows);  

  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar funcionários.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.delete('/api/admin/funcionario/deletar', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'CPF do funcionário é obrigatório.' });
  }

  if (cpf === req.user.cpf) {
    return res.status(400).json({ message: 'Você não pode excluir sua própria conta por aqui.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = 'DELETE FROM hospital.usuario WHERE cpf = ?';
    
    const [result] = await connection.execute(query, [cpf]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Funcionário excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: este funcionário possui registros (consultas/cirurgias) vinculados.' });
    }
    
    res.status(500).json({ message: 'Erro interno ao tentar excluir.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-consultas', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }

  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        c.CPF_P,
        c.Numero,
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
        CONCAT(um.primeiro_nome, ' ', um.sobrenome) AS nome_medico,
        DATE_FORMAT(c.Data_Inicio, '%d/%m/%Y %H:%i') AS data_consulta,
        DATE_FORMAT(c.Horario_Fim, '%H:%i') AS horario_fim_formatado, 
        CONCAT('Bloco ',c.Bloco_Consultorio, ' / Anexo ', c.Anexo_Consultorio, ' / Andar ', c.Andar_Consultorio, ' / Sala ', c.N_Consultorio) AS localizacao,
        
        CASE 
            WHEN i.Codigo IS NOT NULL THEN 
                CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
            ELSE NULL 
        END AS localizacao_leito,

        c.Valor,
        c.Esta_Paga,
        c.Internacao
      FROM 
        hospital.consulta c
      JOIN 
        hospital.usuario up ON c.CPF_P = up.cpf 
      JOIN 
        hospital.usuario um ON c.CPF_M = um.cpf 
      LEFT JOIN 
        hospital.internacao i ON c.Codigo_Internacao = i.Codigo
      WHERE
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) LIKE ? OR
        CONCAT(um.primeiro_nome, ' ', um.sobrenome) LIKE ? OR
        c.CPF_P LIKE ? OR
        c.CPF_M LIKE ?
      ORDER BY 
        c.Data_Inicio DESC;
    `;
    
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm, searchTerm]);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao buscar consultas (admin):', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar consultas.' });
  } finally {
    if (connection) connection.release();
  }
}); 

app.get('/api/paciente/minhas-consultas', authenticateToken, async (req, res) => {
    const { busca } = req.query; 
    const searchTerm = busca ? `%${busca}%` : '%%'; 
    const cpfPaciente = req.user.cpf; 

    if (!cpfPaciente) return res.status(400).json({ message: 'CPF do usuário não encontrado no token.' });

    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
          SELECT 
            c.CPF_P,
            c.Numero,
            CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
            CONCAT(um.primeiro_nome, ' ', um.sobrenome) AS nome_medico,
            DATE_FORMAT(c.Data_Inicio, '%d/%m/%Y %H:%i') AS data_consulta,
            DATE_FORMAT(c.Horario_Fim, '%H:%i') AS horario_fim_formatado,
            CONCAT('Bloco ',c.Bloco_Consultorio, ' / Anexo ', c.Anexo_Consultorio, ' / Andar ', c.Andar_Consultorio, ' / Sala ', c.N_Consultorio) AS localizacao,
            
            CASE 
                WHEN i.Codigo IS NOT NULL THEN 
                    CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
                ELSE NULL 
            END AS localizacao_leito,

            c.Valor,
            c.Esta_Paga,
            c.Internacao
          FROM 
            hospital.consulta c
          JOIN 
            hospital.usuario up ON c.CPF_P = up.cpf
          JOIN 
            hospital.usuario um ON c.CPF_M = um.cpf
          LEFT JOIN 
            hospital.internacao i ON c.Codigo_Internacao = i.Codigo
          WHERE
            c.CPF_P = ? AND 
            ( 
              CONCAT(um.primeiro_nome, ' ', um.sobrenome) LIKE ? OR
              c.CPF_M LIKE ?
            )
          ORDER BY 
            c.Data_Inicio DESC;
        `;
        
        const [rows] = await connection.execute(query, [cpfPaciente, searchTerm, searchTerm]);
        res.status(200).json(rows); 

    } catch (error) {
        console.error('Erro ao buscar (minhas consultas):', error);
        res.status(500).json({ message: 'Erro interno no servidor ao buscar suas consultas.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/medico/minhas-consultas', authenticateToken, async (req, res) => {
    const { busca, hoje } = req.query; 
    const searchTerm = busca ? `%${busca}%` : '%%'; 
    const cpfMedico = req.user.cpf; 

    if (!req.user.eh_medico) {
      return res.status(403).json({ message: 'Acesso negado. Apenas médicos podem acessar.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const filterHoje = hoje === 'true' ? 'AND DATE(c.Data_Inicio) = CURDATE()' : '';
        const orderDir = hoje === 'true' ? 'ASC' : 'DESC'; 

        const query = `
          SELECT 
            c.CPF_P, c.Numero,
            CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
            CONCAT(um.primeiro_nome, ' ', um.sobrenome) AS nome_medico,
            DATE_FORMAT(c.Data_Inicio, '%d/%m/%Y %H:%i') AS data_consulta,
            DATE_FORMAT(c.Horario_Fim, '%H:%i') AS horario_fim_formatado,
            CONCAT('Bloco ', c.Bloco_Consultorio, ' / Anexo ', c.Anexo_Consultorio, ' / Andar ', c.Andar_Consultorio, ' / Sala ', c.N_Consultorio) AS localizacao,
            
            CASE 
                WHEN i.Codigo IS NOT NULL THEN 
                    CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
                ELSE NULL 
            END AS localizacao_leito,

            c.Valor, c.Esta_Paga, c.Internacao
          FROM hospital.consulta c
          JOIN hospital.usuario up ON c.CPF_P = up.cpf
          JOIN hospital.usuario um ON c.CPF_M = um.cpf
          LEFT JOIN hospital.internacao i ON c.Codigo_Internacao = i.Codigo
          WHERE
            c.CPF_M = ? 
            AND (CONCAT(up.primeiro_nome, ' ', up.sobrenome) LIKE ? OR c.CPF_P LIKE ?)
            ${filterHoje}
          ORDER BY c.Data_Inicio ${orderDir};
        `;
        
        const [rows] = await connection.execute(query, [cpfMedico, searchTerm, searchTerm]);
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Erro ao buscar (consultas medico):', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/consulta/deletar', authenticateToken, async (req, res) => {
  const { cpf_p, numero } = req.body;

  if (!cpf_p || !numero) {
    return res.status(400).json({ message: 'Dados inválidos para exclusão.' });
  }

  if (!req.user.eh_admin && req.user.cpf !== cpf_p) {
    return res.status(403).json({ message: 'Acesso negado. Você não pode excluir esta consulta.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT Codigo_Internacao FROM hospital.consulta WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Consulta não encontrada.' });
    }

    const codigoInternacao = rows[0].Codigo_Internacao;

    await connection.execute(
      'DELETE FROM hospital.consulta WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (codigoInternacao) {
      const [internacao] = await connection.execute(
        'SELECT * FROM hospital.internacao WHERE Codigo = ?', 
        [codigoInternacao]
      );

      if (internacao.length > 0) {
        const i = internacao[0];
        await connection.execute('DELETE FROM hospital.internacao WHERE Codigo = ?', [codigoInternacao]);
      }
    }

    await connection.commit();
    res.status(200).json({ message: 'Consulta excluída com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao excluir consulta:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: existem registros dependentes desta consulta.' });
    }
    res.status(500).json({ message: 'Erro interno ao tentar excluir a consulta.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/buscar-cirurgias', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }

  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        c.CPF_P,
        c.Numero,
        CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
        GROUP_CONCAT(DISTINCT CONCAT(um.primeiro_nome, ' ', um.sobrenome) SEPARATOR ', ') AS medicos,
        GROUP_CONCAT(DISTINCT CONCAT(ue.primeiro_nome, ' ', ue.sobrenome) SEPARATOR ', ') AS enfermeiros,
        DATE_FORMAT(c.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
        DATE_FORMAT(c.Data_Finalizacao, '%d/%m/%Y %H:%i') AS data_finalizacao_formatada,
        CONCAT('Bloco ', c.Bloco_Sala_Cirurgia, ' / Anexo ', c.Anexo_Sala_Cirurgia, ' / Andar ', c.Andar_Sala_Cirurgia, ' / Sala ', c.N_Sala_Cirurgia) AS localizacao,
        
        c.N_Tuss,
        
        CASE 
            WHEN i.Codigo IS NOT NULL THEN 
                CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
            ELSE NULL 
        END AS localizacao_leito,

        c.Valor,
        c.Esta_Paga
      FROM 
        hospital.cirurgia c
      JOIN 
        hospital.usuario up ON c.CPF_P = up.cpf
      
      LEFT JOIN 
        hospital.internacao i ON c.Codigo_Internacao = i.Codigo

      LEFT JOIN 
        hospital.realiza r ON c.CPF_P = r.CPF_P AND c.Numero = r.N_Cirurgia
      LEFT JOIN 
        hospital.usuario um ON r.CPF_M = um.cpf
      LEFT JOIN 
        hospital.enfermeiro_participa_cirurgia epc ON c.CPF_P = epc.CPF_P AND c.Numero = epc.Numero_Cirurgia
      LEFT JOIN 
        hospital.usuario ue ON epc.CPF_E = ue.cpf

      GROUP BY
        c.CPF_P, c.Numero, i.Codigo, i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito
      HAVING 
        nome_paciente LIKE ? OR
        c.CPF_P LIKE ? OR
        medicos LIKE ?
      ORDER BY 
        c.Data_Entrada DESC;
    `;
    
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(rows);

  } catch (error) {
    console.error('Erro ao buscar cirurgias (admin):', error);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar cirurgias.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/paciente/minhas-cirurgias', authenticateToken, async (req, res) => {
    const { busca } = req.query; 
    const searchTerm = busca ? `%${busca}%` : '%%'; 
    const cpfPaciente = req.user.cpf; 

    if (!cpfPaciente) return res.status(400).json({ message: 'CPF não encontrado.' });

    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
          SELECT 
            c.CPF_P,
            c.Numero,
            CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
            GROUP_CONCAT(DISTINCT CONCAT(um.primeiro_nome, ' ', um.sobrenome) SEPARATOR ', ') AS medicos,
            GROUP_CONCAT(DISTINCT CONCAT(ue.primeiro_nome, ' ', ue.sobrenome) SEPARATOR ', ') AS enfermeiros,

            DATE_FORMAT(c.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
            DATE_FORMAT(c.Data_Finalizacao, '%d/%m/%Y %H:%i') AS data_finalizacao_formatada,
            CONCAT(c.Bloco_Sala_Cirurgia, ' / Anexo ', c.Anexo_Sala_Cirurgia, ' / Sala ', c.N_Sala_Cirurgia) AS localizacao,
            c.N_Tuss,
            
            CASE 
                WHEN i.Codigo IS NOT NULL THEN 
                    CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
                ELSE NULL 
            END AS localizacao_leito,
            
            c.Valor,
            c.Esta_Paga
          FROM 
            hospital.cirurgia c
          JOIN 
            hospital.usuario up ON c.CPF_P = up.cpf
          
          LEFT JOIN 
            hospital.internacao i ON c.Codigo_Internacao = i.Codigo

          LEFT JOIN 
            hospital.realiza r ON c.CPF_P = r.CPF_P AND c.Numero = r.N_Cirurgia
          LEFT JOIN 
            hospital.usuario um ON r.CPF_M = um.cpf
          LEFT JOIN 
            hospital.enfermeiro_participa_cirurgia epc ON c.CPF_P = epc.CPF_P AND c.Numero = epc.Numero_Cirurgia
          LEFT JOIN 
            hospital.usuario ue ON epc.CPF_E = ue.cpf
          
          WHERE
            c.CPF_P = ? 
          
          GROUP BY
            c.CPF_P, c.Numero, i.Codigo, i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito
          
          HAVING 
            (medicos LIKE ?) OR (medicos IS NULL AND ? = '%%')
          
          ORDER BY 
            c.Data_Entrada DESC;
        `;
        
        const [rows] = await connection.execute(query, [cpfPaciente, searchTerm, searchTerm]);
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Erro (paciente):', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/medico/minhas-cirurgias', authenticateToken, async (req, res) => {
    const { busca, hoje } = req.query; 
    const searchTerm = busca ? `%${busca}%` : '%%'; 
    const cpfMedico = req.user.cpf; 

    if (!req.user.eh_medico) return res.status(403).json({ message: 'Acesso negado.' });

    let connection;
    try {
        connection = await pool.getConnection();
        
        const filterHoje = hoje === 'true' ? 'AND DATE(c.Data_Entrada) = CURDATE()' : '';
        const orderDir = hoje === 'true' ? 'ASC' : 'DESC';

        const query = `
          SELECT 
            c.CPF_P,
            c.Numero,
            CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
            GROUP_CONCAT(DISTINCT CONCAT(um.primeiro_nome, ' ', um.sobrenome) SEPARATOR ', ') AS medicos,
            GROUP_CONCAT(DISTINCT CONCAT(ue.primeiro_nome, ' ', ue.sobrenome) SEPARATOR ', ') AS enfermeiros,

            DATE_FORMAT(c.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
            DATE_FORMAT(c.Data_Finalizacao, '%d/%m/%Y %H:%i') AS data_finalizacao_formatada,
            CONCAT('Bloco ', c.Bloco_Sala_Cirurgia, ' / Anexo ', c.Anexo_Sala_Cirurgia, ' / Andar ', c.Andar_Sala_Cirurgia, ' / Sala ', c.N_Sala_Cirurgia) AS localizacao,
            c.N_Tuss,
            
            CASE 
                WHEN i.Codigo IS NOT NULL THEN 
                    CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
                ELSE NULL 
            END AS localizacao_leito,
            
            c.Valor,
            c.Esta_Paga
          FROM 
            hospital.cirurgia c
          
          JOIN 
            hospital.realiza r_filter ON c.CPF_P = r_filter.CPF_P AND c.Numero = r_filter.N_Cirurgia AND r_filter.CPF_M = ?
          
          JOIN 
            hospital.usuario up ON c.CPF_P = up.cpf
          
          LEFT JOIN 
            hospital.internacao i ON c.Codigo_Internacao = i.Codigo

          LEFT JOIN 
            hospital.realiza r ON c.CPF_P = r.CPF_P AND c.Numero = r.N_Cirurgia
          LEFT JOIN 
            hospital.usuario um ON r.CPF_M = um.cpf
          LEFT JOIN 
            hospital.enfermeiro_participa_cirurgia epc ON c.CPF_P = epc.CPF_P AND c.Numero = epc.Numero_Cirurgia
          LEFT JOIN 
            hospital.usuario ue ON epc.CPF_E = ue.cpf
          
          WHERE 1=1
            ${filterHoje}

          GROUP BY
            c.CPF_P, c.Numero, i.Codigo, i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito, c.Data_Entrada
          
          HAVING 
            (nome_paciente LIKE ? OR c.CPF_P LIKE ?)
          
          ORDER BY 
            c.Data_Entrada ${orderDir};
        `;
        
        const [rows] = await connection.execute(query, [cpfMedico, searchTerm, searchTerm]);
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Erro (medico):', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/enfermeiro/minhas-cirurgias', authenticateToken, async (req, res) => {
    const { busca, hoje } = req.query;
    const searchTerm = busca ? `%${busca}%` : '%%'; 
    const cpfEnfermeiro = req.user.cpf; 

    if (!req.user.eh_enfermeiro) return res.status(403).json({ message: 'Acesso negado. Apenas enfermeiros.' });

    let connection;
    try {
        connection = await pool.getConnection();
        
        const filterHoje = hoje === 'true' ? 'AND DATE(c.Data_Entrada) = CURDATE()' : '';
        const orderDir = hoje === 'true' ? 'ASC' : 'DESC';

        const query = `
          SELECT 
            c.CPF_P,
            c.Numero,
            CONCAT(up.primeiro_nome, ' ', up.sobrenome) AS nome_paciente,
            GROUP_CONCAT(DISTINCT CONCAT(um.primeiro_nome, ' ', um.sobrenome) SEPARATOR ', ') AS medicos,
            GROUP_CONCAT(DISTINCT CONCAT(ue.primeiro_nome, ' ', ue.sobrenome) SEPARATOR ', ') AS enfermeiros,

            DATE_FORMAT(c.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
            DATE_FORMAT(c.Data_Finalizacao, '%d/%m/%Y %H:%i') AS data_finalizacao_formatada,
            CONCAT('Bloco ', c.Bloco_Sala_Cirurgia, ' / Anexo ', c.Anexo_Sala_Cirurgia, ' / Andar ', c.Andar_Sala_Cirurgia, ' / Sala ', c.N_Sala_Cirurgia) AS localizacao,
            c.N_Tuss,

            CASE 
                WHEN i.Codigo IS NOT NULL THEN 
                    CONCAT('Bloco ', i.Bloco_Leito,' / Anexo ', i.Anexo_Leito, ' / Andar ', i.Andar_Leito, ' / Sala ', i.N_Sala_Leito, ' / Leito ', i.N_Leito)
                ELSE NULL 
            END AS localizacao_leito,
            
            c.Valor,
            c.Esta_Paga
          FROM 
            hospital.cirurgia c

          JOIN 
            hospital.enfermeiro_participa_cirurgia my_epc ON c.CPF_P = my_epc.CPF_P AND c.Numero = my_epc.Numero_Cirurgia AND my_epc.CPF_E = ?
            
          JOIN 
            hospital.usuario up ON c.CPF_P = up.cpf
            
          LEFT JOIN 
            hospital.internacao i ON c.Codigo_Internacao = i.Codigo
            
          LEFT JOIN 
            hospital.realiza r ON c.CPF_P = r.CPF_P AND c.Numero = r.N_Cirurgia
          LEFT JOIN 
            hospital.usuario um ON r.CPF_M = um.cpf
            
          LEFT JOIN 
            hospital.enfermeiro_participa_cirurgia epc ON c.CPF_P = epc.CPF_P AND c.Numero = epc.Numero_Cirurgia
          LEFT JOIN 
            hospital.usuario ue ON epc.CPF_E = ue.cpf
            
          WHERE 1=1 
            ${filterHoje} 

          GROUP BY
            c.CPF_P, c.Numero, i.Codigo, i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito, c.Data_Entrada
          HAVING 
            (nome_paciente LIKE ? OR medicos LIKE ?)
          ORDER BY 
            c.Data_Entrada ${orderDir};
        `;
        
        const [rows] = await connection.execute(query, [cpfEnfermeiro, searchTerm, searchTerm]);
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Erro (enfermeiro):', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/cirurgia/deletar', authenticateToken, async (req, res) => {
  const { cpf_p, numero } = req.body;

  if (!cpf_p || !numero) {
    return res.status(400).json({ message: 'Dados inválidos para exclusão.' });
  }

  if (!req.user.eh_admin && req.user.cpf !== cpf_p) {
    return res.status(403).json({ message: 'Acesso negado. Você não pode excluir esta cirurgia.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [cirurgiaRows] = await connection.execute(
      'SELECT Codigo_Internacao FROM hospital.cirurgia WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (cirurgiaRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Cirurgia não encontrada.' });
    }

    const codigoInternacao = cirurgiaRows[0].Codigo_Internacao;

    await connection.execute(
      'DELETE FROM hospital.cirurgia WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (codigoInternacao) {
        const [internacaoRows] = await connection.execute(
            'SELECT * FROM hospital.internacao WHERE Codigo = ?', 
            [codigoInternacao]
        );

        if (internacaoRows.length > 0) {
            const i = internacaoRows[0];
            await connection.execute('DELETE FROM hospital.internacao WHERE Codigo = ?', [codigoInternacao]);
        }
    }

    await connection.commit();
    res.status(200).json({ message: 'Cirurgia excluída com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao excluir cirurgia:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: existem registros dependentes desta cirurgia.' });
    }
    
    res.status(500).json({ message: 'Erro interno ao tentar excluir a cirurgia.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get('/api/admin/salas-cirurgia', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT Bloco, Anexo, Andar, N_Sala, Capacidade 
      FROM hospital.sala_cirurgia
      ORDER BY Bloco, N_Sala;
    `;
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar salas de cirurgia:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/leitos-disponiveis', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        l.Bloco_Leito, l.Anexo_Leito, l.Andar_Leito, l.N_Sala, l.N_Leito, 
        sl.Tipo_Leito
      FROM hospital.leito l
      JOIN hospital.sala_leito sl ON 
        l.Bloco_Leito = sl.Bloco AND 
        l.Anexo_Leito = sl.Anexo AND 
        l.Andar_Leito = sl.Andar AND 
        l.N_Sala = sl.N_Sala
      WHERE NOT EXISTS (
        SELECT 1 FROM hospital.internacao i 
        WHERE i.Bloco_Leito = l.Bloco_Leito 
          AND i.Anexo_Leito = l.Anexo_Leito 
          AND i.Andar_Leito = l.Andar_Leito 
          AND i.N_Sala_Leito = l.N_Sala 
          AND i.N_Leito = l.N_Leito
          AND i.Data_Saida_Leito IS NULL
      )
      ORDER BY sl.Tipo_Leito, l.Bloco_Leito, l.N_Sala;
    `;
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar leitos:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/enfermeiros', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT u.cpf, CONCAT(u.primeiro_nome, ' ', u.sobrenome) AS nome_completo, e.COFEN
      FROM hospital.usuario u
      JOIN hospital.enfermeiro e ON u.cpf = e.cpf
      ORDER BY u.primeiro_nome;
    `;
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar enfermeiros:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/medico/marcar-cirurgia', authenticateToken, async (req, res) => {
  const { 
    cpf_p, data_entrada, data_finalizacao,
    sala_cirurgia, leito, 
    enfermeiros, n_tuss, valor, medicos 
  } = req.body;

  if (!cpf_p || !data_entrada || !data_finalizacao || !sala_cirurgia) {
    return res.status(400).json({ message: 'Dados obrigatórios faltando.' });
  }

  const inicio = new Date(data_entrada);
  const fim = new Date(data_finalizacao);
  const agora = new Date();

  if (inicio < agora) {
      return res.status(400).json({ message: 'Não é permitido agendar cirurgias em datas passadas.' });
  }
  if (fim <= inicio) {
      return res.status(400).json({ message: 'A data final deve ser posterior à data inicial.' });
  }

  let listaMedicos = medicos || [];
  if (req.user.eh_medico && listaMedicos.length === 0) {
      listaMedicos.push(req.user.cpf);
  } else if (req.user.eh_admin && listaMedicos.length === 0) {
      return res.status(400).json({ message: 'Selecione pelo menos um médico.' });
  }
  const medicosUnicos = [...new Set(listaMedicos)];

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const cpf_medico of medicosUnicos) {
        const [consultas] = await connection.execute(`
            SELECT Numero FROM hospital.consulta 
            WHERE CPF_M = ? AND (Data_Inicio < ? AND Horario_Fim > ?) LIMIT 1
        `, [cpf_medico, data_finalizacao, data_entrada]);

        if (consultas.length > 0) {
            const [m] = await connection.execute('SELECT primeiro_nome FROM hospital.usuario WHERE cpf = ?', [cpf_medico]);
            await connection.rollback();
            return res.status(409).json({ message: `Conflito: O médico ${m[0]?.primeiro_nome} possui consulta neste horário.` });
        }

        const [cirurgias] = await connection.execute(`
            SELECT c.Numero FROM hospital.realiza r
            JOIN hospital.cirurgia c ON r.N_Cirurgia = c.Numero AND r.CPF_P = c.CPF_P
            WHERE r.CPF_M = ? AND (c.Data_Entrada < ? AND c.Data_Finalizacao > ?) LIMIT 1
        `, [cpf_medico, data_finalizacao, data_entrada]);

        if (cirurgias.length > 0) {
            const [m] = await connection.execute('SELECT primeiro_nome FROM hospital.usuario WHERE cpf = ?', [cpf_medico]);
            await connection.rollback();
            return res.status(409).json({ message: `Conflito: O médico ${m[0]?.primeiro_nome} já está em outra cirurgia.` });
        }
    }

    if (enfermeiros && enfermeiros.length > 0) {
        for (const cpf_enf of enfermeiros) {
            const [cirurgiasEnf] = await connection.execute(`
                SELECT c.Numero FROM hospital.enfermeiro_participa_cirurgia epc
                JOIN hospital.cirurgia c ON epc.Numero_Cirurgia = c.Numero AND epc.CPF_P = c.CPF_P
                WHERE epc.CPF_E = ? AND (c.Data_Entrada < ? AND c.Data_Finalizacao > ?) LIMIT 1
            `, [cpf_enf, data_finalizacao, data_entrada]);

            if (cirurgiasEnf.length > 0) {
                const [e] = await connection.execute('SELECT primeiro_nome FROM hospital.usuario WHERE cpf = ?', [cpf_enf]);
                await connection.rollback();
                return res.status(409).json({ message: `Conflito: O enfermeiro ${e[0]?.primeiro_nome} já está em outra cirurgia.` });
            }

            const [leitosEnf] = await connection.execute(`
                SELECT N_Leito FROM hospital.cuida_leito 
                WHERE CPF_E = ? AND (Data_Entrada < ? AND (Data_Saida IS NULL OR Data_Saida > ?)) LIMIT 1
            `, [cpf_enf, data_finalizacao, data_entrada]);

            if (leitosEnf.length > 0) {
                const [e] = await connection.execute('SELECT primeiro_nome FROM hospital.usuario WHERE cpf = ?', [cpf_enf]);
                await connection.rollback();
                return res.status(409).json({ message: `Conflito: O enfermeiro ${e[0]?.primeiro_nome} está de plantão no leito ${leitosEnf[0].N_Leito}.` });
            }
        }
    }

    const querySalaOcupada = `
        SELECT Numero 
        FROM hospital.cirurgia 
        WHERE Bloco_Sala_Cirurgia = ? 
          AND Anexo_Sala_Cirurgia = ? 
          AND Andar_Sala_Cirurgia = ? 
          AND N_Sala_Cirurgia = ?
          AND (
            (Data_Finalizacao IS NOT NULL AND Data_Entrada < ? AND Data_Finalizacao > ?)
            OR
            (Data_Finalizacao IS NULL AND Data_Entrada < ?) 
          )
        LIMIT 1
    `;
    
    const [salaConflito] = await connection.execute(querySalaOcupada, [
        sala_cirurgia.bloco, sala_cirurgia.anexo, sala_cirurgia.andar, sala_cirurgia.numero,
        data_finalizacao, data_entrada,
        data_finalizacao
    ]);

    if (salaConflito.length > 0) {
        await connection.rollback();
        return res.status(409).json({ 
            message: `A Sala ${sala_cirurgia.numero} (Bloco ${sala_cirurgia.bloco}) já está reservada para outra cirurgia neste horário.` 
        });
    }
    const [rowsNum] = await connection.execute(
      `SELECT IFNULL(MAX(Numero), 0) + 1 AS proximo FROM hospital.cirurgia WHERE CPF_P = ?`, 
      [cpf_p]
    );
    const numeroCirurgia = rowsNum[0].proximo;

    let codigoInternacao = null;

    if (leito) {
      const queryConflitoLeito = `
        SELECT Codigo FROM hospital.internacao 
        WHERE Bloco_Leito = ? AND Anexo_Leito = ? AND Andar_Leito = ? AND N_Sala_Leito = ? AND N_Leito = ?
          AND ((Data_Saida_Leito IS NULL) OR (Data_Entrada_Leito < ? AND Data_Saida_Leito > ?))
        LIMIT 1
      `;
      const [conflitos] = await connection.execute(queryConflitoLeito, [
        leito.bloco, leito.anexo, leito.andar, leito.sala, leito.numero, 
        data_finalizacao, data_entrada
      ]);

      if (conflitos.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: `O Leito ${leito.numero} já está ocupado.` });
      }

      const queryInternacao = `
        INSERT INTO hospital.internacao (Bloco_Leito, Anexo_Leito, Andar_Leito, N_Sala_Leito, N_Leito, Data_Entrada_Leito) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [resInternacao] = await connection.execute(queryInternacao, [
        leito.bloco, leito.anexo, leito.andar, leito.sala, leito.numero, data_entrada
      ]);

      codigoInternacao = resInternacao.insertId; 
    }

    const queryCirurgia = `
      INSERT INTO hospital.cirurgia 
      (CPF_P, Numero, Data_Entrada, Data_Finalizacao, Valor, N_Tuss, 
       Bloco_Sala_Cirurgia, Anexo_Sala_Cirurgia, Andar_Sala_Cirurgia, N_Sala_Cirurgia,
       Codigo_Internacao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(queryCirurgia, [
      cpf_p, numeroCirurgia, data_entrada, data_finalizacao,
      valor || 0, n_tuss,
      sala_cirurgia.bloco, sala_cirurgia.anexo, sala_cirurgia.andar, sala_cirurgia.numero,
      codigoInternacao
    ]);

    for (const cpf_medico of medicosUnicos) {
        await connection.execute(
          `INSERT INTO hospital.realiza (CPF_M, CPF_P, N_Cirurgia) VALUES (?, ?, ?)`,
          [cpf_medico, cpf_p, numeroCirurgia]
        );
    }

    if (enfermeiros && enfermeiros.length > 0) {
      for (const cpf_enf of enfermeiros) {
        await connection.execute(
          `INSERT INTO hospital.enfermeiro_participa_cirurgia (CPF_E, CPF_P, Numero_Cirurgia) VALUES (?, ?, ?)`,
          [cpf_enf, cpf_p, numeroCirurgia]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Cirurgia marcada com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao marcar cirurgia:', error);
    res.status(500).json({ message: 'Erro ao marcar cirurgia.' });
  } finally {
    if (connection) connection.release();
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
        me.Especialidade
      FROM 
        hospital.usuario u
      JOIN 
        hospital.medico m ON u.cpf = m.cpf
      LEFT JOIN 
        hospital.medico_especialidade me ON m.cpf = me.CPF_M
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
      SELECT 
        c.Bloco, 
        c.Anexo, 
        c.Andar, 
        c.Numero, 
        ce.Especialidade 
      FROM 
        hospital.consultorio c
      LEFT JOIN 
        hospital.consultorio_especialidade ce ON c.Bloco = ce.Bloco AND c.Anexo = ce.Anexo AND c.Andar = ce.Andar AND c.Numero = ce.Numero
      ORDER BY 
        c.Bloco, c.Andar, c.Numero;
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

  if (new Date(data_inicio) < new Date()) {
      return res.status(400).json({ message: 'Não é permitido alocar no passado.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const queryConflitoCirurgia = `
        SELECT c.Numero, c.Data_Entrada, c.Data_Finalizacao 
        FROM hospital.realiza r
        JOIN hospital.cirurgia c ON r.CPF_P = c.CPF_P AND r.N_Cirurgia = c.Numero
        WHERE r.CPF_M = ?
          AND (
            (c.Data_Finalizacao IS NOT NULL AND c.Data_Entrada < ? AND c.Data_Finalizacao > ?)
            OR
            (c.Data_Finalizacao IS NULL AND c.Data_Entrada < ?)
          )
        LIMIT 1
    `;

    const [cirurgias] = await connection.execute(queryConflitoCirurgia, [cpf_m, data_fim, data_inicio, data_fim]);

    if (cirurgias.length > 0) {
        const cirurgia = cirurgias[0];
        const inicioCir = new Date(cirurgia.Data_Entrada).toLocaleString('pt-BR');
        const fimCir = cirurgia.Data_Finalizacao ? new Date(cirurgia.Data_Finalizacao).toLocaleString('pt-BR') : '(Em andamento)';
        
        return res.status(409).json({ 
            message: `Conflito! O médico já possui uma cirurgia marcada neste horário.\nCirurgia Nº: ${cirurgia.Numero}\nInício: ${inicioCir}\nFim: ${fimCir}` 
        });
    }


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
      return res.status(409).json({ message: 'Conflito! Este horário já está ocupado por outra alocação de consultório.' });
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

app.get('/api/admin/buscar-alocacoes-leitos', authenticateToken, async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        GROUP_CONCAT(DISTINCT cl.CPF_E SEPARATOR ', ') AS cpfs_enfermeiros,
        GROUP_CONCAT(DISTINCT CONCAT(u.primeiro_nome, ' ', u.sobrenome) SEPARATOR ', ') AS nomes_enfermeiros,
        
        CONCAT(
            'Bloco ', cl.Bloco_Leito, 
            ', Anexo ', cl.Anexo_Leito, 
            ', Andar ', cl.Andar_Leito, 
            ', Sala ', cl.N_Sala_Leito, 
            ', Leito ', cl.N_Leito
        ) AS localizacao_leito,
        
        (SELECT COUNT(*) 
         FROM hospital.internacao i_check 
         WHERE i_check.Bloco_Leito = cl.Bloco_Leito 
           AND i_check.Anexo_Leito = cl.Anexo_Leito 
           AND i_check.Andar_Leito = cl.Andar_Leito 
           AND i_check.N_Sala_Leito = cl.N_Sala_Leito 
           AND i_check.N_Leito = cl.N_Leito 
           AND i_check.Data_Saida_Leito IS NULL
        ) > 0 AS leito_ocupado,

        DATE_FORMAT(cl.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
        DATE_FORMAT(cl.Data_Saida, '%d/%m/%Y %H:%i') AS data_saida_formatada,
        
        CASE
            WHEN cl.Data_Saida IS NULL THEN 'ATIVO'
            ELSE 'FINALIZADO'
        END AS status_alocacao,

        CONCAT(
            COALESCE(up_c.primeiro_nome, up_cir.primeiro_nome), 
            ' ', 
            COALESCE(up_c.sobrenome, up_cir.sobrenome)
        ) AS nome_paciente,
        
        DATE_FORMAT(i.Data_Entrada_Leito, '%d/%m/%Y %H:%i') AS data_entrada_paciente

      FROM 
        hospital.cuida_leito cl
      JOIN 
        hospital.usuario u ON cl.CPF_E = u.cpf
      
      LEFT JOIN hospital.internacao i ON 
        cl.Bloco_Leito = i.Bloco_Leito AND 
        cl.Anexo_Leito = i.Anexo_Leito AND 
        cl.Andar_Leito = i.Andar_Leito AND 
        cl.N_Sala_Leito = i.N_Sala_Leito AND 
        cl.N_Leito = i.N_Leito AND
        i.Data_Entrada_Leito <= cl.Data_Entrada AND
        (i.Data_Saida_Leito IS NULL OR i.Data_Saida_Leito >= cl.Data_Entrada)

      LEFT JOIN hospital.consulta c ON i.Codigo = c.Codigo_Internacao
      LEFT JOIN hospital.usuario up_c ON c.CPF_P = up_c.cpf
      
      LEFT JOIN hospital.cirurgia cir ON i.Codigo = cir.Codigo_Internacao
      LEFT JOIN hospital.usuario up_cir ON cir.CPF_P = up_cir.cpf
      
      WHERE
        CONCAT(u.primeiro_nome, ' ', u.sobrenome) LIKE ? OR
        cl.CPF_E LIKE ? OR
        cl.N_Leito LIKE ?

      GROUP BY 
        cl.Bloco_Leito, cl.Anexo_Leito, cl.Andar_Leito, cl.N_Sala_Leito, cl.N_Leito, 
        cl.Data_Entrada, cl.Data_Saida, 
        i.Data_Entrada_Leito, up_c.primeiro_nome, up_c.sobrenome, up_cir.primeiro_nome, up_cir.sobrenome

      ORDER BY 
        cl.Data_Saida IS NULL DESC,
        cl.Data_Entrada DESC;
    `;
    
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

app.post('/api/paciente/marcar-consulta', authenticateToken, async (req, res) => {
  const { cpf_m, data_inicio, cpf_p: cpf_p_admin, internacao, leito } = req.body;
  
  let cpf_paciente_final = req.user.eh_paciente ? req.user.cpf : null;
  
  if (req.user.eh_admin && cpf_p_admin) {
      cpf_paciente_final = cpf_p_admin;
  }

  if (!cpf_m || !data_inicio || !cpf_paciente_final) {
    return res.status(400).json({ message: 'Médico, Paciente e Data/Hora são obrigatórios.' });
  }

  if (!req.user.eh_paciente && !req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const querySlot = `
      SELECT *, DATE_FORMAT(Data_Fim, '%Y-%m-%d %H:%i:%s') as data_fim_sql 
      FROM hospital.trabalha_em 
      WHERE CPF_M = ? AND Data_Inicio = ?
    `;
    const [slots] = await connection.execute(querySlot, [cpf_m, data_inicio]);

    if (slots.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Horário indisponível. O médico não está alocado neste horário.' });
    }

    const slotInfo = slots[0];

    const queryConflito = `
      SELECT 1 FROM hospital.consulta 
      WHERE (CPF_M = ? AND Data_Inicio = ?) OR (CPF_P = ? AND Data_Inicio = ?)
      LIMIT 1
    `;
    const [conflitos] = await connection.execute(queryConflito, [cpf_m, data_inicio, cpf_paciente_final, data_inicio]);

    if (conflitos.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Conflito de horário. Médico ou Paciente já possuem compromisso.' });
    }

    const queryProximoNumero = `SELECT IFNULL(MAX(Numero), 0) + 1 AS proximoNumero FROM hospital.consulta WHERE CPF_P = ?`;
    const [rowsNumero] = await connection.execute(queryProximoNumero, [cpf_paciente_final]);
    const proximoNumero = rowsNumero[0].proximoNumero;
    
    let codigoInternacao = null;
    let isInternacao = 0;

    if (req.user.eh_admin && internacao && leito) {
        isInternacao = 1;
        const queryInternacao = `
            INSERT INTO hospital.internacao 
            (Bloco_Leito, Anexo_Leito, Andar_Leito, N_Sala_Leito, N_Leito, Data_Entrada_Leito) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [resInt] = await connection.execute(queryInternacao, [
            leito.bloco, leito.anexo, leito.andar, leito.sala, leito.numero, data_inicio
        ]);
        codigoInternacao = resInt.insertId;
    }

    const valorConsulta = 200.00;
    const queryInsert = `
      INSERT INTO hospital.consulta 
      (CPF_P, Numero, N_Consultorio, Bloco_Consultorio, Anexo_Consultorio, Andar_Consultorio, 
       Data_Inicio, Horario_Fim, Valor, Esta_Paga, Internacao, Codigo_Internacao, CPF_M)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `;
    
    await connection.execute(queryInsert, [
      cpf_paciente_final, 
      proximoNumero, 
      slotInfo.N_Consultorio, 
      slotInfo.Bloco_Consultorio, 
      slotInfo.Anexo_Consultorio, 
      slotInfo.Andar_Consultorio, 
      data_inicio, 
      slotInfo.data_fim_sql, 
      valorConsulta,
      isInternacao,
      codigoInternacao, 
      cpf_m
    ]);

    await connection.commit();
    res.status(201).json({ message: 'Consulta marcada com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao marcar consulta:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/meus-dados', authenticateToken, async (req, res) => {
  const cpf = req.user.cpf;
  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        u.cpf, u.email, u.genero, u.data_nascimento, 
        u.primeiro_nome, u.sobrenome, 
        u.rua, u.cidade, u.bairro, u.numero, u.cep,
        (SELECT N_Telefone FROM hospital.telefone WHERE cpf = u.cpf LIMIT 1) as telefone
      FROM hospital.usuario u
      WHERE u.cpf = ?
    `;
    
    const [rows] = await connection.execute(query, [cpf]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar meus dados:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/meus-dados/atualizar', authenticateToken, async (req, res) => {
  const cpf = req.user.cpf;
  const { rua, numero, bairro, cidade, cep, estado, telefone } = req.body;

  if (!rua || !numero || !bairro || !cidade || !cep || !telefone) {
    return res.status(400).json({ message: 'Preencha todos os campos editáveis.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const queryUsuario = `
      UPDATE hospital.usuario 
      SET rua = ?, numero = ?, bairro = ?, cidade = ?, cep = ?
      WHERE cpf = ?
    `;
    await connection.execute(queryUsuario, [rua, numero, bairro, cidade, cep, cpf]);

    await connection.execute('DELETE FROM hospital.telefone WHERE cpf = ?', [cpf]);
    await connection.execute('INSERT INTO hospital.telefone (cpf, N_Telefone) VALUES (?, ?)', [cpf, telefone]);

    await connection.commit();
    res.status(200).json({ message: 'Dados atualizados com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/localizacoes', authenticateToken, async (req, res) => {
  const { busca } = req.query; 
  const searchTerm = busca ? `%${busca}%` : '%%'; 

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT Bloco, Anexo, Andar
      FROM hospital.localizacao
      WHERE Bloco LIKE ? OR Anexo LIKE ?
      ORDER BY Bloco, Anexo, Andar;
    `;
    const [rows] = await connection.execute(query, [searchTerm, searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/localizacoes/cadastrar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar } = req.body;

  if (!bloco || !anexo || !andar) {
    return res.status(400).json({ message: 'Todos os campos (Bloco, Anexo, Andar) são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `INSERT INTO hospital.localizacao (Bloco, Anexo, Andar) VALUES (?, ?, ?)`;
    
    await connection.execute(query, [bloco, anexo, andar]);
    res.status(201).json({ message: 'Localização cadastrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar localização:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Esta localização já existe.' });
    }
    res.status(500).json({ message: 'Erro interno ao cadastrar.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/localizacoes/deletar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar } = req.body;

  if (!bloco || !anexo || !andar) {
    return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `DELETE FROM hospital.localizacao WHERE Bloco = ? AND Anexo = ? AND Andar = ?`;
    
    const [result] = await connection.execute(query, [bloco, anexo, andar]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Localização excluída com sucesso!' });
    } else {
      res.status(404).json({ message: 'Localização não encontrada.' });
    }

  } catch (error) {
    console.error('Erro ao excluir localização:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(409).json({ message: 'Não é possível excluir: Existem salas, leitos ou consultórios vinculados a esta localização.' });
    }
    res.status(500).json({ message: 'Erro interno ao tentar excluir.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/buscar-consultorios', authenticateToken, async (req, res) => {
  const { busca } = req.query;
  const searchTerm = busca ? `%${busca}%` : '%%';

  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        c.Bloco, 
        c.Anexo, 
        c.Andar, 
        c.Numero, 
        GROUP_CONCAT(ce.Especialidade SEPARATOR ', ') AS Especialidade
      FROM hospital.consultorio c
      LEFT JOIN hospital.consultorio_especialidade ce ON 
        c.Bloco = ce.Bloco AND 
        c.Anexo = ce.Anexo AND 
        c.Andar = ce.Andar AND 
        c.Numero = ce.Numero
      GROUP BY c.Bloco, c.Anexo, c.Andar, c.Numero
      HAVING 
        c.Numero LIKE ? OR 
        c.Bloco LIKE ? OR 
        IFNULL(Especialidade, '') LIKE ?
      ORDER BY c.Bloco, c.Andar, c.Numero;
    `;
    
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar consultórios:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/consultorios/cadastrar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero, especialidades } = req.body;

  if (!bloco || !anexo || !andar || !numero) {
    return res.status(400).json({ message: 'Localização e Número são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const queryConsultorio = `
      INSERT INTO hospital.consultorio (Bloco, Anexo, Andar, Numero)
      VALUES (?, ?, ?, ?)
    `;
    await connection.execute(queryConsultorio, [bloco, anexo, andar, numero]);

    if (especialidades && Array.isArray(especialidades) && especialidades.length > 0) {
        const queryLink = `
            INSERT INTO hospital.consultorio_especialidade (Bloco, Anexo, Andar, Numero, Especialidade)
            VALUES (?, ?, ?, ?, ?)
        `;

        for (const esp of especialidades) {
            await connection.execute(
                `INSERT IGNORE INTO hospital.especialidade (Nome) VALUES (?)`, 
                [esp]
            );
            
            await connection.execute(queryLink, [bloco, anexo, andar, numero, esp]);
        }
    }

    await connection.commit();
    res.status(201).json({ message: 'Consultório cadastrado com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    
    console.error('Erro ao cadastrar consultório:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este consultório já existe nesta localização.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/consultorios/deletar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero } = req.body;

  if (!bloco || !anexo || !andar || !numero) {
    return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `DELETE FROM hospital.consultorio WHERE Bloco = ? AND Anexo = ? AND Andar = ? AND Numero = ?`;
    const [result] = await connection.execute(query, [bloco, anexo, andar, numero]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Consultório excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Consultório não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir consultório:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: Existem consultas ou alocações vinculadas.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/buscar-salas-cirurgia', authenticateToken, async (req, res) => {
  const { busca } = req.query;
  const searchTerm = busca ? `%${busca}%` : '%%';

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT Bloco, Anexo, Andar, N_Sala, Capacidade
      FROM hospital.sala_cirurgia
      WHERE N_Sala LIKE ? OR Bloco LIKE ?
      ORDER BY Bloco, Andar, N_Sala;
    `;
    const [rows] = await connection.execute(query, [searchTerm, searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar salas de cirurgia:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/salas-cirurgia/cadastrar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero, capacidade } = req.body;

  if (!bloco || !anexo || !andar || !numero || !capacidade) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      INSERT INTO hospital.sala_cirurgia (Bloco, Anexo, Andar, N_Sala, Capacidade)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [bloco, anexo, andar, numero, capacidade]);
    res.status(201).json({ message: 'Sala de cirurgia cadastrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar sala de cirurgia:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Esta sala já existe.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/salas-cirurgia/deletar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero } = req.body;

  if (!bloco || !numero) {
    return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `DELETE FROM hospital.sala_cirurgia WHERE Bloco = ? AND Anexo = ? AND Andar = ? AND N_Sala = ?`;
    const [result] = await connection.execute(query, [bloco, anexo, andar, numero]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sala excluída com sucesso!' });
    } else {
      res.status(404).json({ message: 'Sala não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao excluir sala:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: Existem cirurgias vinculadas a esta sala.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/buscar-salas-leito', authenticateToken, async (req, res) => {
  const { busca } = req.query;
  const searchTerm = busca ? `%${busca}%` : '%%';

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT Bloco, Anexo, Andar, N_Sala, Tipo_Leito
      FROM hospital.sala_leito
      WHERE N_Sala LIKE ? OR Tipo_Leito LIKE ? OR Bloco LIKE ?
      ORDER BY Bloco, Andar, N_Sala;
    `;
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar salas de leito:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/salas-leito/cadastrar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero, tipo_leito } = req.body;

  if (!bloco || !anexo || !andar || !numero || !tipo_leito) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      INSERT INTO hospital.sala_leito (Bloco, Anexo, Andar, N_Sala, Tipo_Leito)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [bloco, anexo, andar, numero, tipo_leito]);
    res.status(201).json({ message: 'Sala de leito cadastrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar sala de leito:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Esta sala de leito já existe nesta localização.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/salas-leito/deletar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, numero } = req.body;

  if (!bloco || !anexo || !andar || !numero) {
    return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `DELETE FROM hospital.sala_leito WHERE Bloco = ? AND Anexo = ? AND Andar = ? AND N_Sala = ?`;
    const [result] = await connection.execute(query, [bloco, anexo, andar, numero]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sala de leito excluída com sucesso!' });
    } else {
      res.status(404).json({ message: 'Sala de leito não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao excluir sala de leito:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: 'Não é possível excluir: Existem leitos vinculados a esta sala.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/admin/buscar-leitos', authenticateToken, async (req, res) => {
  const { busca } = req.query;
  const searchTerm = busca ? `%${busca}%` : '%%';

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      SELECT 
        l.Bloco_Leito, l.Anexo_Leito, l.Andar_Leito, l.N_Sala, l.N_Leito,
        sl.Tipo_Leito,
        
        (SELECT COUNT(*) 
         FROM hospital.internacao i 
         WHERE i.Bloco_Leito = l.Bloco_Leito 
           AND i.Anexo_Leito = l.Anexo_Leito 
           AND i.Andar_Leito = l.Andar_Leito 
           AND i.N_Sala_Leito = l.N_Sala 
           AND i.N_Leito = l.N_Leito 
           AND i.Data_Saida_Leito IS NULL
        ) > 0 AS Ocupado

      FROM hospital.leito l
      JOIN hospital.sala_leito sl ON 
        l.Bloco_Leito = sl.Bloco AND 
        l.Anexo_Leito = sl.Anexo AND 
        l.Andar_Leito = sl.Andar AND 
        l.N_Sala = sl.N_Sala
      WHERE l.N_Leito LIKE ? OR sl.Tipo_Leito LIKE ? OR l.Bloco_Leito LIKE ?
      ORDER BY l.Bloco_Leito, l.N_Sala, l.N_Leito;
    `;
    const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar leitos:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/leitos/cadastrar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, n_sala, n_leito } = req.body;

  if (!bloco || !anexo || !andar || !n_sala || !n_leito) {
    return res.status(400).json({ message: 'Selecione uma sala e informe o número do leito.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      INSERT INTO hospital.leito (Bloco_Leito, Anexo_Leito, Andar_Leito, N_Sala, N_Leito)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [bloco, anexo, andar, n_sala, n_leito]);
    res.status(201).json({ message: 'Leito cadastrado com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar leito:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este leito já existe nesta sala.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/admin/leitos/deletar', authenticateToken, async (req, res) => {
  const { bloco, anexo, andar, n_sala, n_leito } = req.body;

  if (!bloco || !n_sala || !n_leito) {
    return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const query = `
      DELETE FROM hospital.leito 
      WHERE Bloco_Leito = ? AND Anexo_Leito = ? AND Andar_Leito = ? AND N_Sala = ? AND N_Leito = ?
    `;
    const [result] = await connection.execute(query, [bloco, anexo, andar, n_sala, n_leito]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Leito excluído com sucesso!' });
    } else {
      res.status(404).json({ message: 'Leito não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir leito:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
         return res.status(409).json({ message: 'Não é possível excluir: Existem registros vinculados a este leito.' });
    }
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/admin/alocar-enfermeiro-leito', authenticateToken, async (req, res) => {
  const { cpf_e, bloco, anexo, andar, n_sala, n_leito, data_entrada, data_saida } = req.body;

  if (!cpf_e || !bloco || !n_leito || !data_entrada || !data_saida) {
    return res.status(400).json({ message: 'Todos os dados são obrigatórios.' });
  }

  const novaEntrada = new Date(data_entrada);
  const novaSaida = new Date(data_saida);

  const diffHoras = (novaSaida - novaEntrada) / 1000 / 60 / 60;
  if (diffHoras <= 0) return res.status(400).json({ message: 'Data de saída deve ser após a entrada.' });
  if (diffHoras > 12) return res.status(400).json({ message: 'Um único alocamento não pode exceder 12h.' });

  let connection;
  try {
    connection = await pool.getConnection();
    const queryInternacao = `
        SELECT Data_Entrada_Leito 
        FROM hospital.internacao 
        WHERE Bloco_Leito = ? AND Anexo_Leito = ? AND Andar_Leito = ? AND N_Sala_Leito = ? AND N_Leito = ?
          AND Data_Saida_Leito IS NULL
        LIMIT 1
    `;
    const [rowsInt] = await connection.execute(queryInternacao, [bloco, anexo, andar, n_sala, n_leito]);

    if (rowsInt.length === 0) {
        return res.status(400).json({ message: 'Erro: Este leito não está ocupado por nenhum paciente no momento.' });
    }

    const dataEntradaPaciente = new Date(rowsInt[0].Data_Entrada_Leito);
    
    if (novaEntrada < dataEntradaPaciente) {
        return res.status(400).json({ 
            message: `Data inválida! O paciente entrou no leito em ${dataEntradaPaciente.toLocaleString('pt-BR')}. O plantão não pode começar antes disso.` 
        });
    }

    const queryCirurgiaOverlap = `
        SELECT c.Numero 
        FROM hospital.enfermeiro_participa_cirurgia epc
        JOIN hospital.cirurgia c ON epc.Numero_Cirurgia = c.Numero AND epc.CPF_P = c.CPF_P
        WHERE epc.CPF_E = ?
          AND ((c.Data_Finalizacao IS NULL) OR (c.Data_Entrada < ? AND c.Data_Finalizacao > ?))
        LIMIT 1
    `;
    const [cirurgiasConflitantes] = await connection.execute(queryCirurgiaOverlap, [cpf_e, data_saida, data_entrada]);
    if (cirurgiasConflitantes.length > 0) return res.status(409).json({ message: 'Conflito: O enfermeiro está em cirurgia.' });

    const queryInsert = `
      INSERT INTO hospital.cuida_leito 
      (CPF_E, Bloco_Leito, Anexo_Leito, Andar_Leito, N_Sala_Leito, N_Leito, Data_Entrada, Data_Saida)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(queryInsert, [cpf_e, bloco, anexo, andar, n_sala, n_leito, data_entrada, data_saida]);

    res.status(201).json({ message: 'Enfermeiro alocado com sucesso!' });

  } catch (error) {
    console.error('Erro ao alocar:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Conflito de horário.' });
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/enfermeiro/minhas-alocacoes-leitos', authenticateToken, async (req, res) => {
    if (!req.user.eh_enfermeiro) {
        return res.status(403).json({ message: 'Acesso exclusivo para enfermeiros.' });
    }

    const { busca, hoje } = req.query; 
    const searchTerm = busca ? `%${busca}%` : '%%';
    const cpfEnfermeiro = req.user.cpf;

    let connection;
    try {
        connection = await pool.getConnection();
        
        const filterHoje = hoje === 'true' ? 'AND DATE(cl.Data_Entrada) = CURDATE()' : '';
        const orderDir = hoje === 'true' ? 'ASC' : 'DESC';

        const query = `
          SELECT 
            cl.CPF_E as cpfs_enfermeiros,
            CONCAT(u.primeiro_nome, ' ', u.sobrenome) AS nomes_enfermeiros,
            
            CONCAT('Bloco ', cl.Bloco_Leito, ', Anexo ', cl.Anexo_Leito, ', Andar ', cl.Andar_Leito, ', Sala ', cl.N_Sala_Leito, ', Leito ', cl.N_Leito) AS localizacao_leito,
            
            cl.Bloco_Leito, cl.Anexo_Leito, cl.Andar_Leito, cl.N_Sala_Leito, cl.N_Leito,
            
            (SELECT COUNT(*) 
             FROM hospital.internacao i 
             WHERE i.Bloco_Leito = cl.Bloco_Leito 
               AND i.Anexo_Leito = cl.Anexo_Leito 
               AND i.Andar_Leito = cl.Andar_Leito 
               AND i.N_Sala_Leito = cl.N_Sala_Leito 
               AND i.N_Leito = cl.N_Leito 
               AND i.Data_Saida_Leito IS NULL
            ) > 0 AS leito_ocupado,

            DATE_FORMAT(cl.Data_Entrada, '%d/%m/%Y %H:%i') AS data_entrada_formatada,
            cl.Data_Entrada, 
            DATE_FORMAT(cl.Data_Saida, '%d/%m/%Y %H:%i') AS data_saida_formatada,
            
            CASE
                WHEN cl.Data_Saida IS NULL THEN 'ATIVO'
                ELSE 'FINALIZADO'
            END AS status_alocacao,

            CONCAT(
                COALESCE(up_c.primeiro_nome, up_cir.primeiro_nome), 
                ' ', 
                COALESCE(up_c.sobrenome, up_cir.sobrenome)
            ) AS nome_paciente,
            DATE_FORMAT(i.Data_Entrada_Leito, '%d/%m/%Y %H:%i') AS data_entrada_paciente

          FROM hospital.cuida_leito cl
          JOIN hospital.usuario u ON cl.CPF_E = u.cpf
          
          LEFT JOIN hospital.internacao i ON 
            cl.Bloco_Leito = i.Bloco_Leito AND 
            cl.Anexo_Leito = i.Anexo_Leito AND 
            cl.Andar_Leito = i.Andar_Leito AND 
            cl.N_Sala_Leito = i.N_Sala_Leito AND 
            cl.N_Leito = i.N_Leito AND
            i.Data_Entrada_Leito <= cl.Data_Entrada AND
            (i.Data_Saida_Leito IS NULL OR i.Data_Saida_Leito >= cl.Data_Entrada)

          LEFT JOIN hospital.consulta c ON i.Codigo = c.Codigo_Internacao
          LEFT JOIN hospital.usuario up_c ON c.CPF_P = up_c.cpf
          LEFT JOIN hospital.cirurgia cir ON i.Codigo = cir.Codigo_Internacao
          LEFT JOIN hospital.usuario up_cir ON cir.CPF_P = up_cir.cpf
          
          WHERE
            cl.CPF_E = ? AND
            (cl.N_Leito LIKE ? OR cl.Bloco_Leito LIKE ?)
            ${filterHoje} 

          ORDER BY cl.Data_Entrada ${orderDir};
        `;
        
        const [rows] = await connection.execute(query, [cpfEnfermeiro, searchTerm, searchTerm]);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar minhas alocações:', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/admin/desalocar-enfermeiro-leito', authenticateToken, async (req, res) => {
    if (!req.user.eh_admin) {
        return res.status(403).json({ message: 'Apenas administradores podem excluir alocações.' });
    }

    const { cpf_e, bloco, anexo, andar, n_sala, n_leito, data_entrada } = req.body;

    if (!cpf_e || !bloco || !n_leito || !data_entrada) {
        return res.status(400).json({ message: 'Dados incompletos para exclusão.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        

        if (match) {
            dataEntradaSQL = `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}:00`;
        } else {
            const dateObj = new Date(data_entrada);
            if (!isNaN(dateObj.getTime())) {
                 const pad = (n) => n.toString().padStart(2, '0');
                 const YYYY = dateObj.getFullYear();
                 const MM = pad(dateObj.getMonth() + 1);
                 const DD = pad(dateObj.getDate());
                 const HH = pad(dateObj.getHours());
                 const mm = pad(dateObj.getMinutes());
                 const ss = pad(dateObj.getSeconds());
                 dataEntradaSQL = `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
            }
        }

        const query = `
            DELETE FROM hospital.cuida_leito 
            WHERE CPF_E = ? AND Bloco_Leito = ? AND Anexo_Leito = ? 
              AND Andar_Leito = ? AND N_Sala_Leito = ? AND N_Leito = ? 
              AND Data_Entrada = ?
        `;

        const [result] = await connection.execute(query, [
            cpf_e, bloco, anexo, andar, n_sala, n_leito, dataEntradaSQL
        ]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Alocação removida com sucesso.' });
        } else {
            console.log("Tentativa falha de exclusão. Buscado:", dataEntradaSQL, "Recebido Original:", data_entrada);
            res.status(404).json({ message: 'Alocação não encontrada. Verifique se os dados correspondem.' });
        }

    } catch (error) {
        console.error('Erro ao desalocar:', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/admin/especialidades', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT Nome FROM hospital.especialidade ORDER BY Nome');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/hospital/internacoes-ativas', authenticateToken, async (req, res) => {
    if (!req.user.eh_admin && !req.user.eh_medico) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const { busca } = req.query;
    const searchTerm = busca ? `%${busca}%` : '%%';

    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                i.Codigo,
                i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito,
                DATE_FORMAT(i.Data_Entrada_Leito, '%d/%m/%Y %H:%i') as data_entrada_formatada,
                
                COALESCE(up_cons.primeiro_nome, up_cir.primeiro_nome) as primeiro_nome,
                COALESCE(up_cons.sobrenome, up_cir.sobrenome) as sobrenome,
                COALESCE(up_cons.cpf, up_cir.cpf) as cpf_paciente,
                
                CASE 
                    WHEN c.Numero IS NOT NULL THEN 'Consulta'
                    WHEN cir.Numero IS NOT NULL THEN 'Cirurgia'
                    ELSE 'Desconhecido'
                END as origem

            FROM hospital.internacao i
            LEFT JOIN hospital.consulta c ON i.Codigo = c.Codigo_Internacao
            LEFT JOIN hospital.usuario up_cons ON c.CPF_P = up_cons.cpf
            LEFT JOIN hospital.cirurgia cir ON i.Codigo = cir.Codigo_Internacao
            LEFT JOIN hospital.usuario up_cir ON cir.CPF_P = up_cir.cpf
            
            WHERE 
                i.Data_Saida_Leito IS NULL
                AND (
                    COALESCE(up_cons.primeiro_nome, up_cir.primeiro_nome) LIKE ? OR
                    COALESCE(up_cons.cpf, up_cir.cpf) LIKE ? OR
                    i.N_Leito LIKE ?
                )
            ORDER BY i.Data_Entrada_Leito DESC
        `;

        const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar internações:', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/hospital/internacoes', authenticateToken, async (req, res) => {
    if (!req.user.eh_admin && !req.user.eh_medico) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const { busca } = req.query;
    const searchTerm = busca ? `%${busca}%` : '%%';

    let connection;
    try {
        connection = await pool.getConnection();
        
        const query = `
            SELECT 
                i.Codigo,
                i.Bloco_Leito, i.Anexo_Leito, i.Andar_Leito, i.N_Sala_Leito, i.N_Leito,
                
                DATE_FORMAT(i.Data_Entrada_Leito, '%d/%m/%Y %H:%i') as data_entrada_formatada,
                DATE_FORMAT(i.Data_Saida_Leito, '%d/%m/%Y %H:%i') as data_saida_formatada,
                i.Data_Saida_Leito, 
                
                COALESCE(up_cons.primeiro_nome, up_cir.primeiro_nome) as primeiro_nome,
                COALESCE(up_cons.sobrenome, up_cir.sobrenome) as sobrenome,
                COALESCE(up_cons.cpf, up_cir.cpf) as cpf_paciente,
                
                CASE 
                    WHEN c.Numero IS NOT NULL THEN 'Consulta'
                    WHEN cir.Numero IS NOT NULL THEN 'Cirurgia'
                    ELSE 'Desconhecido'
                END as origem

            FROM hospital.internacao i
            LEFT JOIN hospital.consulta c ON i.Codigo = c.Codigo_Internacao
            LEFT JOIN hospital.usuario up_cons ON c.CPF_P = up_cons.cpf
            LEFT JOIN hospital.cirurgia cir ON i.Codigo = cir.Codigo_Internacao
            LEFT JOIN hospital.usuario up_cir ON cir.CPF_P = up_cir.cpf
            
            WHERE 
                (
                    COALESCE(up_cons.primeiro_nome, up_cir.primeiro_nome) LIKE ? OR
                    COALESCE(up_cons.cpf, up_cir.cpf) LIKE ? OR
                    i.N_Leito LIKE ?
                )
            ORDER BY 
                (i.Data_Saida_Leito IS NULL) DESC,
                i.Data_Entrada_Leito DESC
        `;

        const [rows] = await connection.execute(query, [searchTerm, searchTerm, searchTerm]);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar internações:', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/api/hospital/internacao/alta', authenticateToken, async (req, res) => {
    if (!req.user.eh_admin && !req.user.eh_medico) {
        return res.status(403).json({ message: 'Apenas Admin e Médicos podem dar alta.' });
    }

    const { codigo_internacao } = req.body;

    if (!codigo_internacao) {
        return res.status(400).json({ message: 'Código da internação obrigatório.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            'SELECT * FROM hospital.internacao WHERE Codigo = ? AND Data_Saida_Leito IS NULL',
            [codigo_internacao]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Internação não encontrada ou já finalizada.' });
        }
        const internacao = rows[0];
        const dataSaida = new Date();
        const dataEntrada = new Date(internacao.Data_Entrada_Leito);

        if (dataSaida <= dataEntrada) {
            await connection.rollback();
            return res.status(400).json({ 
                message: `Não é possível dar alta. A data atual (${dataSaida.toLocaleString('pt-BR')}) é anterior ou igual à data de entrada (${dataEntrada.toLocaleString('pt-BR')}).` 
            });
        }

        const dataSaidaSQL = dataSaida.toISOString().slice(0, 19).replace('T', ' ');

        await connection.execute(
            'UPDATE hospital.internacao SET Data_Saida_Leito = ? WHERE Codigo = ?',
            [dataSaidaSQL, codigo_internacao]
        );

        await connection.execute(
            `UPDATE hospital.cuida_leito 
             SET Data_Saida = ? 
             WHERE Bloco_Leito = ? AND Anexo_Leito = ? AND Andar_Leito = ? AND N_Sala_Leito = ? AND N_Leito = ? 
               AND Data_Entrada <= ? 
               AND (Data_Saida IS NULL OR Data_Saida > ?)`,
            [
                dataSaidaSQL, 
                internacao.Bloco_Leito, 
                internacao.Anexo_Leito, 
                internacao.Andar_Leito, 
                internacao.N_Sala_Leito, 
                internacao.N_Leito,
                dataSaidaSQL, 
                dataSaidaSQL  
            ]
        );

        await connection.commit();
        res.status(200).json({ message: 'Alta realizada com sucesso! Leito liberado.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao dar alta:', error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/admin/leitos-ocupados', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        l.Bloco_Leito, l.Anexo_Leito, l.Andar_Leito, l.N_Sala, l.N_Leito, 
        sl.Tipo_Leito,
        i.Data_Entrada_Leito,
        
        CONCAT(
            COALESCE(u_cons.primeiro_nome, u_cir.primeiro_nome, 'Paciente'), 
            ' ', 
            COALESCE(u_cons.sobrenome, u_cir.sobrenome, 'Desconhecido')
        ) as nome_paciente

      FROM hospital.leito l
      JOIN hospital.sala_leito sl ON 
        l.Bloco_Leito = sl.Bloco AND 
        l.Anexo_Leito = sl.Anexo AND 
        l.Andar_Leito = sl.Andar AND 
        l.N_Sala = sl.N_Sala
      
      JOIN hospital.internacao i ON
        l.Bloco_Leito = i.Bloco_Leito AND
        l.Anexo_Leito = i.Anexo_Leito AND
        l.Andar_Leito = i.Andar_Leito AND
        l.N_Sala = i.N_Sala_Leito AND
        l.N_Leito = i.N_Leito
      
      LEFT JOIN hospital.consulta c ON i.Codigo = c.Codigo_Internacao
      LEFT JOIN hospital.usuario u_cons ON c.CPF_P = u_cons.cpf
      
      LEFT JOIN hospital.cirurgia cir ON i.Codigo = cir.Codigo_Internacao
      LEFT JOIN hospital.usuario u_cir ON cir.CPF_P = u_cir.cpf
      
      WHERE i.Data_Saida_Leito IS NULL 
      ORDER BY sl.Tipo_Leito, l.Bloco_Leito, l.N_Sala;
    `;
    
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar leitos ocupados:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/medico/horarios-disponiveis', authenticateToken, async (req, res) => {
  const { cpf_m, data } = req.query;

  if (!cpf_m || !data) {
    return res.status(400).json({ message: 'CPF do médico e Data são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const queryAlocacoes = `
      SELECT Data_Inicio, Data_Fim 
      FROM hospital.trabalha_em 
      WHERE CPF_M = ? 
        AND DATE(Data_Inicio) = ?
      ORDER BY Data_Inicio ASC
    `;
    const [alocacoes] = await connection.execute(queryAlocacoes, [cpf_m, data]);

    const queryConsultas = `
      SELECT Data_Inicio, Horario_Fim 
      FROM hospital.consulta 
      WHERE CPF_M = ? 
        AND DATE(Data_Inicio) = ?
    `;
    const [consultas] = await connection.execute(queryConsultas, [cpf_m, data]);

    let slotsDisponiveis = [];
    const agora = new Date(); 

    const isOcupado = (horarioSlot) => {
        return consultas.some(c => {
            const inicioCons = new Date(c.Data_Inicio);
            const fimCons = new Date(c.Horario_Fim);
            return horarioSlot.getTime() >= inicioCons.getTime() && horarioSlot.getTime() < fimCons.getTime();
        });
    };

    alocacoes.forEach(aloc => {
        let atual = new Date(aloc.Data_Inicio);
        const fim = new Date(aloc.Data_Fim);

        while (atual < fim) {
            if (atual > agora) {
                if (!isOcupado(atual)) {
                    slotsDisponiveis.push(atual.toISOString());
                }
            }
            atual.setHours(atual.getHours() + 1);
        }
    });

    res.status(200).json(slotsDisponiveis);

  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/medico/dias-com-vagas', authenticateToken, async (req, res) => {
  const { cpf_m } = req.query;
  
  if (!cpf_m) {
    return res.status(400).json({ message: 'CPF do médico é obrigatório.' });
  }

  const diasAnalise = 60;
  let connection;
  try {
    connection = await pool.getConnection();

    const queryAlocacoes = `
      SELECT Data_Inicio, Data_Fim
      FROM hospital.trabalha_em
      WHERE CPF_M = ? 
        AND Data_Fim > NOW() 
        AND Data_Inicio < DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY Data_Inicio
    `;
    const [alocacoes] = await connection.execute(queryAlocacoes, [cpf_m, diasAnalise]);

    const queryConsultas = `
      SELECT Data_Inicio, Horario_Fim
      FROM hospital.consulta
      WHERE CPF_M = ? 
        AND Data_Inicio > NOW() 
        AND Data_Inicio < DATE_ADD(NOW(), INTERVAL ? DAY)
    `;
    const [consultas] = await connection.execute(queryConsultas, [cpf_m, diasAnalise]);

    const diasComVaga = new Set();
    const agora = new Date();

    const isOcupado = (horarioSlot) => {
         return consultas.some(c => {
            const ini = new Date(c.Data_Inicio);
            const fim = new Date(c.Horario_Fim);
            return horarioSlot >= ini && horarioSlot < fim;
         });
    };

    for (const aloc of alocacoes) {
        let atual = new Date(aloc.Data_Inicio);
        const fim = new Date(aloc.Data_Fim);

        if (atual < agora) {
            atual = new Date(agora);
            atual.setMinutes(0, 0, 0, 0);
            atual.setHours(atual.getHours() + 1);
        }

        while (atual < fim) {
            const diaStr = atual.toISOString().split('T')[0];

            if (diasComVaga.has(diaStr)) {
                atual.setDate(atual.getDate() + 1);
                atual.setHours(0, 0, 0, 0);
                continue; 
            }

            if (!isOcupado(atual)) {
                diasComVaga.add(diaStr);
                atual.setDate(atual.getDate() + 1);
                atual.setHours(0, 0, 0, 0);
            } else {
                atual.setHours(atual.getHours() + 1);
            }
        }
    }


    res.status(200).json(Array.from(diasComVaga).sort());

  } catch (error) {
    console.error('Erro ao buscar dias com vagas:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/admin/consulta/confirmar-pagamento', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { cpf_p, numero } = req.body;

  if (!cpf_p || !numero) {
    return res.status(400).json({ message: 'Dados da consulta incompletos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'UPDATE hospital.consulta SET Esta_Paga = 1 WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Pagamento da consulta confirmado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Consulta não encontrada.' });
    }

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/api/admin/cirurgia/confirmar-pagamento', authenticateToken, async (req, res) => {
  if (!req.user.eh_admin) {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }

  const { cpf_p, numero } = req.body;

  if (!cpf_p || !numero) {
    return res.status(400).json({ message: 'Dados da cirurgia incompletos.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'UPDATE hospital.cirurgia SET Esta_Paga = 1 WHERE CPF_P = ? AND Numero = ?', 
      [cpf_p, numero]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Pagamento da cirurgia confirmado com sucesso!' });
    } else {
      res.status(404).json({ message: 'Cirurgia não encontrada.' });
    }

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/conselho/relatorio/ocupacao', authenticateToken, async (req, res) => {
    if (!req.user.eh_conselho) return res.status(403).json({ message: 'Acesso restrito ao Conselho.' });

    let connection;
    try {
        connection = await pool.getConnection();
        
        const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM hospital.leito');
        const totalLeitos = totalRows[0].total;

        const [ocupadosRows] = await connection.execute('SELECT COUNT(*) as ocupados FROM hospital.internacao WHERE Data_Saida_Leito IS NULL');
        const leitosOcupados = ocupadosRows[0].ocupados;

        const taxa = totalLeitos > 0 ? ((leitosOcupados / totalLeitos) * 100).toFixed(2) : 0;

        res.json({
            total: totalLeitos,
            ocupados: leitosOcupados,
            livres: totalLeitos - leitosOcupados,
            taxa_ocupacao: taxa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar relatório.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/conselho/relatorio/produtividade-medica', authenticateToken, async (req, res) => {
    if (!req.user.eh_conselho) return res.status(403).json({ message: 'Acesso restrito.' });

    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            SELECT 
                CONCAT(u.primeiro_nome, ' ', u.sobrenome) as nome_medico,
                COUNT(DISTINCT c.Numero) as total_consultas,
                COUNT(DISTINCT r.N_Cirurgia) as total_cirurgias,
                (COUNT(DISTINCT c.Numero) + COUNT(DISTINCT r.N_Cirurgia)) as total_geral
            FROM hospital.medico m
            JOIN hospital.usuario u ON m.cpf = u.cpf
            LEFT JOIN hospital.consulta c ON m.cpf = c.CPF_M
            LEFT JOIN hospital.realiza r ON m.cpf = r.CPF_M
            GROUP BY m.cpf
            ORDER BY total_geral DESC
            LIMIT 10; 
        `;
        const [rows] = await connection.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/conselho/relatorio/especialidades', authenticateToken, async (req, res) => {
    if (!req.user.eh_conselho) return res.status(403).json({ message: 'Acesso restrito.' });

    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            SELECT 
                me.Especialidade,
                COUNT(c.Numero) as total_atendimentos
            FROM hospital.consulta c
            JOIN hospital.medico_especialidade me ON c.CPF_M = me.CPF_M
            GROUP BY me.Especialidade
            ORDER BY total_atendimentos DESC;
        `;
        const [rows] = await connection.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno.' });
    } finally {
        if (connection) connection.release();
    }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});