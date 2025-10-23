import pacienteIcon from "../assets/paciente.png";
import funcionarioIcon from "../assets/doutora.png";
import LeftSide from "../components/LeftSide";
import "../styles/index.css";
import BtnCustomized from "../components/Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";

export default function EscolhaAcesso() {
  const navigate = useNavigate();
  const goPacienteLogin = () => {
    navigate("/login-paciente");
  };
  const goFuncionarioLogin = () => {
    navigate("/login-funcionario");
  };

  return (
    <div className="Page-Principal">
      <LeftSide />

      <aside className="painel-Right">
        <div className="content">
          <div className="box-text-right">
            <h2 className="title-left">
              Olá! Por favor, escolha como quer acessar a plataforma
            </h2>
            <p className="text-left text-left-rightside">
              Pacientes e Funcionarios possuem formas de acesso diferentes.
              Escolha em relação ao exame que você deseja consultar.
            </p>
          </div>
          <BtnCustomized
            size="larger"
            variant="icon"
            TypeText="strong"
            text="Paciente"
            img={pacienteIcon}
            onClick={goPacienteLogin}
          />

          <BtnCustomized
            size="larger"
            variant="icon"
            TypeText="strong"
            text="Funcionário"
            img={funcionarioIcon}
            onClick={goFuncionarioLogin}
          />
        </div>
        <footer className="bottom">
          <p>@Copyright2026</p>
        </footer>
      </aside>
    </div>
  );
}
