import LeftSide from "../../components/LeftSide";
import PageLogin from "../../components/PageLogin/PageLogin";
import "../../styles/index.css";

export default function PacienteLogin() {
  return (
    <div className="Page-Principal">
      <LeftSide />
      <PageLogin title="Login Paciente" showLinkCadastro={true} />
    </div>
  );
}
