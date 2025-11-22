import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const formatarMoeda = (valor) => {
  const valorNumerico = parseFloat(valor) || 0;
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function GerenciarBuscaConsulta({ onNavigateClick = () => {} }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [filtroHoje, setFiltroHoje] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      alert("Sessão não encontrada. Redirecionando para o login.");
      navigate('/');
    }
  }, [navigate]);

  const fetchConsultas = async (termoDeBusca) => {
    if (!user || !token) return; 
    let baseUrl = '';
    const isMedicoPage = location.pathname.includes('/page-medico');

    if (user.eh_medico && isMedicoPage) {
      baseUrl = `http://localhost:3001/api/medico/minhas-consultas`;
    } else if (user.eh_admin) {
      baseUrl = `http://localhost:3001/api/admin/buscar-consultas`;
    } else {
      baseUrl = `http://localhost:3001/api/paciente/minhas-consultas`;
    }
      
    const url = `${baseUrl}?busca=${termoDeBusca}&hoje=${filtroHoje}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setResultados(data);
      } else {
        if (response.status === 401 || response.status === 403) {
          alert("Sessão expirada ou acesso negado. Por favor, faça login novamente.");
          localStorage.clear();
          navigate('/');
        } else {
          alert(data.message || "Erro ao buscar consultas.");
        }
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchConsultas(searchTerm); 
    }
  }, [user, token, filtroHoje]); 

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchConsultas(searchTerm);
  };

  const abrirDetalhes = (consulta) => {
    setConsultaSelecionada(consulta);
  };

  const fecharDetalhes = () => {
    setConsultaSelecionada(null);
  };

  const handleConfirmarPagamento = async () => {
      if (!consultaSelecionada) return;
      
      if (!window.confirm(`Confirma o recebimento do pagamento de ${formatarMoeda(consultaSelecionada.Valor)}?`)) return;

      try {
          const response = await fetch('http://localhost:3001/api/admin/consulta/confirmar-pagamento', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  cpf_p: consultaSelecionada.CPF_P,
                  numero: consultaSelecionada.Numero
              })
          });

          const data = await response.json();
          if (response.ok) {
              alert(data.message);
              fecharDetalhes();
              fetchConsultas(searchTerm);
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error("Erro:", error);
          alert("Erro de conexão.");
      }
  };

  const handleExcluir = async () => {
    if (!consultaSelecionada) return;
    if (!window.confirm(`Tem certeza que deseja excluir a consulta Nº ${consultaSelecionada.Numero}?`)) return;

    try {
      const response = await fetch('http://localhost:3001/api/consulta/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cpf_p: consultaSelecionada.CPF_P,
          numero: consultaSelecionada.Numero
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fecharDetalhes(); 
        fetchConsultas(searchTerm); 
      } else {
        alert(data.message || "Erro ao excluir consulta.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  const isMedicoPage = location.pathname.includes('/page-medico');
  const showPatientColumn = user?.eh_admin || (user?.eh_medico && isMedicoPage);
  const placeholder = user?.eh_admin 
    ? "Buscar por Paciente, Médico ou CPF..."
    : (isMedicoPage ? "Buscar por Paciente..." : "Buscar por Médico...");

  return (
    <div className="container-conteudo-admin">
      {consultaSelecionada && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Consulta</h2>
            </div>
            <div className="modal-body">
              <p><strong>Número:</strong> {consultaSelecionada.Numero}</p>
              {showPatientColumn && (
                 <p><strong>Paciente:</strong> {consultaSelecionada.nome_paciente} (CPF: {consultaSelecionada.CPF_P})</p>
              )}
              <p><strong>Médico:</strong> {consultaSelecionada.nome_medico}</p>
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Data Início:</strong> {consultaSelecionada.data_consulta}</p>
              <p><strong>Previsão Término:</strong> {consultaSelecionada.horario_fim_formatado || '---'}</p>
              <p><strong>Local:</strong> {consultaSelecionada.localizacao}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>Valor:</strong> {formatarMoeda(consultaSelecionada.Valor)}</p>
              <p><strong>Status:</strong> {consultaSelecionada.Esta_Paga ? <span style={{color:'green', fontWeight:'bold'}}>PAGA</span> : <span style={{color:'red', fontWeight:'bold'}}>PENDENTE</span>}</p>
              
              <p><strong>Tipo:</strong> {consultaSelecionada.Internacao ? "Internação" : "Consulta Ambulatorial"}</p>
              {consultaSelecionada.Internacao && consultaSelecionada.localizacao_leito && (
                  <p style={{marginTop: '5px', color: '#9f2a2a'}}>
                      <strong>Leito de Internação:</strong> {consultaSelecionada.localizacao_leito}
                  </p>
              )}

            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                 
                 {user?.eh_admin && !consultaSelecionada.Esta_Paga && (
                    <button 
                        style={{
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '20px', 
                            padding: '8px 15px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={handleConfirmarPagamento}
                    >
                        Confirmar Pagamento
                    </button>
                 )}

                 {(user?.eh_admin || user?.eh_paciente) && (
                   <BtnCustomized
                    size="small"
                    TypeText="strong"
                    text="Excluir"
                    showImg="hidden"
                    TypeBtn="button"
                    onClick={handleExcluir}
                    />
                 )}
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
        {user?.eh_medico && isMedicoPage && (
            <button
                type="button"
                onClick={() => setFiltroHoje(!filtroHoje)}
                style={{
                    backgroundColor: filtroHoje ? '#28a745' : '#9f2a2a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '10px'
                }}
            >
                {filtroHoje ? 'Vendo: Hoje' : 'Ver Hoje'}
            </button>
        )}

        <input
          type="text"
          className="inputs-Cad-Fun" 
          placeholder={placeholder} 
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
              {showPatientColumn && <th>Paciente</th>} 
              <th>Médico</th>
              <th>Data e Hora</th>
              <th>Localização</th>
              <th>Valor (R$)</th>
              <th>Paga</th>
              <th>Internação</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((consulta) => (
                <tr 
                  key={consulta.CPF_P + consulta.Numero}
                  onClick={() => abrirDetalhes(consulta)}
                  className="linha-clicavel"
                  title="Clique para ver detalhes"
                >
                  {showPatientColumn && <td>{consulta.nome_paciente}</td>}
                  <td>{consulta.nome_medico}</td>
                  <td>{consulta.data_consulta}</td>
                  <td>{consulta.localizacao}</td>
                  <td>{formatarMoeda(consulta.Valor)}</td>
                  <td>{consulta.Esta_Paga ? 'Sim' : 'Não'}</td>
                  <td>{consulta.Internacao ? 'Sim' : 'Não'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showPatientColumn ? 7 : 6} style={{ textAlign: "center" }}>
                  Nenhuma consulta encontrada {filtroHoje ? 'para hoje.' : '.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}