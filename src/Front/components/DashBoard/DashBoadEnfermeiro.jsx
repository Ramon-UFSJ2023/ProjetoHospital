import "./dashboardFunAdm.css";
// import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroFunByAdm";
// import CadastroSala from "../ConteudosDashBoard/CadastroDeSalas";
// import ListaPacientes from "../ConteudosDashBoard/ListaPacientes";
// import ListaFuncionario from "../ConteudosDashBoard/ListaFuncionario.jsx";
import ListaAlocacaoLeitos from "../ConteudosDashBoard/ListaAlocacaoLeitos.jsx";
import ListaCirurgias from "../ConteudosDashBoard/ListaCirurgias.jsx";
// import AlocacaoConsultorios from "../ConteudosDashBoard/AlocacaoConsultorios.jsx";

import PropTypes from "prop-types";

export default function DashBoardEnfermeiro({ stateNow, itens }) {
  const rendCont = () => {
    switch (stateNow) {
        case itens[0].label:
            return <ListaAlocacaoLeitos />;

        case itens[1].label:
            return <ListaCirurgias />;

        default:
            return <h1>teste</h1>;
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardEnfermeiro.propTypes = {
  stateNow: PropTypes.string,
};
