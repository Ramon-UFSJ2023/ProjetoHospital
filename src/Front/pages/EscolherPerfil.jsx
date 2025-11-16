import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSide from '../components/LeftSide';
import BtnCustomized from '../components/Buttons/ButtonCustomized';
import '../styles/index.css'; 

import I_Admin from '../assets/I_Adiministrador.png'; 
import I_Medico from '../assets/I_Medico.png';
import I_Enfermeiro from '../assets/I_Enfermeiro.png';

export default function EscolherPerfil() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    
    if (!userString) {
      navigate('/'); 
      return;
    }

    const user = JSON.parse(userString);
    const availableDashboards = [];

    if (user.eh_admin) {
      availableDashboards.push({ 
        role: 'admin', 
        path: '/page-func-adm', 
        label: 'Administrador', 
        icon: I_Admin
      });
    }
    if (user.eh_medico) {
      availableDashboards.push({ 
        role: 'medico', 
        path: '/page-medico', 
        label: 'Médico', 
        icon: I_Medico
      });
    }
    if (user.eh_enfermeiro) {
      availableDashboards.push({ 
        role: 'enfermeiro', 
        path: '/page-enfermeiro', 
        label: 'Enfermeiro', 
        icon: I_Enfermeiro 
      });
    }
    
    if (availableDashboards.length <= 1) {
      navigate(availableDashboards[0]?.path || '/'); 
    } else {
      setDashboards(availableDashboards);
    }

  }, [navigate]);

  return (
    <div className="Page-Principal">
      <LeftSide />

      <aside className="painel-Right">
        <div className="content">
          <div className="box-text-right">
            <h2 className="title-left">
              Você possui múltiplos perfis.
            </h2>
            <p className="text-left text-left-rightside">
              Por favor, escolha como você quer acessar a plataforma.
            </p>
          </div>
          
          {dashboards.map(dash => (
            <BtnCustomized 
              key={dash.role}
              size="larger"
              variant="icon"
              TypeText="strong"
              text={`Entrar como ${dash.label}`}
              img={dash.icon} 
              onClick={() => navigate(dash.path)}
            />
          ))}

        </div>
        <footer className="bottom">
          <p>@Copyright2026</p>
        </footer>
      </aside>
    </div>
  );
}