import React, { useState } from "react";
import "./style/cadastroSalas.css"; 
import BtnCustomized from "../Buttons/ButtonCustomized";
import ImgMedico from "../../assets/I_Medico.png";
import ImgEnfermeiro from "../../assets/I_Enfermeiro.png";
import ImgEscala from "../../assets/SalaLeitos.png"; 
import ImgAlocar from "../../assets/SalaLeito.png";  
import AlocacaoConsultorios from "./AlocacaoConsultorios";
import AlocarEnfermeiro from "./AlocarEnfermeiro";
import ListaAlocacaoLeitos from "./ListaAlocacaoLeitos";

export default function GerenciadorAlocacoes() {
  const [view, setView] = useState("menu"); 

  const renderMenuPrincipal = () => (
    <div className="container-conteudo-admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <h1 className="title-group-cad-sala" style={{ fontSize: '28px', marginBottom: '40px' }}>Gerenciamento de Alocações</h1>
      
      <div style={{ display: 'flex', gap: '60px' }}>
        <div className="optionsCad">
          <img 
            src={ImgMedico} 
            alt="Médicos" 
            className="config-img-cad-sala" 
            style={{ height: '200px', width: '200px', objectFit: 'contain', borderRadius: '20px', padding: '10px' }} 
          />
          <BtnCustomized 
            size="medium" 
            TypeText="strong" 
            text="Médicos (Consultórios)" 
            showImg="hidden" 
            TypeBtn="button" 
            onClick={() => setView("consultorios")} 
          />
        </div>

        <div className="optionsCad">
          <img 
            src={ImgEnfermeiro} 
            alt="Enfermeiros" 
            className="config-img-cad-sala" 
            style={{ height: '200px', width: '200px', objectFit: 'contain', borderRadius: '20px', padding: '10px' }} 
          />
          <BtnCustomized 
            size="medium" 
            TypeText="strong" 
            text="Enfermeiros (Leitos)" 
            showImg="hidden" 
            TypeBtn="button" 
            onClick={() => setView("menu-enfermeiros")} 
          />
        </div>
      </div>
    </div>
  );

  const renderMenuEnfermeiros = () => (
    <div className="container-conteudo-admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
         <BtnCustomized size="small" TypeText="strong" text="< Voltar" showImg="hidden" TypeBtn="button" onClick={() => setView("menu")} />
      </div>

      <h1 className="title-group-cad-sala" style={{ fontSize: '28px', marginBottom: '40px' }}>Gestão de Escala (Enfermeiros)</h1>
      
      <div style={{ display: 'flex', gap: '60px' }}>
        <div className="optionsCad">
          <img 
            src={ImgEscala} 
            alt="Ver Escala" 
            className="config-img-cad-sala" 
            style={{ height: '180px', width: '180px', objectFit: 'contain' }} 
          />
          <BtnCustomized 
            size="medium" 
            TypeText="strong" 
            text="Ver Escala / Plantões" 
            showImg="hidden" 
            TypeBtn="button" 
            onClick={() => setView("lista-enfermeiros")} 
          />
        </div>

        <div className="optionsCad">
          <img 
            src={ImgAlocar} 
            alt="Nova Alocação" 
            className="config-img-cad-sala" 
            style={{ height: '180px', width: '180px', objectFit: 'contain', filter: 'hue-rotate(90deg)' }} 
          />
          <BtnCustomized 
            size="medium" 
            TypeText="strong" 
            text="Nova Alocação" 
            showImg="hidden" 
            TypeBtn="button" 
            onClick={() => setView("alocar-enfermeiro")} 
          />
        </div>
      </div>
    </div>
  );

  switch (view) {
    case "consultorios":
      return <AlocacaoConsultorios onBack={() => setView("menu")} />;
    
    case "menu-enfermeiros":
      return renderMenuEnfermeiros();

    case "lista-enfermeiros":
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 20px' }}>
                <BtnCustomized size="small" TypeText="strong" text="< Voltar" showImg="hidden" TypeBtn="button" onClick={() => setView("menu-enfermeiros")} />
            </div>
            <ListaAlocacaoLeitos />
        </div>
      );

    case "alocar-enfermeiro":
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '10px 20px' }}>
                    <BtnCustomized size="small" TypeText="strong" text="< Voltar" showImg="hidden" TypeBtn="button" onClick={() => setView("menu-enfermeiros")} />
                </div>
                <AlocarEnfermeiro onSuccess={() => setView("lista-enfermeiros")} /> 
            </div>
        );

    case "menu":
    default:
      return renderMenuPrincipal();
  }
}