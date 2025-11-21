import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function ListaLocalizacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [locSelecionada, setLocSelecionada] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchLocalizacoes = async (termo) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/localizacoes?busca=${termo}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    if (token) fetchLocalizacoes("");
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLocalizacoes(searchTerm);
  };

  const handleExcluir = async () => {
    if (!locSelecionada) return;
    if (!window.confirm(`Deseja excluir ${locSelecionada.Bloco} - ${locSelecionada.Anexo}?`)) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/localizacoes/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloco: locSelecionada.Bloco,
          anexo: locSelecionada.Anexo,
          andar: locSelecionada.Andar
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setLocSelecionada(null);
        fetchLocalizacoes(searchTerm);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="container-conteudo-admin">
      {locSelecionada && (
        <div className="modal-overlay" onClick={() => setLocSelecionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Localização</h2>
            </div>
            <div className="modal-body">
              <p><strong>Bloco:</strong> {locSelecionada.Bloco}</p>
              <p><strong>Anexo:</strong> {locSelecionada.Anexo}</p>
              <p><strong>Andar:</strong> {locSelecionada.Andar}</p>
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
                onClick={() => setLocSelecionada(null)}
              />
            </div>
          </div>
        </div>
      )}

      <form className="busca-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="inputs-Cad-Fun"
          placeholder="Buscar por Bloco ou Anexo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BtnCustomized size="medium" TypeText="strong" text="Buscar" showImg="hidden" TypeBtn="submit" />
      </form>

      <div className="resultados-container">
        <table className="tabela-resultados">
          <thead>
            <tr>
              <th>Bloco</th>
              <th>Anexo</th>
              <th>Andar</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((loc, index) => (
                <tr 
                  key={`${loc.Bloco}-${loc.Anexo}-${loc.Andar}-${index}`} 
                  onClick={() => setLocSelecionada(loc)}
                  className="linha-clicavel"
                >
                  <td>{loc.Bloco}</td>
                  <td>{loc.Anexo}</td>
                  <td>{loc.Andar}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{textAlign:'center'}}>Nenhuma localização encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}