import LeftSide from "../components/LeftSide";
import "../styles/index.css";
import Pagelogin from "../components/PageLogin";


export default function PacienteLogin() {
  return (
    <div className="Page-Principal">
      <LeftSide />
      <Pagelogin title="Login Paciente" />
    </div>
  );
}
