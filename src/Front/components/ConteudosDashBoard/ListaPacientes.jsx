import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

export default function GerenciarBuscaPaciente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]); // Armazena os pacientes encontrados

  // Função que busca os pacientes na API
  const fetchPacientes = async (termoDeBusca) => {
    try {
      // Usa a nova rota, passando o termo de busca como query param
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

  // useEffect que é executado uma vez quando o componente é carregado
  // Isso faz com que a lista já apareça com TODOS os pacientes
  useEffect(() => {
    fetchPacientes(""); // Busca inicial (sem termo)
  }, []);

  // Função chamada quando o formulário de busca é enviado (Enter ou Botão)
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Impede o recarregamento da página
    fetchPacientes(searchTerm);
  };

  return (
    <div className="container-conteudo-admin">
      {" "}
      {/* Classe base do container */}
      {/* --- BARRA DE BUSCA --- */}
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
      {/* --- TABELA DE RESULTADOS --- */}
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
            {/* Mapeia os resultados do state e cria uma linha (tr) para cada um */}
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
              // Mensagem caso a busca não retorne nada
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