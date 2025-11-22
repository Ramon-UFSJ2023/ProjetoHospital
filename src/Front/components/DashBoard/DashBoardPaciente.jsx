import "./dashboardFunAdm.css";
import ListaConsultas from "../ConteudosDashBoard/ListaConsultas.jsx";
import ListaCirurgias from "../ConteudosDashBoard/ListaCirurgias.jsx";
import MarcarConsulta from "../ConteudosDashBoard/MarcarConsulta.jsx"; 
import MarcarCirurgia from "../ConteudosDashBoard/MarcarCirurgia.jsx"; 
import ListaInternacoes from "../ConteudosDashBoard/ListaInternacoes.jsx";
import PropTypes from "prop-types";

export default function DashBoardPaciente({ stateNow, itens, onNavigateClick = () => {} }) {
  const rendCont = () => {
    switch (stateNow) {
        case "Consultas": 
             return <ListaConsultas onNavigateClick={onNavigateClick} />;
        
        case itens[0].label: 
            return <ListaConsultas onNavigateClick={onNavigateClick} />;

        case "Cirurgias":
            return <ListaCirurgias />;

        case "Marcar Consulta":
            return <MarcarConsulta />;

        case "Marcar Cirurgia": 
            return <MarcarCirurgia />;

        case "Internações":
            return <ListaInternacoes />;

        default:
             if(stateNow === itens[1]?.label) return <ListaCirurgias />;
             if(stateNow === itens[2]?.label) return <MarcarConsulta />;
             return <h1>Selecione uma opção</h1>;
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardPaciente.propTypes = {
  stateNow: PropTypes.string,
  itens: PropTypes.array.isRequired,
  onNavigateClick: PropTypes.func, 
};