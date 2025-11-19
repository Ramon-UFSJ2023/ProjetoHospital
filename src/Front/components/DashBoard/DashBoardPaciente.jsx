import "./dashboardFunAdm.css";
// import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroFunByAdm";
// import CadastroSala from "../ConteudosDashBoard/CadastroDeSalas";
// import ListaPacientes from "../ConteudosDashBoard/ListaPacientes";
// import ListaFuncionario from "../ConteudosDashBoard/ListaFuncionario.jsx";
import ListaConsultas from "../ConteudosDashBoard/ListaConsultas.jsx";
import ListaCirurgias from "../ConteudosDashBoard/ListaCirurgias.jsx";
import MarcarConsulta from "../ConteudosDashBoard/MarcarConsulta.jsx"; 
// import AlocacaoConsultorios from "../ConteudosDashBoard/AlocacaoConsultorios.jsx";

import PropTypes from "prop-types";

export default function DashBoardPaciente({ stateNow, itens, onNavigateClick = () => {} }) {
  const rendCont = () => {
    switch (stateNow) {
        case itens[0].label:
            return <ListaConsultas onNavigateClick={onNavigateClick} />;

        case itens[1].label:
            return <ListaCirurgias />;

        case itens[2].label:
            return <MarcarConsulta />;

        default:
            return <h1>teste</h1>;
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardPaciente.propTypes = {
  stateNow: PropTypes.string,
  itens: PropTypes.array.isRequired,
  onNavigateClick: PropTypes.func, 
};