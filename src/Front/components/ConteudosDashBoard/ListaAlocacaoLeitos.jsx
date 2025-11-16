import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function GerenciarAlocacaoLeitos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);

  const fetchAlocacoes = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-alocacoes-leitos?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar alocações de leitos.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  useEffect(() => {
    fetchAlocacoes("");
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchAlocacoes(searchTerm);
  };

  return (
    <div className="container-conteudo-admin">
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
              <th>Enfermeiro</th>
              <th>CPF (Enfermeiro)</th>
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
                <tr key={alocacao.CPF_E + alocacao.data_entrada_formatada + index}>
                  <td>{alocacao.nome_enfermeiro}</td>
                  <td>{alocacao.CPF_E}</td>
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
                <td colSpan="7" style={{ textAlign: "center" }}>
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