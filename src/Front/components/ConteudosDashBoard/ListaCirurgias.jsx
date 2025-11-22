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

export default function GerenciarBuscaCirurgia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cirurgiaSelecionada, setCirurgiaSelecionada] = useState(null);
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
      navigate('/');
    }
  }, [navigate]);

  const fetchCirurgias = async (termoDeBusca) => {
    if (!user || !token) return; 
    let baseUrl = '';
    
    const isMedicoPage = location.pathname.includes('/page-medico');
    const isEnfermeiroPage = location.pathname.includes('/page-enfermeiro');

    if (user.eh_medico && isMedicoPage) {
      baseUrl = `http://localhost:3001/api/medico/minhas-cirurgias`;
    } else if (user.eh_admin && location.pathname.includes('/page-func-adm')) {
      baseUrl = `http://localhost:3001/api/admin/buscar-cirurgias`;
    } else if (user.eh_enfermeiro && isEnfermeiroPage) {
      baseUrl = `http://localhost:3001/api/enfermeiro/minhas-cirurgias`;
    } else {
      baseUrl = `http://localhost:3001/api/paciente/minhas-cirurgias`;
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
        if (response.status !== 404) alert(data.message);
        else setResultados([]);
      }
    } catch (error) {
      console.error("Erro de rede:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchCirurgias(""); 
    }
  }, [user, token, filtroHoje]); 

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchCirurgias(searchTerm);
  };

  const abrirDetalhes = (cirurgia) => {
    setCirurgiaSelecionada(cirurgia);
  };

  const fecharDetalhes = () => {
    setCirurgiaSelecionada(null);
  };

  const handleConfirmarPagamento = async () => {
      if (!cirurgiaSelecionada) return;
      
      if (!window.confirm(`Confirma o recebimento do pagamento de ${formatarMoeda(cirurgiaSelecionada.Valor)}?`)) return;

      try {
          const response = await fetch('http://localhost:3001/api/admin/cirurgia/confirmar-pagamento', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  cpf_p: cirurgiaSelecionada.CPF_P,
                  numero: cirurgiaSelecionada.Numero
              })
          });

          const data = await response.json();
          if (response.ok) {
              alert(data.message);
              fecharDetalhes();
              fetchCirurgias(searchTerm);
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error("Erro:", error);
          alert("Erro de conexão.");
      }
  };

  const handleExcluir = async () => {
    if (!cirurgiaSelecionada) return;
    if (!window.confirm(`Tem certeza que deseja excluir a cirurgia Nº ${cirurgiaSelecionada.Numero}?`)) return;

    try {
      const response = await fetch('http://localhost:3001/api/cirurgia/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cpf_p: cirurgiaSelecionada.CPF_P,
          numero: cirurgiaSelecionada.Numero
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fecharDetalhes(); 
        fetchCirurgias(searchTerm); 
      } else {
        alert(data.message || "Erro ao excluir cirurgia.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  const isMedicoPage = location.pathname.includes('/page-medico');
  const isEnfermeiroPage = location.pathname.includes('/page-enfermeiro');
  const showPatientColumn = user?.eh_admin || (user?.eh_medico && isMedicoPage) || (user?.eh_enfermeiro && isEnfermeiroPage);

  return (
    <div className="container-conteudo-admin">
      
      {cirurgiaSelecionada && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Cirurgia</h2>
            </div>
            <div className="modal-body">
              <p><strong>Número:</strong> {cirurgiaSelecionada.Numero}</p>
              {showPatientColumn && (
                 <p><strong>Paciente:</strong> {cirurgiaSelecionada.nome_paciente} (CPF: {cirurgiaSelecionada.CPF_P})</p>
              )}
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>Médicos:</strong> {cirurgiaSelecionada.medicos || 'Não informados'}</p>
              <p><strong>Enfermeiros:</strong> {cirurgiaSelecionada.enfermeiros || 'Não informados'}</p>
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Início:</strong> {cirurgiaSelecionada.data_entrada_formatada}</p>
              <p><strong>Fim:</strong> {cirurgiaSelecionada.data_finalizacao_formatada || 'Em andamento'}</p>
              <p><strong>Local:</strong> {cirurgiaSelecionada.localizacao}</p>
              
              {cirurgiaSelecionada.localizacao_leito && (
                  <p style={{color: '#9f2a2a'}}><strong>Leito Pós-Cirúrgico:</strong> {cirurgiaSelecionada.localizacao_leito}</p>
              )}

              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>TUSS:</strong> {cirurgiaSelecionada.N_Tuss}</p>
              <p><strong>Valor:</strong> {formatarMoeda(cirurgiaSelecionada.Valor)}</p>
              <p><strong>Status:</strong> {cirurgiaSelecionada.Esta_Paga ? <span style={{color:'green', fontWeight:'bold'}}>PAGA</span> : <span style={{color:'red', fontWeight:'bold'}}>PENDENTE</span>}</p>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                 
                 {user?.eh_admin && !cirurgiaSelecionada.Esta_Paga && (
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

                 {(user?.eh_admin || (user?.eh_paciente && !cirurgiaSelecionada.Esta_Paga)) && (
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
        
        { ((user?.eh_medico && isMedicoPage) || (user?.eh_enfermeiro && isEnfermeiroPage)) && (
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
          placeholder="Buscar por Paciente, Médico ou CPF..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BtnCustomized size="medium" TypeText="strong" text="Buscar" showImg="hidden" TypeBtn="submit" />
      </form>

      <div className="resultados-container">
        <table className="tabela-resultados">
          <thead>
            <tr>
              {showPatientColumn && <th>Paciente</th>} 
              <th>Médicos</th>
              <th>Início</th>
              <th>Local</th>
              <th>Valor (R$)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((cirurgia) => (
                <tr 
                  key={cirurgia.CPF_P + cirurgia.Numero}
                  onClick={() => abrirDetalhes(cirurgia)}
                  className="linha-clicavel"
                  title="Clique para ver detalhes"
                >
                  {showPatientColumn && <td>{cirurgia.nome_paciente}</td>}
                  <td>{cirurgia.medicos}</td>
                  <td>{cirurgia.data_entrada_formatada}</td>
                  <td>{cirurgia.localizacao}</td>
                  <td>{formatarMoeda(cirurgia.Valor)}</td>
                  <td>{cirurgia.Esta_Paga ? 'Sim' : 'Não'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showPatientColumn ? 6 : 5} style={{ textAlign: "center" }}>
                  Nenhuma cirurgia encontrada {filtroHoje ? 'para hoje.' : '.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}