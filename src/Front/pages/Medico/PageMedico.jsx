import "./styleMedico/dashBoardMedico.css";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardPacienteImport from "../../components/DashBoard/DashBoardPaciente";
import { functionsMedicoNavBar } from "../../config/itemsSecondNavBarMedico";
import { useState } from "react";

export default function DashBoardPaciente() {
  const [stateAtual, setStateAtual] = useState(
    functionsMedicoNavBar[0].label
  );
  const handleMenuClick = (label) => {
    setStateAtual(label);
  };

  console.log("State Atual:", stateAtual);

  return (
    <div className="container-dashboard-paciente">
      <UpperBar
        items={functionsMedicoNavBar}
        onMenuItemClick={handleMenuClick}
      />
      <DashBoardPacienteImport 
        stateNow={stateAtual} 
        itens={functionsMedicoNavBar}
      />
    </div>
  );
}