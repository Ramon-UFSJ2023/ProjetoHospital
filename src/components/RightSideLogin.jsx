import "../styles/login.css";
import { useState } from "react";


export default function RightSideLogin(title) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const TrySubmit = (event) => {
    event.preventDefault();
    console.log("Tentativa de lidar com:");
    console.log("CPF: ", cpf);
    console.log("Senha: ", password);
    //logica para envio ao banco
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
          <label htmlFor="cpfInput" className="Info-Login">
            CPF
          </label>
          <p className="text-Login">Insira o seu CPF aqui.Somente números.</p>
          <input
            type="text"
            name=""
            id="cpfInput"
            className="input-right-side"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <label htmlFor="passwordInput" className="Info-Login">
            Senha
          </label>
          <p className="text-Login">Insira sua Senha aqui.</p>
          <input
            type="password"
            name=""
            id="passwordInput"
            className="input-right-side"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          //refazer btn<Btn id="btn-login" icon={null} text="Continuar>"></Btn>

        </form>
      </div>
      <footer className="bottom">
        <p>@Copyright2026</p>
      </footer>
    </aside>
  );
}
