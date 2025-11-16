import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getSessionData = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return { isAuthenticated: false, user: null };
  }
  
  try {
    return { isAuthenticated: true, user: JSON.parse(userString) };
  } catch (e) {
    console.error("Erro ao parsear dados do usuário:", e);
    localStorage.clear();
    return { isAuthenticated: false, user: null };
  }
};


const getUserHomePage = (user) => {
  if (!user) return '/'; 
  if (user.eh_admin) return '/page-func-adm';
  if (user.eh_medico) return '/page-medico';
  if (user.eh_enfermeiro) return '/page-enfermeiro';
  if (user.eh_paciente) return '/page-inicial-paciente';
  
  return '/'; 
};

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = getSessionData();

  let isAuthorized = false;

  if (isAuthenticated) {

    isAuthorized = requiredRoles.some(role => {
      if (role === 'paciente') return user.eh_paciente;
      if (role === 'medico') return user.eh_medico;
      if (role === 'enfermeiro') return user.eh_enfermeiro;
      if (role === 'admin') return user.eh_admin;
      if (role === 'funcionario') return user.eh_funcionario; 
      
      return false; 
    });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para acessar esta página. Redirecionando...");
      navigate('/');
      return;
    }

    if (!isAuthorized) {
      alert("Acesso negado. Você não tem permissão para esta página.");
      navigate(getUserHomePage(user)); 
    }
  }, [isAuthenticated, isAuthorized, navigate, user]); 

  if (isAuthenticated && isAuthorized) {
    return children;
  }

  return null; 
}

