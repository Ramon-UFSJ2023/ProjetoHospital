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

  // --- NOVAS ROTAS DE REDIRECIONAMENTO ---
  const goPageDashBoardFunAdm = () => {
    navigate("/page-func-adm");
  };
  const goPageDashBoardMedico = () => {
    navigate("/page-medico"); // Rota para médicos
  };
  const goPageDashBoardEnfermeiro = () => {
    navigate("/page-enfermeiro"); // Rota para enfermeiros
  };
  const goPageDashBoardFuncionarioComum = () => {
    navigate("/page-funcionario-comum"); // Rota para funcionários comuns (não-admin, não-médico, não-enfermeiro)
  };
  // ----------------------------------------

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
        // Lógica de Paciente (sem mudanças)
        if (userType === 'paciente' && data.user.eh_paciente) {
          alert(data.message);
          goPageInicialPacient();
        
        // --- LÓGICA DE FUNCIONÁRIO ATUALIZADA ---
        } else if (userType === 'funcionario' && data.user.eh_funcionario) {
          
          alert(data.message); // Exibe a mensagem de sucesso "Login bem-sucedido"
          
          // Verifica os papéis em ordem de prioridade
          if (data.user.eh_admin) {
            goPageDashBoardFunAdm();
          
          } else if (data.user.eh_medico) {
            goPageDashBoardMedico();
          
          } else if (data.user.eh_enfermeiro) {
            goPageDashBoardEnfermeiro();
          
          } else {
            // Se não for admin, nem médico, nem enfermeiro, é "comum"
            goPageDashBoardFuncionarioComum();
          }
        
        // Tentativa de login no portal errado
        } else {
          alert("Acesso negado. Você não tem permissão para esta área.");
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
        <form className="Section-Bottom-Right-Side" onSubmit={TrySubmit}>
          <ButtonReturn text="<" onClick={goEscolhaAcesso} />
          <label htmlFor="cpfInput" className="Info-Login">
            CPF
          </label>
          <input
            type="text"
            name=""
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
            name=""
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
            type="submit" 
            disabled={isLoading} 
          />

          {showLinkCadastro && (
            <h1 className="link-cad">
              Não esta cadastrado?{" "}
              <a
                className="link-cad"
                id="direction-login"
                onClick={goPageCadastroPaciente}
              >
                Cadastre-se
              </a>
            </h1>
          )}
        </form>
      </div>
      <footer className="bottom">
        <p>@Copyright2026</p>
      </footer>
    </aside>
  );
}