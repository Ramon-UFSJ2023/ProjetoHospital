import Btn from "../components/Button";

export default function EscolhaAcesso() {
  return(
    <div className="Page-Principal">
      <aside className="painel-Left">
        <header id="header-Painel">
          <h1 className="title" id="title-Left">Nome do Hospital</h1>
        </header>
        <div className="img-SVG">
          <img src="/assets/rheumatology-animate.svg" alt="" id="img-login-screen" />
        </div>
      </aside>

      <aside className="painel-Right">
        
        <div className="content">
          <div className="box-text-right">
            <h2 className="title-left">
              Olá! Por favor, escolha como quer acessar a plataforma
            </h2>
            <p className="text-right">
              Pacientes e médicos possuem formas de acesso diferentes. Escolha em relação ao exame que você deseja consultar.
            </p>
          </div>
          <Btn id="btn-paciente" icon="/assets/paciente.png" text="Paciente" />
          <Btn id="btn-funcionario" icon="/assets/doutora.png" text="Funcionários" />
        </div>

        <footer className="bottom">
          <p>@Copyright2026</p>
        </footer>
      </aside>
    </div>
  );
}
