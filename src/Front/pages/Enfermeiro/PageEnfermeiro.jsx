import "./styleEnfermeiro/dashBoardEnfermeiro.css";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardEnfermeiroImport from "../../components/DashBoard/DashBoadEnfermeiro";
import { functionsEnfermeiroNavBar } from "../../config/itemsSecondNavBarEnfermeiro";
import { useState } from "react";

export default function DashBoardEnfermeiro() {
  const [stateAtual, setStateAtual] = useState(
    functionsEnfermeiroNavBar[0].label
  );
  const handleMenuClick = (label) => {
    setStateAtual(label);
  };

  console.log("State Atual:", stateAtual);

  return (
    <div className="container-dashboard-paciente">
      <UpperBar
        items={functionsEnfermeiroNavBar}
        onMenuItemClick={handleMenuClick}
      />
      <DashBoardEnfermeiroImport 
        stateNow={stateAtual} 
        itens={functionsEnfermeiroNavBar}
      />
    </div>
  );
}