import "./dashboard.css";
import PropTypes from "prop-types";


export default function DashBoard({ conteudo, itens }) {
  const rendCont = () => {
    switch (conteudo) {
      case itens[0].label:
        return <h1>Consultas</h1>;

      case itens[1].label:
        return <h1>Reservas</h1>;

      case itens[2].label:
        return <h1>Cirurgias</h1>;

      case itens[3].label:
        return <h1>Pacientes</h1>;

      default:
        return <h1>teste 2</h1>;
    }
  };
  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoard.propTypes = {
  conteudo: PropTypes.string,
};
