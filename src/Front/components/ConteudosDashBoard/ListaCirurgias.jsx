import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; // Reutilizando o mesmo CSS
import BtnCustomized from "../Buttons/ButtonCustomized";

// Helper para formatar R$
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

  // Função que busca as cirurgias na API
  const fetchCirurgias = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-cirurgias?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar cirurgias.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  // Busca todas as cirurgias quando a página carrega
  useEffect(() => {
    fetchCirurgias("");
  }, []);

  // Função chamada no 'submit' da busca
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchCirurgias(searchTerm);
  };

  return (
    <div className="container-conteudo-admin">
      {/* --- BARRA DE BUSCA --- */}
      <form className="busca-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="inputs-Cad-Fun" // Reutilizando seu estilo
          placeholder="Buscar por nome do Paciente, Médico ou CPF..."
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

      {/* --- TABELA DE RESULTADOS --- */}
      <div className="resultados-container">
        <table className="tabela-resultados">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico(s)</th>
              <th>Data Entrada</th>
              <th>Data Finalização</th>
              <th>Localização</th>
              <th>Valor (R$)</th>
              <th>Paga</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((cirurgia) => (
                <tr key={cirurgia.CPF_P + cirurgia.Numero}> {/* Chave única */}
                  <td>{cirurgia.nome_paciente}</td>
                  <td>{cirurgia.medicos || 'N/D'}</td>
                  <td>{cirurgia.data_entrada_formatada}</td>
                  <td>{cirurgia.data_finalizacao_formatada || 'Pendente'}</td>
                  <td>{cirurgia.localizacao}</td>
                  <td>{formatarMoeda(cirurgia.Valor)}</td>
                  <td>{cirurgia.Esta_Paga ? 'Sim' : 'Não'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Nenhuma cirurgia encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}