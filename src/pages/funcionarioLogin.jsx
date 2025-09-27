import LeftSide from "../components/LeftSide";
import "../styles/index.css";
import PageLogin from "../components/PageLogin/PageLogin";

export default function FuncionarioLogin() {
  return (
    <div className="Page-Principal">
      <LeftSide />
      <PageLogin title="Login Funcionario" />
    </div>
  );
}
