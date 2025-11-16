import React, { useState, useEffect } from "react";
import "./style/ListaPaciente.css";
import BtnCustomized from "../Buttons/ButtonCustomized";

const formatarMoeda = (valor) => {
  const valorNumerico = parseFloat(valor) || 0;
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function GerenciarBuscaFuncionario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);

  const fetchFuncionarios = async (termoDeBusca) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/buscar-funcionarios?busca=${termoDeBusca}`
      );
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar funcionários.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  useEffect(() => {
    fetchFuncionarios("");
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchFuncionarios(searchTerm);
  };

  return (
    <div className="container-conteudo-admin">
      <form className="busca-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="inputs-Cad-Fun" 
          placeholder="Buscar por Nome ou CPF do funcionário..."
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
              <th>Salário</th>
              <th>Cargo/Especialidade</th>
              <th>Admin</th>
              <th>Conselho</th>  
            </tr>
          </thead>
          <tbody>
            {resultados.length > 0 ? (
              resultados.map((func) => (
                <tr key={func.cpf}>
                  <td>
                    {func.primeiro_nome} {func.sobrenome}
                  </td>
                  <td>{func.cpf}</td>
                  <td>{func.email}</td>
                  <td>{formatarMoeda(func.Salario)}</td>
                  <td>{func.cargo}</td>
                  <td>{func.Eh_admin ? 'Sim' : 'Não'}</td>
                  <td>{func.Eh_Conselho ? 'Sim' : 'Não'}</td>        
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}