import "../styles/login.css";
import { useState } from "react";
import ButtonCustom from "./ButtonCustomized";
import ButtonReturn from "./ButtonReturn";
import { useNavigate } from "react-router-dom";


export default function PageLogin({ title }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const goEscolhaAcesso = () => {navigate("/")};

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
          />
          <ButtonCustom
            size="larger"
            TypeText="strong"
            text="Continuar >"
            showImg="hidden"
          />
        </form>
      </div>
      <footer className="bottom">
        <p>@Copyright2026</p>
      </footer>
    </aside>
  );
}
