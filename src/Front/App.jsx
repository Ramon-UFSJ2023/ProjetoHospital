import EscolheAcesso from "./pages/EscolhaAcesso";
import PacienteLogin from "./pages/Paciente/PacienteLogin";
import DashBoardPaciente from "./pages/Paciente/DashboardPaciente";
import FuncionarioLogin from "./pages/Funcionario/FuncionarioLogin";
import PageCadastro from "./pages/Paciente/PageCadastro";
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EscolheAcesso />} />
      <Route path="/login-paciente" element={<PacienteLogin />} />
      <Route path="/page-inicial-paciente" element={<DashBoardPaciente />} />
      <Route path="/login-funcionario" element={<FuncionarioLogin />} />
      <Route path="/page-cad-paciente" element={<PageCadastro />}/>
    </Routes>
  );
}
