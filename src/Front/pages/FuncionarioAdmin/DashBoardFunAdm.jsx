import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardFunAdmIm from "../../components/DashBoard/DashBoardFuncionarioAdm";
import { functionsPacienteNavBarAdm } from "../../config/itensSecondNavBarAdm";
import "./styleADM.css";
import { useState } from "react";

export default function DashBoardFunAdm() {
  const [stateAtual, setStateAtual] = useState(functionsPacienteNavBarAdm[0].label);

  const handleUpperBar = (label) =>{
    setStateAtual(label);
  };

  return (
    <div className="container-dashboard-funAdm">
      <UpperBar 
      items={functionsPacienteNavBarAdm} 
      onMenuItemClick={handleUpperBar}
      />
      <DashBoardFunAdmIm stateNow ={stateAtual} />
    </div>
  );
}
