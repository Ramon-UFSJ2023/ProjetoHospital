import "./stylePaciente/dashBoardPaciente.css";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardPacienteImport from "../../components/DashBoard/DashBoardPaciente";
import { functionsPacienteNavBar } from "../../config/itemsSecondNavBarPaciente";
import { useState } from "react";

export default function DashBoardPaciente() {
  const [stateAtual, setStateAtual] = useState(
    functionsPacienteNavBar[0].label
  );
  const handleMenuClick = (label) => {
    setStateAtual(label);
  };

  console.log("State Atual:", stateAtual);

  return (
    <div className="container-dashboard-paciente">
      <UpperBar
        items={functionsPacienteNavBar}
        onMenuItemClick={handleMenuClick}
      />
      <DashBoardPacienteImport 
        stateNow={stateAtual} 
        itens={functionsPacienteNavBar}
        onNavigateClick={handleMenuClick} 
      />
    </div>
  );
}