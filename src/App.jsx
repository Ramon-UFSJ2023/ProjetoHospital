import PacienteLogin from "./pages/PacienteLogin";
import EscolheAcesso from "./pages/EscolhaAcesso";
import FuncionarioLogin from "./pages/PacienteLogin";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EscolheAcesso/ >} />
      <Route path="/login-paciente" element={<PacienteLogin/ >} />
      <Route path="/login-funcionario" element={<FuncionarioLogin/ >} />
    </Routes>
  );
}
