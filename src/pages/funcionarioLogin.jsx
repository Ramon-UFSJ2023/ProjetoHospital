import LeftSide from "../components/LeftSide";
import PageLogin from "../components/pageLogin";
import "../styles/index.css";

export default function pacienteLogin() {
  return (
    <div className="Page-Principal">
      <LeftSide />
      <PageLogin title="Login Funcionario" />
    </div>
  );
}