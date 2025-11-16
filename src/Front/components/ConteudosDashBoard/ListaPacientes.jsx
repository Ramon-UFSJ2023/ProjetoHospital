import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function GerenciarBuscaPaciente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]); 

  const fetchPacientes = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-pacientes?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar pacientes.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  useEffect(() => {
    fetchPacientes(""); 
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault(); 
    fetchPacientes(searchTerm);
  };

  return (
    <div className="container-conteudo-admin">
      <form className="busca-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="inputs-Cad-Fun"
          placeholder="Buscar por Nome ou CPF..."
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
              <th>Nome Completo</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Data Nasc.</th>
              <th>Cidade</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((paciente) => (
                <tr key={paciente.cpf}>
                  <td>
                    {paciente.primeiro_nome} {paciente.sobrenome}
                  </td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.email}</td>
                  <td>{paciente.data_nascimento_formatada}</td>
                  <td>{paciente.cidade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}