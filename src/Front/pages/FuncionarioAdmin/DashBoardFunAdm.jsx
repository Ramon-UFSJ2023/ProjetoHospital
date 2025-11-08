import "./stylePaciente/dashBoardPaciente.css";
import React from "react";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoard from "../../components/DashBoard/DashBoard";
import { functionsPacienteNavBarAdm } from "../../config/itensSecondNavBarAdm";

export default function DashBoardPaciente() {
  return (
    <div className="container-dashboard-funAdm">
      <UpperBar items={functionsPacienteNavBarAdm} />
      <DashBoard />
    </div>
  );
}
