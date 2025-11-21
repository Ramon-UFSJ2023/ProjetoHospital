import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function ListaLeitos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchLeitos = async (termo) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-leitos?busca=${termo}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  useEffect(() => {
    if (token) fetchLeitos("");
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeitos(searchTerm);
  };

  const handleExcluir = async () => {
    if (!itemSelecionado) return;
    if (!window.confirm(`Excluir Leito ${itemSelecionado.N_Leito} da Sala ${itemSelecionado.N_Sala}?`)) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/leitos/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloco: itemSelecionado.Bloco_Leito,
          anexo: itemSelecionado.Anexo_Leito,
          andar: itemSelecionado.Andar_Leito,
          n_sala: itemSelecionado.N_Sala,
          n_leito: itemSelecionado.N_Leito
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setItemSelecionado(null);
        fetchLeitos(searchTerm);
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
      {itemSelecionado && (
        <div className="modal-overlay" onClick={() => setItemSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Leito</h2>
            </div>
            <div className="modal-body">
              <p><strong>Número do Leito:</strong> {itemSelecionado.N_Leito}</p>
              <p><strong>Sala:</strong> {itemSelecionado.N_Sala}</p>
              <p><strong>Tipo de Sala:</strong> {itemSelecionado.Tipo_Leito}</p>
              <p><strong>Status:</strong> <span style={{color: itemSelecionado.Ocupado ? 'red' : 'green'}}>{itemSelecionado.Ocupado ? 'Ocupado' : 'Livre'}</span></p>
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>Localização:</strong> Bloco {itemSelecionado.Bloco_Leito}, {itemSelecionado.Anexo_Leito}, Andar {itemSelecionado.Andar_Leito}</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
               <div style={{ marginRight: 'auto' }}>
                 <BtnCustomized size="small" TypeText="strong" text="Excluir" showImg="hidden" TypeBtn="button" onClick={handleExcluir} />
               </div>
               <BtnCustomized size="small" TypeText="strong" text="Fechar" showImg="hidden" TypeBtn="button" onClick={() => setItemSelecionado(null)} />
            </div>
          </div>
        </div>
      )}

      <form className="busca-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="inputs-Cad-Fun"
          placeholder="Buscar por Nº Leito, Sala ou Bloco..."
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
              <th>Sala</th>
              <th>Tipo</th>
              <th>Nº Leito</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((item, index) => (
                <tr 
                  key={index} 
                  onClick={() => setItemSelecionado(item)}
                  className="linha-clicavel"
                >
                  <td>{item.Bloco_Leito}</td>
                  <td>{item.N_Sala}</td>
                  <td>{item.Tipo_Leito}</td>
                  <td>{item.N_Leito}</td>
                  <td>{item.Ocupado ? 'Ocupado' : 'Livre'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign:'center'}}>Nenhum leito encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}