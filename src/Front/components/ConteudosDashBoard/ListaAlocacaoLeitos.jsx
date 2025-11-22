import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useLocation, useNavigate } from "react-router-dom";

export default function GerenciarAlocacaoLeitos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [alocacaoSelecionada, setAlocacaoSelecionada] = useState(null);
  const [filtroHoje, setFiltroHoje] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const fetchAlocacoes = async (termoDeBusca) => {
    if (!user || !token) return;

    try {
      let url = "";
      
      if (user.eh_admin && location.pathname.includes('/page-func-adm')) {
          url = `http://localhost:3001/api/admin/buscar-alocacoes-leitos?busca=${termoDeBusca}`;
      } 
      else if (user.eh_enfermeiro && location.pathname.includes('/page-enfermeiro')) {
          url = `http://localhost:3001/api/enfermeiro/minhas-alocacoes-leitos?busca=${termoDeBusca}&hoje=${filtroHoje}`;
      } 
      else {
          return; 
      }

      const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        if (response.status !== 404) {
             alert(data.message || "Erro ao buscar alocações.");
        } else {
            setResultados([]);
        }
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  useEffect(() => {
    if (user && token) {
        fetchAlocacoes(searchTerm);
    }
  }, [user, token, filtroHoje]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchAlocacoes(searchTerm);
  };

  const abrirDetalhes = (alocacao) => {
    setAlocacaoSelecionada(alocacao);
  };

  const fecharDetalhes = () => {
    setAlocacaoSelecionada(null);
  };

  const handleExcluir = async () => {
    if (!alocacaoSelecionada) return;
    if (!window.confirm("Tem certeza que deseja remover esta alocação? Isso liberará o leito e o enfermeiro.")) return;

    try {
        const cpfParaDeletar = alocacaoSelecionada.cpfs_enfermeiros ? alocacaoSelecionada.cpfs_enfermeiros.split(',')[0].trim() : null;
        
        const payload = {
            cpf_e: cpfParaDeletar,
            bloco: alocacaoSelecionada.Bloco_Leito,
            anexo: alocacaoSelecionada.Anexo_Leito,
            andar: alocacaoSelecionada.Andar_Leito,
            n_sala: alocacaoSelecionada.N_Sala_Leito,
            n_leito: alocacaoSelecionada.N_Leito,
            data_entrada: alocacaoSelecionada.data_entrada_formatada 
        };

        const response = await fetch('http://localhost:3001/api/admin/desalocar-enfermeiro-leito', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fecharDetalhes();
            fetchAlocacoes(searchTerm); 
        } else {
            alert(data.message || "Erro ao excluir alocação.");
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao conectar para exclusão.");
    }
  };

  const podeExcluir = user && user.eh_admin && location.pathname.includes('/page-func-adm');
  const isEnfermeiroPage = location.pathname.includes('/page-enfermeiro');

  return (
    <div className="container-conteudo-admin">
      
      {alocacaoSelecionada && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Alocação</h2>
            </div>
            <div className="modal-body">
              <p><strong>Enfermeiros Responsáveis:</strong> {alocacaoSelecionada.nomes_enfermeiros}</p>
              <p><strong>CPFs:</strong> {alocacaoSelecionada.cpfs_enfermeiros}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Localização:</strong> {alocacaoSelecionada.localizacao_leito}</p>
              
              <div style={{backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', margin: '10px 0', borderLeft: '4px solid #9f2a2a'}}>
                  <p style={{margin: 0}}><strong>Paciente Internado:</strong> {alocacaoSelecionada.nome_paciente || 'Leito Vago / Sem Paciente'}</p>
                  {alocacaoSelecionada.nome_paciente && (
                      <p style={{margin: '5px 0 0 0', fontSize: '0.9em', color: '#555'}}>
                          Data de Entrada do Paciente: {alocacaoSelecionada.data_entrada_paciente}
                      </p>
                  )}
              </div>

              <p><strong>Início Plantão:</strong> {alocacaoSelecionada.data_entrada_formatada}</p>
              <p><strong>Fim Plantão:</strong> {alocacaoSelecionada.data_saida_formatada || 'Em andamento'}</p>
              
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              
              <p><strong>Status da Alocação:</strong> 
                <span style={{ color: alocacaoSelecionada.status_alocacao === 'ATIVO' ? 'green' : 'gray', fontWeight: 'bold', marginLeft: '5px' }}>
                  {alocacaoSelecionada.status_alocacao}
                </span>
              </p>
              <p><strong>Status Atual do Leito:</strong> {alocacaoSelecionada.leito_ocupado ? 'Ocupado' : 'Livre'}</p>
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              
              <div style={{ marginRight: 'auto' }}>
                {podeExcluir && (
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
        
        {user?.eh_enfermeiro && isEnfermeiroPage && (
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
          placeholder="Buscar por Enfermeiro, CPF ou Nº do Leito..."
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
              <th>Enfermeiros</th>
              <th>Localização do Leito</th>
              <th>Paciente</th>
              <th>Início Plantão</th>
              <th>Fim Plantão</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((alocacao, index) => (
                <tr 
                  key={index} 
                  onClick={() => abrirDetalhes(alocacao)} 
                  className="linha-clicavel"
                  title="Clique para ver detalhes completos"
                >
                  <td>{alocacao.nomes_enfermeiros}</td>
                  <td>{alocacao.localizacao_leito}</td>
                  <td>{alocacao.nome_paciente || '-'}</td>
                  <td>{alocacao.data_entrada_formatada}</td>
                  <td>{alocacao.data_saida_formatada || '---'}</td>
                  
                  <td style={{ color: alocacao.status_alocacao === 'ATIVO' ? 'green' : 'gray', fontWeight: 'bold' }}>
                    {alocacao.status_alocacao}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Nenhuma alocação encontrada {filtroHoje ? 'para hoje.' : '.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}