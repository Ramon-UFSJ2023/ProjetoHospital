import React, { useEffect } from "react";
import EscolheAcesso from "./pages/EscolhaAcesso";
import PacienteLogin from "./pages/Paciente/PacienteLogin";
import DashBoardPaciente from "./pages/Paciente/DashBoardPaciente";
import TelaFuncionarioAdmin from "./pages/FuncionarioAdmin/TelaFuncionarioAdmin";
import FuncionarioLogin from "./pages/Funcionario/FuncionarioLogin";
import PageCadastro from "./pages/Paciente/PageCadastro";
import TelaMedico from "./pages/Medico/PageMedico";
import TelaEnfermeiro from "./pages/Enfermeiro/PageEnfermeiro";
import TelaConselho from "./pages/Conselho/TelaConselho"; 
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";
import ProtectedRoute from "./components/ProtectedRoute"; 
import EscolherPerfil from "./pages/EscolherPerfil"; 
import ConfiguracoesConta from "./pages/ConfiguracoesConta";

export default function App() {
  //Tem que lembrar de apagar essa bomba akio
  useEffect(() => {
    const jaVerificado = localStorage.getItem("admin_padrao_verificado");
    if (jaVerificado) return;
        
    const criarAdminPadrao = async () => {
      const adminData = {
        typeCad: 'funcionario',
        cpf: '22222222222',
        email: 'admin@hospital.com', 
        senha: 'tatu',
        primeiro_nome: 'Admin',
        sobrenome: 'Sistema',
        genero: 'M',
        data_nascimento: '2000-01-01',
        rua: 'Rua do Hospital',
        numero: '100',
        bairro: 'Centro',
        cidade: 'São João Del Rei',
        cep: '36300000',
        telefone: '32999999999',
        salario: 10000.00,
        carga_horaria: 40,
        
        eh_admin: 1,     
        eh_conselho: 1,  

        crm: '',
        cofen: '',
        especialidades: [],
        formacao: ''
      };

      try {
        const response = await fetch('http://localhost:3001/api/admin/cadastro-geral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminData)
        });

        if (response.ok || response.status === 409) {
            localStorage.setItem("admin_padrao_verificado", "true");
        }

      } catch (error) {
        console.error("Deu pau:", error);
      }
    };

    criarAdminPadrao();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<EscolheAcesso />} />
      <Route path="/login-paciente" element={<PacienteLogin />} />
      <Route path="/login-funcionario" element={<FuncionarioLogin />} />
      <Route path="/page-cad-paciente" element={<PageCadastro />}/>

      <Route 
        path="/escolher-perfil"
        element={
          <ProtectedRoute requiredRoles={['funcionario']}>
            <EscolherPerfil />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/page-inicial-paciente" 
        element={
          <ProtectedRoute requiredRoles={['paciente']}> 
            <DashBoardPaciente />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/page-func-adm" 
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <TelaFuncionarioAdmin />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/page-medico" 
        element={
          <ProtectedRoute requiredRoles={['medico']}>
            <TelaMedico />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/page-enfermeiro" 
        element={
          <ProtectedRoute requiredRoles={['enfermeiro']}>
            <TelaEnfermeiro />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/page-conselho" 
        element={
          <ProtectedRoute requiredRoles={['conselho']}>
            <TelaConselho />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/configuracoes-conta"
        element={
          <ProtectedRoute>
            <ConfiguracoesConta />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}