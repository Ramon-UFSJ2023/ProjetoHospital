import PacienteLogin from "./pages/pacienteLogin";
import EscolheAcesso from "./pages/EscolhaAcesso";
import FuncionarioLogin from "./pages/funcionarioLogin";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EscolhaAcesso/ >} />
      <Route path="/login-paciente" element={<PacienteLogin/ >} />
      <Route path="/login-funcionario" element={<FuncionarioLogin/ >} />

    </Routes>
  );
}
