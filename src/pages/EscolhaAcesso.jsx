import Btn from "../components/Button";
import pacienteIcon from "../assets/paciente.png";
import FuncionarioIcon from "../assets/doutora.png";
import LeftSide from "../components/LeftSide";
import "../styles/index.css";

export default function EscolhaAcesso() {
  return (
    <div className="Page-Principal">
      <LeftSide />

      <aside className="painel-Right">
        <div className="content">
          <div className="box-text-right">
            <h2 className="title-left">
              Olá! Por favor, escolha como quer acessar a plataforma
            </h2>
            <p className="text-right">
              Pacientes e Funcionarios possuem formas de acesso diferentes.
              Escolha em relação ao exame que você deseja consultar.
            </p>
          </div>
          <Btn id="btn-paciente" icon={pacienteIcon} text="Paciente" />
          <Btn
            id="btn-funcionario"
            icon={FuncionarioIcon}
            text="Funcionários"
          />
        </div>

        <footer className="bottom">
          <p>@Copyright2026</p>
        </footer>
      </aside>
    </div>
  );
}
