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

export default function GerenciarBuscaConsulta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);

  // Função que busca as consultas na API
  const fetchConsultas = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-consultas?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar consultas.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  // Busca todas as consultas quando a página carrega
  useEffect(() => {
    fetchConsultas("");
  }, []);

  // Função chamada no 'submit' da busca
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchConsultas(searchTerm);
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
              <th>Médico</th>
              <th>Data e Hora</th>
              <th>Localização</th>
              <th>Valor (R$)</th>
              <th>Paga</th>
              <th>Internação</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((consulta) => (
                <tr key={consulta.CPF_P + consulta.Numero}> {/* Chave única */}
                  <td>{consulta.nome_paciente}</td>
                  <td>{consulta.nome_medico}</td>
                  <td>{consulta.data_consulta}</td>
                  <td>{consulta.localizacao}</td>
                  <td>{formatarMoeda(consulta.Valor)}</td>
                  <td>{consulta.Esta_Paga ? 'Sim' : 'Não'}</td>
                  <td>{consulta.Internacao ? 'Sim' : 'Não'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Nenhuma consulta encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}