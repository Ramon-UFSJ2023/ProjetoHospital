import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function ListaSalaLeitos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const fetchSalas = async (termo) => {
    if (!token) return;
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-salas-leito?busca=${termo}`,
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
    if (token) fetchSalas("");
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSalas(searchTerm);
  };

  const handleExcluir = async () => {
    if (!itemSelecionado) return;
    if (!window.confirm(`Excluir Sala de Leito ${itemSelecionado.N_Sala} do Bloco ${itemSelecionado.Bloco}?`)) return;

    try {
      const response = await fetch('http://localhost:3001/api/admin/salas-leito/deletar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloco: itemSelecionado.Bloco,
          anexo: itemSelecionado.Anexo,
          andar: itemSelecionado.Andar,
          numero: itemSelecionado.N_Sala
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setItemSelecionado(null);
        fetchSalas(searchTerm);
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
              <h2>Detalhes da Sala de Leito</h2>
            </div>
            <div className="modal-body">
              <p><strong>Número:</strong> {itemSelecionado.N_Sala}</p>
              <p><strong>Tipo:</strong> {itemSelecionado.Tipo_Leito}</p>
              <hr style={{ margin: '10px 0', borderColor: '#feeded' }}/>
              <p><strong>Bloco:</strong> {itemSelecionado.Bloco}</p>
              <p><strong>Anexo:</strong> {itemSelecionado.Anexo}</p>
              <p><strong>Andar:</strong> {itemSelecionado.Andar}</p>
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
          placeholder="Buscar por Número, Tipo ou Bloco..."
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
              <th>Número</th>
              <th>Tipo</th>
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
                  <td>{item.Bloco}</td>
                  <td>{item.Anexo}</td>
                  <td>{item.Andar}</td>
                  <td>{item.N_Sala}</td>
                  <td>{item.Tipo_Leito}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign:'center'}}>Nenhuma sala encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}