import "./dashboardFunAdm.css";
import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroAdm";
import PropTypes from "prop-types";

export default function DashBoardFuncionarioAdm({stateNow}){
  const rendCont=()=>{
    switch (stateNow) {
      case "Consultas":
      case "Cadastrar":
        return <GerenciasCadastroAdm />;
    
      default:
        return <h1>teste</h1>
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardFuncionarioAdm.propTypes = {
  stateNow: PropTypes.string,
};