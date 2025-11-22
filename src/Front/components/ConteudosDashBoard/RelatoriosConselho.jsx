import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 

export default function RelatoriosConselho({ tipoRelatorio }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
      setDados(null); 
  }, [tipoRelatorio]);

  useEffect(() => {
    if (!token || tipoRelatorio === "Visão Geral") {
        setLoading(false);
        return;
    }

    setLoading(true);
    
    let url = "";
    if (tipoRelatorio === "Ocupação Hospitalar") url = "http://localhost:3001/api/conselho/relatorio/ocupacao";
    else if (tipoRelatorio === "Produtividade Médica") url = "http://localhost:3001/api/conselho/relatorio/produtividade-medica";
    else if (tipoRelatorio === "Especialidades") url = "http://localhost:3001/api/conselho/relatorio/especialidades";
    else return;

    fetch(url, { 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        } 
    })
      .then(res => {
          if (res.status === 401 || res.status === 403) {
              throw new Error("Acesso negado. Token inválido ou expirado.");
          }
          return res.json();
      })
      .then(data => setDados(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, [tipoRelatorio, token]);

  if (tipoRelatorio === "Visão Geral") {
      return (
          <div style={{padding: '20px', textAlign: 'center'}}>
              <h2 style={{color: '#9f2a2a', marginTop: '20px'}}>Painel de Controle - Conselho Presidente</h2>
              <p style={{color: '#555', marginBottom: '40px'}}>Selecione um relatório no menu superior para visualizar os indicadores de desempenho.</p>
              
              <div style={{display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap'}}>
                  <div style={{padding: '30px', backgroundColor: 'white', borderRadius: '15px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderTop: '5px solid #9f2a2a'}}>
                      <h3 style={{fontSize: '20px', color: '#333'}}>Gestão de Leitos</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>Monitore a taxa de ocupação e disponibilidade.</p>
                  </div>
                  <div style={{padding: '30px', backgroundColor: 'white', borderRadius: '15px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderTop: '5px solid #9f2a2a'}}>
                      <h3 style={{fontSize: '20px', color: '#333'}}>Performance</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>Acompanhe a produtividade do corpo clínico.</p>
                  </div>
                  <div style={{padding: '30px', backgroundColor: 'white', borderRadius: '15px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderTop: '5px solid #9f2a2a'}}>
                      <h3 style={{fontSize: '20px', color: '#333'}}>Demandas</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>Identifique as especialidades mais requisitadas.</p>
                  </div>
              </div>
          </div>
      );
  }

  if (loading) return <div style={{padding: '20px', textAlign:'center'}}>Carregando dados...</div>;
  if (!dados) return <div style={{padding: '20px', textAlign:'center'}}>Sem dados disponíveis para exibição.</div>;

  return (
    <div className="container-conteudo-admin">
      <h2 style={{color: '#9f2a2a', textAlign:'center', margin:'20px 0'}}>{tipoRelatorio}</h2>
      {tipoRelatorio === "Ocupação Hospitalar" && !Array.isArray(dados) && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{
                  width: '200px', height: '200px', borderRadius: '50%', 
                  background: `conic-gradient(#9f2a2a ${dados.taxa_ocupacao}%, #ddd 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px'
              }}>
                  <div style={{width: '160px', height: '160px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                      <span style={{fontSize: '30px', fontWeight: 'bold', color: '#9f2a2a'}}>{dados.taxa_ocupacao}%</span>
                      <span style={{color: '#666', fontSize:'12px'}}>Ocupado</span>
                  </div>
              </div>
              <div style={{display: 'flex', gap: '20px', fontSize: '16px'}}>
                  <p><strong>Total:</strong> {dados.total}</p>
                  <p style={{color: '#9f2a2a'}}><strong>Ocupados:</strong> {dados.ocupados}</p>
                  <p style={{color: 'green'}}><strong>Livres:</strong> {dados.livres}</p>
              </div>
          </div>
      )}
      {tipoRelatorio === "Produtividade Médica" && Array.isArray(dados) && (
          <div className="resultados-container">
            <table className="tabela-resultados">
                <thead>
                    <tr>
                        <th>Médico</th>
                        <th>Consultas</th>
                        <th>Cirurgias</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {dados.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.nome_medico}</td>
                            <td>{item.total_consultas}</td>
                            <td>{item.total_cirurgias}</td>
                            <td><strong>{item.total_geral}</strong></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      )}
      {tipoRelatorio === "Especialidades" && Array.isArray(dados) && (
          <div className="resultados-container">
            <table className="tabela-resultados">
                <thead>
                    <tr>
                        <th>Especialidade</th>
                        <th>Atendimentos</th>
                        <th>% Estimado</th>
                    </tr>
                </thead>
                <tbody>
                    {dados.map((item, idx) => {
                        const totalGeral = dados.reduce((acc, curr) => acc + curr.total_atendimentos, 0);
                        const percent = totalGeral > 0 ? ((item.total_atendimentos / totalGeral) * 100).toFixed(1) : 0;
                        return (
                            <tr key={idx}>
                                <td>{item.Especialidade}</td>
                                <td>{item.total_atendimentos}</td>
                                <td>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{width: '100px', height: '10px', background: '#ddd', borderRadius: '5px'}}>
                                            <div style={{width: `${percent}%`, height: '100%', background: '#9f2a2a', borderRadius: '5px'}}></div>
                                        </div>
                                        {percent}%
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>
      )}
    </div>
  );
}