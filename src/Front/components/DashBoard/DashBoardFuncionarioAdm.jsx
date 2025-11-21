import "./dashboardFunAdm.css";
import GerenciasCadastroAdm from "../ConteudosDashBoard/GerenciasCadastroFunByAdm";
import CadastroSala from "../ConteudosDashBoard/CadastroDeSalas";
import ListaPacientes from "../ConteudosDashBoard/ListaPacientes";
import ListaFuncionario from "../ConteudosDashBoard/ListaFuncionario.jsx";
import ListaConsultas from "../ConteudosDashBoard/ListaConsultas.jsx";
import ListaCirurgias from "../ConteudosDashBoard/ListaCirurgias.jsx";
import GerenciadorAlocacoes from "../ConteudosDashBoard/GerenciadorAlocacoes.jsx";
import MarcarCirurgia from "../ConteudosDashBoard/MarcarCirurgia.jsx"; 

import PropTypes from "prop-types";

export default function DashBoardFuncionarioAdm({ stateNow, itens }) {
  const rendCont = () => {
    switch (stateNow) {
      case "Consultas":
        return <ListaConsultas />;

      case "Alocações": 
        return <GerenciadorAlocacoes />;

      case "Cirurgias":
        return <ListaCirurgias />;
      
      case "Marcar Cirurgia": 
        return <MarcarCirurgia />;

      case "Pacientes":
        return <ListaPacientes />;

      case "Funcionários": 
        return <ListaFuncionario />;
        
      case "Cadastrar Pacientes/Funcionários": 
        return <GerenciasCadastroAdm />;

      case "Salas": 
        return <CadastroSala />;

      default:
        return <h1 style={{textAlign:'center', padding:'50px'}}>Selecione uma opção no menu superior</h1>;
    }
  };

  return <div className="background-dashboard">{rendCont()}</div>;
}

DashBoardFuncionarioAdm.propTypes = {
  stateNow: PropTypes.string,
  itens: PropTypes.array,
};