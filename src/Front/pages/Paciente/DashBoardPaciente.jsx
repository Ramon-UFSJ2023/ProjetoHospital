import "./stylePaciente/dashBoardPaciente.css";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardPaciente from "../../components/DashBoard/DashBoard";
import { functionsPacienteNavBar } from "../../config/itemsSecondNavBar";

export default function DashBoardPaciente() {
  return (
    <div className="container-dashboard-paciente">
      <UpperBar items={functionsPacienteNavBar} />
      <DashBoardPaciente />
    </div>
  );
}
