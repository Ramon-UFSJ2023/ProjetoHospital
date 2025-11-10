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
  password: '10.%7Mpa?6~V',
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

    const queryUsuario = 'SELECT * FROM hospital.usuario WHERE cpf = ?';
    const [rows] = await connection.execute(queryUsuario, [cpfLimpo]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
    }

    const user = rows[0];
    const senhaSalva = user.senha;
    const isMatch = await bcrypt.compare(password, senhaSalva);

    if (!isMatch) {
      return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
    }

    let isPaciente = false;
    let isFuncionario = false;
    let isAdmin = false;

    const [pacienteRows] = await connection.execute('SELECT cpf FROM hospital.paciente WHERE cpf = ?', [cpfLimpo]);
    if (pacienteRows.length > 0) {
      isPaciente = true;
    }

    const [funcRows] = await connection.execute('SELECT Eh_admin FROM hospital.funcionario WHERE cpf = ?', [cpfLimpo]);
    if (funcRows.length > 0) {
      isFuncionario = true;
      isAdmin = funcRows[0].Eh_admin;
    }

    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: {
        cpf: user.cpf,
        primeiro_nome: user.primeiro_nome,
        eh_paciente: isPaciente,
        eh_funcionario: isFuncionario,
        eh_admin: isAdmin
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
    
    } else if (typeCad === 'medico' || typeCad === 'enfermeiro') {
      
      const queryFuncionario = `
        INSERT INTO hospital.funcionario (cpf, Salario, Eh_admin, Eh_Conselho, Carga_Horaria)
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.execute(queryFuncionario, [
        cpf, salario, eh_admin, eh_conselho, carga_horaria
      ]);

      if (typeCad === 'medico') {
        if (!crm || !especialidade) {
          throw new Error('CRM e Especialidade são obrigatórios para Médicos.');
        }
        const queryMedico = 'INSERT INTO hospital.medico (cpf, CRM, Especialidade) VALUES (?, ?, ?)';
        await connection.execute(queryMedico, [cpf, crm, especialidade]);
      
      } else if (typeCad === 'enfermeiro') {
        if (!cofen || !formacao) {
          throw new Error('COFEN e Formação são obrigatórios para Enfermeiros.');
        }
        const queryEnfermeiro = 'INSERT INTO hospital.enfermeiro (cpf, COFEN, Formacao) VALUES (?, ?, ?)';
        await connection.execute(queryEnfermeiro, [cpf, cofen, formacao]);
      }
    
    } else {
      throw new Error('Tipo de cadastro inválido.');
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

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});