import LeftSide from "../components/LeftSide";
import pageLogin from "../components/pageLogin";
import "../styles/index.css";



export default function pacienteLogin(){
    return(
        <div className="Page-Principal">
            <LeftSide />
            <pageLogin />
        </div>
        
    );
}


