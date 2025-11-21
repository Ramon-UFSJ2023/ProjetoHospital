import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useLocation, useNavigate } from "react-router-dom";

export default function GerenciarAlocacaoLeitos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [alocacaoSelecionada, setAlocacaoSelecionada] = useState(null);
  
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
          url = `http://localhost:3001/api/enfermeiro/minhas-alocacoes-leitos?busca=${termoDeBusca}`;
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
        fetchAlocacoes("");
    }
  }, [user, token]);

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
        const locParts = alocacaoSelecionada.localizacao_leito ? alocacaoSelecionada.localizacao_leito.split(',') : [];
        const blocoExt = alocacaoSelecionada.Bloco_Leito || (locParts[0] ? locParts[0].replace('Bloco ', '').trim() : '');
        const anexoExt = alocacaoSelecionada.Anexo_Leito || (locParts[1] ? locParts[1].replace('Anexo ', '').trim() : '');
        const andarExt = alocacaoSelecionada.Andar_Leito || (locParts[2] ? locParts[2].replace('Andar ', '').trim() : '');
        const salaExt = alocacaoSelecionada.N_Sala_Leito || (locParts[3] ? locParts[3].replace('Sala ', '').trim() : '');
        const leitoExt = alocacaoSelecionada.N_Leito || (locParts[4] ? locParts[4].replace('Leito ', '').trim() : '');

        const payload = {
            cpf_e: cpfParaDeletar,
            bloco: blocoExt,
            anexo: anexoExt,
            andar: andarExt,
            n_sala: salaExt,
            n_leito: leitoExt,
            data_entrada: alocacaoSelecionada.Data_Entrada || alocacaoSelecionada.data_entrada_formatada 
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
              <p><strong>Data Entrada:</strong> {alocacaoSelecionada.data_entrada_formatada}</p>
              <p><strong>Data Saída:</strong> {alocacaoSelecionada.data_saida_formatada || 'Em andamento'}</p>
              
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
              <th>Data Entrada</th>
              <th>Data Saída</th>
              <th>Status Alocação</th>
              <th>Leito Ocupado</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((alocacao, index) => (
                <tr 
                  key={index} 
                  onClick={() => abrirDetalhes(alocacao)} 
                  className="linha-clicavel"
                  title="Clique para ver detalhes"
                >
                  <td>{alocacao.nomes_enfermeiros}</td>
                  <td>{alocacao.localizacao_leito}</td>
                  <td>{alocacao.data_entrada_formatada}</td>
                  <td>{alocacao.data_saida_formatada || '---'}</td>
                  
                  <td style={{ color: alocacao.status_alocacao === 'ATIVO' ? 'green' : 'gray' }}>
                    <strong>{alocacao.status_alocacao}</strong>
                  </td>
                  
                  <td>{alocacao.leito_ocupado ? 'Sim' : 'Não'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Nenhuma alocação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}