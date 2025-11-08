import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoard from "../../components/DashBoard/DashBoard";
import { functionsPacienteNavBarAdm } from "../../config/itensSecondNavBarAdm";
import "./styleADM.css"

export default function DashBoardFunAdm() {
  return (
    <div className="container-dashboard-funAdm">
      <UpperBar items={functionsPacienteNavBarAdm} />
      <DashBoard />
    </div>
  );
}
