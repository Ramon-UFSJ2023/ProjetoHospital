import "./stylePaciente/dashBoardPaciente.css";
import React from "react";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoard from "../../components/DashBoard/DashBoard";
import { functionsPacienteNavBar } from "../../config/itemsSecondNavBar";

export default function DashBoardPaciente() {
  return (
    <div className="container-dashboard-paciente">
      <UpperBar items={functionsPacienteNavBar} />
      <DashBoard />
    </div>
  );
}
