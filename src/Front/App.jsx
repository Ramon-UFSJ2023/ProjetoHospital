import EscolheAcesso from "./pages/EscolhaAcesso";
import PacienteLogin from "./pages/Paciente/PacienteLogin";
import DashBoardPaciente from "./pages/Paciente/DashBoardPaciente";
import TelaFuncionarioAdmin from "./pages/FuncionarioAdmin/TelaFuncionarioAdmin";
import FuncionarioLogin from "./pages/Funcionario/FuncionarioLogin";
import PageCadastro from "./pages/Paciente/PageCadastro";
import TelaMedico from "./pages/Medico/PageMedico";
import TelaEnfermeiro from "./pages/Enfermeiro/PageEnfermeiro";
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";
import ProtectedRoute from "./components/ProtectedRoute"; 
import EscolherPerfil from "./pages/EscolherPerfil"; 
import ConfiguracoesConta from "./pages/ConfiguracoesConta";

export default function App() {
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