import "./stylePaciente/dashBoardPaciente.css";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardPacienteImport from "../../components/DashBoard/DashBoard";
import { functionsPacienteNavBar } from "../../config/itemsSecondNavBar";
import { useState } from "react";

export default function DashBoardPaciente() {
  const [stateAtual, setStateAtual] = useState(
    functionsPacienteNavBar[0].label
  );
  const handleMenuClick = (label) => {
    setStateAtual(label);
  };

  return (
    <div className="container-dashboard-paciente">
      <UpperBar
        items={functionsPacienteNavBar}
        onMenuItemClick={handleMenuClick}
      />
      <DashBoardPacienteImport conteudo={stateAtual} itens={functionsPacienteNavBar}/>
    </div>
  );
}
