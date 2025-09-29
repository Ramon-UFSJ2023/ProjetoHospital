import "./stylePaciente/dashBoard.css"
import React from "react";
import UpperBar from "../../components/UpperBar/UpperBar";
import { functionsPacienteNavBar } from "../../config/itemsSecondNavBar";


export default function DashBoardPaciente(){

    return(
        <UpperBar items = {functionsPacienteNavBar}/>
    );
}