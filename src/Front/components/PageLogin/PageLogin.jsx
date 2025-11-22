import "./login.css";
import { useState } from "react";
import ButtonCustom from "../Buttons/ButtonCustomized";
import ButtonReturn from "../Buttons/ButtonReturn";
import { useNavigate } from "react-router-dom";

export default function PageLogin({ title, showLinkCadastro }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const navigate = useNavigate();
  const goEscolhaAcesso = () => {
    navigate("/");
  };
  const goPageInicialPacient = () => {
    navigate("/page-inicial-paciente");
  };
  const goPageCadastroPaciente = () => {
    navigate("/page-cad-paciente");
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleRoleRedirect = (user) => {
    const dashboards = [];
    if (user.eh_admin) {
      dashboards.push({ role: 'admin', path: '/page-func-adm' });
    }
    if (user.eh_medico) {
      dashboards.push({ role: 'medico', path: '/page-medico' });
    }
    if (user.eh_enfermeiro) {
      dashboards.push({ role: 'enfermeiro', path: '/page-enfermeiro' });
    }

    if (user.eh_conselho) {
      dashboards.push({ role: 'conselho', path: '/page-conselho' });
    }
    
    if (dashboards.length > 1) {
      navigate('/escolher-perfil');
    } else if (dashboards.length === 1) {
      navigate(dashboards[0].path);
    } else {
      alert("Acesso negado. Seu perfil de funcionário não possui um dashboard associado.");
      logout();
      navigate('/login-funcionario'); 
    }
  };

  const TrySubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); 

    const userType = title === "Login Funcionario" ? "funcionario" : "paciente";
    const cpfLimpo = cpf.replace(/\D/g, ''); 

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpfLimpo,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
      } else {
        localStorage.setItem('token', data.token); 
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert(data.message);

        if (userType === 'paciente' && data.user.eh_paciente) {
          goPageInicialPacient();
        
        } else if (userType === 'funcionario' && data.user.eh_funcionario) {
          handleRoleRedirect(data.user);
        } else {
          alert("Acesso negado. Você não tem permissão para esta área.");
          logout();
        }
      }

    } catch (error) {
      console.error('Erro de rede ou ao conectar com a API:', error);
      alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }

    setIsLoading(false); 
  };

  return (
    <aside className="painel-Right">
      <div className="content">
        <div className="box-text-right">
          <h2 className="title-right" id="title-login">
            {title}
          </h2>
        </div>
        
        <div className="Section-Bottom-Right-Side">
          <ButtonReturn text="<" onClick={goEscolhaAcesso} />
          <form onSubmit={TrySubmit} style={{ display: 'contents' }}>
            <label htmlFor="cpfInput" className="Info-Login">
                CPF
            </label>
            <input
                type="text"
                id="cpfInput"
                className="input-right-side"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite seu CPF (apenas números)"
                required
            />
            
            <label htmlFor="passwordInput" className="Info-Login">
                Senha
            </label>
            <input
                type="password"
                id="passwordInput"
                className="input-right-side"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
            />
            
            <ButtonCustom
                size="larger"
                TypeText="strong"
                text={isLoading ? "Carregando..." : "Continuar >"}
                showImg="hidden"
                TypeBtn="submit" 
                disabled={isLoading} 
            />
          </form>

          {showLinkCadastro && (
            <h1 className="link-cad">
              Não está cadastrado?{" "}
              <a
                className="link-cad"
                id="direction-login"
                onClick={goPageCadastroPaciente}
                style={{ cursor: 'pointer' }}
              >
                Cadastre-se
              </a>
            </h1>
          )}
        </div>
      </div>
      <footer className="bottom">
        <p>@Copyright2026</p>
      </footer>
    </aside>
  );
}