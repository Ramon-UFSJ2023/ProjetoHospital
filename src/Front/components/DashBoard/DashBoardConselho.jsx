import React from "react";
import "./dashboardFunAdm.css"; 
import RelatoriosConselho from "../ConteudosDashBoard/RelatoriosConselho";
import PropTypes from "prop-types";

export default function DashBoardConselho({ stateNow, itens }) {
  return (
    <div className="background-dashboard">
        <RelatoriosConselho tipoRelatorio={stateNow} />
    </div>
  );
}

DashBoardConselho.propTypes = {
  stateNow: PropTypes.string,
  itens: PropTypes.array,
};