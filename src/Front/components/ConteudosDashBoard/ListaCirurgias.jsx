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

export default function GerenciarBuscaCirurgia() {
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

  const fetchCirurgias = async (termoDeBusca) => {
    if (!user || !token) return; 

    const ehAdmin = user.eh_admin;
    const baseUrl = ehAdmin 
      ? `http://localhost:3001/api/admin/buscar-cirurgias`
      : `http://localhost:3001/api/paciente/minhas-cirurgias`;
      
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
        alert(data.message || "Erro ao buscar cirurgias.");
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
      fetchCirurgias(""); 
    }
  }, [user, token]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchCirurgias(searchTerm);
  };

  const placeholder = user?.eh_admin 
    ? "Buscar por Paciente, Médico(s) ou CPF..."
    : "Buscar por Médico(s)...";

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
                <tr key={cirurgia.CPF_P + cirurgia.Numero}> 
                  
                  {ehAdminView && <td>{cirurgia.nome_paciente}</td>}
                  
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
                <td colSpan={ehAdminView ? 7 : 6} style={{ textAlign: "center" }}>
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