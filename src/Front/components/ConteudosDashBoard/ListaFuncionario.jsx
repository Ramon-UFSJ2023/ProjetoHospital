import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

const formatarMoeda = (valor) => {
  const valorNumerico = parseFloat(valor) || 0;
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function GerenciarBuscaFuncionario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [token, setToken] = useState(null); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        setToken(storedToken);
    }
    fetchFuncionarios("");
  }, []);

  const fetchFuncionarios = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-funcionarios?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar funcionários.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchFuncionarios(searchTerm);
  };

  const abrirDetalhes = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
  };

  const fecharDetalhes = () => {
    setFuncionarioSelecionado(null);
  };

  const handleExcluir = async () => {
    if (!funcionarioSelecionado) return;

    const confirmacao = window.confirm(
        `Tem certeza que deseja excluir o funcionário ${funcionarioSelecionado.primeiro_nome} ${funcionarioSelecionado.sobrenome}?`
    );

    if (!confirmacao) return;

    try {
        const response = await fetch('http://localhost:3001/api/admin/funcionario/deletar', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ cpf: funcionarioSelecionado.cpf })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fecharDetalhes(); 
            fetchFuncionarios(searchTerm); 
        } else {
            alert(data.message || "Erro ao excluir funcionário.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão ao tentar excluir.");
    }
  };

  return (
    <div className="container-conteudo-admin">
      
      {funcionarioSelecionado && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Funcionário</h2>
            </div>
            <div className="modal-body">
              <p><strong>Nome Completo:</strong> {funcionarioSelecionado.primeiro_nome} {funcionarioSelecionado.sobrenome}</p>
              <p><strong>CPF:</strong> {funcionarioSelecionado.cpf}</p>
              <p><strong>Email:</strong> {funcionarioSelecionado.email}</p>
              <p><strong>Telefone:</strong> {funcionarioSelecionado.telefone || 'Não cadastrado'}</p>
              <p><strong>Data Nasc.:</strong> {funcionarioSelecionado.data_nascimento_formatada}</p>
              <p><strong>Gênero:</strong> {funcionarioSelecionado.genero}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Cargo/Função:</strong> {funcionarioSelecionado.cargo}</p>
              <p><strong>Salário:</strong> {formatarMoeda(funcionarioSelecionado.Salario)}</p>
              <p><strong>Carga Horária:</strong> {funcionarioSelecionado.Carga_Horaria}h semanais</p>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                <p><strong>Administrador:</strong> <span style={{ color: funcionarioSelecionado.Eh_admin ? 'green' : 'red' }}>{funcionarioSelecionado.Eh_admin ? 'Sim' : 'Não'}</span></p>
                <p><strong>Conselho:</strong> <span style={{ color: funcionarioSelecionado.Eh_Conselho ? 'green' : 'red' }}>{funcionarioSelecionado.Eh_Conselho ? 'Sim' : 'Não'}</span></p>
              </div>

              {funcionarioSelecionado.tipo_funcionario === 'MEDICO' && (
                <>
                   <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
                   <p><strong>CRM:</strong> {funcionarioSelecionado.CRM}</p>
                   <p><strong>Especialidade:</strong> {funcionarioSelecionado.Especialidade}</p>
                </>
              )}


              {funcionarioSelecionado.tipo_funcionario === 'ENFERMEIRO' && (
                <>
                   <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
                   <p><strong>COFEN:</strong> {funcionarioSelecionado.COFEN}</p>
                   <p><strong>Formação:</strong> {funcionarioSelecionado.Formacao}</p>
                </>
              )}

              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>Endereço:</strong> {funcionarioSelecionado.rua}, {funcionarioSelecionado.numero}</p>
              <p>{funcionarioSelecionado.bairro} - {funcionarioSelecionado.cidade} - CEP: {funcionarioSelecionado.cep}</p>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <div style={{ marginRight: 'auto' }}>
                <BtnCustomized
                    size="small"
                    TypeText="strong"
                    text="Excluir"
                    showImg="hidden"
                    TypeBtn="button"
                    onClick={handleExcluir}
                />
              </div>

              <BtnCustomized
                size="small"
                TypeText="strong"
                text="Fechar"
                showImg="hidden"
                TypeBtn="button"
                onClick={fecharDetalhes}
              />
            </div>
          </div>
        </div>
      )}

      <form className="busca-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="inputs-Cad-Fun" 
          placeholder="Buscar por Nome ou CPF do funcionário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BtnCustomized
          size="medium"
          TypeText="strong"
          text="Buscar"
          showImg="hidden"
          TypeBtn="submit"
        />
      </form>

      <div className="resultados-container">
        <table className="tabela-resultados">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Salário</th>
              <th>Cargo/Especialidade</th>
              <th>Admin</th>
              <th>Conselho</th>  
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((func) => (
                <tr 
                  key={func.cpf}
                  onClick={() => abrirDetalhes(func)}
                  className="linha-clicavel"
                  title="Clique para ver detalhes completos"
                >
                  <td>
                    {func.primeiro_nome} {func.sobrenome}
                  </td>
                  <td>{func.cpf}</td>
                  <td>{func.email}</td>
                  <td>{formatarMoeda(func.Salario)}</td>
                  <td>{func.cargo}</td>
                  <td>{func.Eh_admin ? 'Sim' : 'Não'}</td>
                  <td>{func.Eh_Conselho ? 'Sim' : 'Não'}</td>        
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}