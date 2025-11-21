import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function GerenciarBuscaPaciente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]); 
  
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    fetchPacientes(""); 
  }, []);

  const fetchPacientes = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-pacientes?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar pacientes.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault(); 
    fetchPacientes(searchTerm);
  };

  const abrirDetalhes = (paciente) => {
    setPacienteSelecionado(paciente);
  };

  const fecharDetalhes = () => {
    setPacienteSelecionado(null);
  };

  const handleExcluir = async () => {
    if (!pacienteSelecionado) return;

    const confirmacao = window.confirm(
      `ATENÇÃO: Excluir o paciente ${pacienteSelecionado.primeiro_nome} apagará todo o histórico de consultas e cirurgias dele.\n\nDeseja continuar?`
    );

    if (!confirmacao) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/paciente/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cpf: pacienteSelecionado.cpf })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fecharDetalhes();
        fetchPacientes(searchTerm); 
      } else {
        alert(data.message || "Erro ao excluir paciente.");
      }

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  return (
    <div className="container-conteudo-admin">
      {pacienteSelecionado && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Paciente</h2>
            </div>
            <div className="modal-body">
              <p><strong>Nome Completo:</strong> {pacienteSelecionado.primeiro_nome} {pacienteSelecionado.sobrenome}</p>
              <p><strong>CPF:</strong> {pacienteSelecionado.cpf}</p>
              <p><strong>Data Nasc.:</strong> {pacienteSelecionado.data_nascimento_formatada}</p>
              <p><strong>Gênero:</strong> {pacienteSelecionado.genero === 'M' ? 'Masculino' : 'Feminino'}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Email:</strong> {pacienteSelecionado.email}</p>
              <p><strong>Telefone:</strong> {pacienteSelecionado.telefone || 'Não informado'}</p>
              <p><strong>Endereço:</strong> {pacienteSelecionado.rua}, {pacienteSelecionado.numero}</p>
              <p>{pacienteSelecionado.bairro} - {pacienteSelecionado.cidade} - CEP: {pacienteSelecionado.cep}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Observações Médicas:</strong></p>
              <p style={{ fontStyle: 'italic', color: '#555' }}>
                {pacienteSelecionado.Observacoes || 'Nenhuma observação registrada.'}
              </p>

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
          placeholder="Buscar por Nome ou CPF..."
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
              <th>Data Nasc.</th>
              <th>Cidade</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((paciente) => (
                <tr 
                  key={paciente.cpf}
                  onClick={() => abrirDetalhes(paciente)}
                  className="linha-clicavel" 
                  title="Clique para ver detalhes"
                >
                  <td>
                    {paciente.primeiro_nome} {paciente.sobrenome}
                  </td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.email}</td>
                  <td>{paciente.data_nascimento_formatada}</td>
                  <td>{paciente.cidade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}