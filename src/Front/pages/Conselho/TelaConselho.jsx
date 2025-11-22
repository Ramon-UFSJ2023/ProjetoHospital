import React, { useState, useEffect } from "react";
import UpperBar from "../../components/UpperBar/UpperBar";
import DashBoardConselho from "../../components/DashBoard/DashBoardConselho";
import { functionsConselhoNavBar } from "../../config/itemsSecondNavBarConselho";
import { useNavigate } from "react-router-dom";
import "../FuncionarioAdmin/styleADM.css"; 

export default function TelaConselho() {
  const [option, setOption] = useState("Visão Geral");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.eh_conselho) {
            alert("Acesso negado.");
            navigate('/');
        }
        setUser(parsedUser);
    } else {
        navigate('/');
    }
  }, [navigate]);

  const handleMenuClick = (label) => {
    setOption(label);
  };

  return (
    <div className="container-dashboard-funAdm">
      <UpperBar
        items={functionsConselhoNavBar}
        onMenuItemClick={handleMenuClick}
      />
      <DashBoardConselho stateNow={option} />
    </div>
  );
}