import "./dashboardFunAdm.css";
import GerenciarCad from "../ConteudosDashBoard/GerenciasCadastroAdm";
import PropTypes from "prop-types";

export default function DashBoardFuncionarioAdm(stateNow){
  const rendCont=()=>{
    switch (stateNow) {
      case "Cadastrar":
        return <GerenciarCad />
        break;
    
      default:
        break;
    }
  }

  return (
  <div className="background-dashboard">
    {rendCont()}
  </div>);
}

DashBoardFuncionarioAdm.propTypes = {
  stateNow: PropTypes.string,
};