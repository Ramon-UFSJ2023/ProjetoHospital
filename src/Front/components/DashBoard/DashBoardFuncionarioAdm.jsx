import "./dashboardFunAdm.css";
import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroFunByAdm";
import CadastroSala from "../ConteudosDashBoard/CadastroDeSalas";
import ListaPacientes from "../ConteudosDashBoard/ListaPacientes";
import ListaFuncionario from "../ConteudosDashBoard/ListaFuncionario.jsx";
import ListaConsultas from "../ConteudosDashBoard/ListaConsultas.jsx";
import ListaCirurgias from "../ConteudosDashBoard/ListaCirurgias.jsx";
import AlocacaoConsultorios from "../ConteudosDashBoard/AlocacaoConsultorios.jsx";

import PropTypes from "prop-types";

export default function DashBoardFuncionarioAdm({ stateNow, itens }) {
  const rendCont = () => {
    switch (stateNow) {
      case itens[0].label:
        return <ListaConsultas />;

      case itens[1].label:
        return <AlocacaoConsultorios />;

      case itens[2].label:
        return <ListaCirurgias />;

      case itens[3].label:
        return <ListaPacientes />;

      case itens[4].label: 
        return <ListaFuncionario />;
        
      case itens[5].label: 
        return <GerenciasCadastroAdm />;

      case itens[6].label: 
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
