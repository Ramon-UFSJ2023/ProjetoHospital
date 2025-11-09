import "./dashboard.css";
import PropTypes from "prop-types";

export default function DashBoard({ conteudo, itens}) {
  const rendCont = () => {
    switch (conteudo) {
      case "Consultas":
        return <h1>teste</h1>;

      default:
        return <h1>teste 2</h1>;
    }
  };
  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoard.propTypes = {
  conteudo: PropTypes.string,
};
