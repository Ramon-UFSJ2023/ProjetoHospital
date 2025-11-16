import React, { useState, useEffect } from "react";
import "./style/listaPaciente.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";

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
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      alert("Sessão não encontrada. Redirecionando para o login.");
      navigate('/');
    }
  }, [navigate]);

  const fetchConsultas = async (termoDeBusca) => {
    if (!user || !token) return; 

    const ehAdmin = user.eh_admin;
    const baseUrl = ehAdmin 
      ? `http://localhost:3001/api/admin/buscar-consultas`
      : `http://localhost:3001/api/paciente/minhas-consultas`;
      
    const url = `${baseUrl}?busca=${termoDeBusca}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await response.json();

      if (response.ok) {
        setResultados(data);
      } else {
        alert(data.message || "Erro ao buscar consultas.");
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/'); 
        }
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchConsultas(""); 
    }
  }, [user, token]); 

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchConsultas(searchTerm);
  };

  const placeholder = user?.eh_admin 
    ? "Buscar por Paciente, Médico ou CPF..."
    : "Buscar por Médico ou CPF do Médico...";

  const ehAdminView = user?.eh_admin;

  return (
    <div className="container-conteudo-admin">
      <form className="busca-container" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="inputs-Cad-Fun" 
          placeholder={placeholder} 
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
              {ehAdminView && <th>Paciente</th>} 
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
                <tr key={consulta.CPF_P + consulta.Numero}>
                  
                  {ehAdminView && <td>{consulta.nome_paciente}</td>}
                  
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
                <td colSpan={ehAdminView ? 7 : 6} style={{ textAlign: "center" }}>
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