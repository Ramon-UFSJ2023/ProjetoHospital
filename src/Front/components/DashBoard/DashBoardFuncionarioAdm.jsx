import "./dashboardFunAdm.css";
import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroFunByAdm";
import CadastroSala from "../ConteudosDashBoard/CadastroDeSalas";
import ListaPacientes from "../ConteudosDashBoard/ListaPacientes";
import PropTypes from "prop-types";

export default function DashBoardFuncionarioAdm({ stateNow, itens }) {
  const rendCont = () => {
    switch (stateNow) {
      case itens[0].label:
        return <h1>Consultas</h1>;

      case itens[1].label:
        return <h1>Reservas</h1>;

      case itens[2].label:
        return <h1>Cici</h1>

      case itens[3].label:
        return <ListaPacientes />;

      case itens[4].label: // Cadastrar Funcionarios ou pacientes
        return <GerenciasCadastroAdm />;

      case itens[5].label: //
        return <CadastroSala />;

      default:
        return <h1>teste</h1>;
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardFuncionarioAdm.propTypes = {
  stateNow: PropTypes.string,
};
