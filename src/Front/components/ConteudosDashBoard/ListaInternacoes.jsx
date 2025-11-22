import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function ListaInternacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchInternacoes = async (termo) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/hospital/internacoes?busca=${termo}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setResultados(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    if (token) fetchInternacoes("");
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternacoes(searchTerm);
  };

  const handleAlta = async (internacao) => {
    const confirmacao = window.confirm(
        `Confirma a alta do paciente ${internacao.primeiro_nome}?\nIsso liberará o leito ${internacao.N_Leito} e registrará a saída.`
    );
    if (!confirmacao) return;

    try {
        const response = await fetch('http://localhost:3001/api/hospital/internacao/alta', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ codigo_internacao: internacao.Codigo })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchInternacoes(searchTerm);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão.");
    }
  };

  return (
    <div className="container-conteudo-admin">
      <h2 style={{color: '#9f2a2a', textAlign:'center', margin:'10px'}}>Histórico de Internações</h2>
      
      <form className="busca-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="inputs-Cad-Fun"
          placeholder="Buscar por Paciente, CPF ou Nº Leito..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BtnCustomized size="medium" TypeText="strong" text="Buscar" showImg="hidden" TypeBtn="submit" />
      </form>

      <div className="resultados-container">
        <table className="tabela-resultados">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Localização</th>
              <th>Leito</th>
              <th>Data Entrada</th>
              <th>Data Saída</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((item) => {
                const isAtivo = !item.Data_Saida_Leito;

                return (
                  <tr key={item.Codigo} style={{opacity: isAtivo ? 1 : 0.6}}>
                    <td>
                        {item.primeiro_nome} {item.sobrenome}
                        <div style={{fontSize:'11px', color:'#666'}}>{item.cpf_paciente || 'CPF N/D'}</div>
                    </td>
                    <td>Bloco {item.Bloco_Leito}, Anexo {item.Anexo_Leito}, Andar {item.Andar_Leito}, Sala {item.N_Sala_Leito}</td>
                    <td style={{fontWeight: 'bold'}}>{item.N_Leito}</td>
                    <td>{item.data_entrada_formatada}</td>
                    <td>{item.data_saida_formatada || '---'}</td>
                    
                    <td>
                        {isAtivo ? (
                            <span style={{color: 'green', fontWeight:'bold', border:'1px solid green', padding:'2px 5px', borderRadius:'5px'}}>INTERNADO</span>
                        ) : (
                            <span style={{color: 'gray', fontWeight:'bold'}}>ALTA</span>
                        )}
                    </td>

                    <td>
                      {isAtivo && (
                        <button 
                            style={{
                                backgroundColor: '#9f2a2a', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '20px',
                                padding: '8px 15px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            onClick={() => handleAlta(item)}
                        >
                            Dar Alta
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="7" style={{textAlign:'center'}}>Nenhum registro encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}