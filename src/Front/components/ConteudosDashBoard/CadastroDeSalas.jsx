import "./style/cadastroSalas.css";
import ImgSalaLeitos from "../../assets/salas_leitos.jpg";
import ImgLeitos from "../../assets/leitos.jpg";
import ImgLocal from "../../assets/localizacoes.jpg";
import ImgSalaCirurgia from "../../assets/salaCirurgia.jpg";
import ImgConsultorios from "../../assets/consultorios.png";
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useState } from "react";

export default function CadastroDeSalas() {
  const [telaAtual, setTelaAtual] = useState("menu");

  const [blocoSalaLeito, setBlocoSalaLeito] = useState("");
  const [anexoSalaLeito, setAnexoSalaLeito] = useState("");
  const [andarSalaLeito, setAndarSalaLeito] = useState("");
  const [numeroSalaLeito, setNumeroSalaLeito] = useState("");
  const [tipoSalaLeito, setTipoSalaLeito] = useState("");

  const renderMenu = () => (
    <>
      <main className="LinesOptions">
        <div className="optionsCad">
          <img
            src={ImgSalaLeitos}
            alt=""
            srcset=""
            className="config-img-cad-sala"
          />
          <BtnCustomized
            size="small"
            TypeText="strong"
            text="Sala de Leitos"
            showImg="hidden"
            TypeBtn="button"
            onClick={() => setTelaAtual("sala-leitos")}
          />
        </div>

        <div className="optionsCad">
          <img src={ImgLeitos} alt="" className="config-img-cad-sala" />
          <BtnCustomized
            size="small"
            TypeText="strong"
            text="Leitos"
            showImg="hidden"
            TypeBtn="button"
            onClick={() => setTelaAtual("leitos")}
          />
        </div>

        <div className="optionsCad">
          <img
            src={ImgLocal}
            alt=""
            srcset=""
            className="config-img-cad-sala"
          />
          <BtnCustomized
            size="small"
            TypeText="strong"
            text="Localizações"
            showImg="hidden"
            TypeBtn="button"
            onClick={() => setTelaAtual("localizacoes")}
          />
        </div>
      </main>

      <main className="LinesOptions LineDown">
        <div></div>
        <div className="optionsCad">
          {" "}
          <img
            src={ImgSalaCirurgia}
            alt=""
            srcset=""
            className="config-img-cad-sala"
          />
          <BtnCustomized
            size="small"
            TypeText="strong"
            text="Sala Cirurgica"
            showImg="hidden"
            TypeBtn="button"
            onClick={() => setTelaAtual("sala-cirurgica")}
          />
        </div>

        <div className="optionsCad">
          <img
            src={ImgConsultorios}
            alt=""
            srcset=""
            className="config-img-cad-sala"
          />
          <BtnCustomized
            size="small"
            TypeText="strong"
            text="Consultorios"
            showImg="hidden"
            TypeBtn="button"
            onClick={() => setTelaAtual("Consultorios")}
          />
        </div>
        <div></div>
      </main>
    </>
  );

  const renderCadSalaLeitos = () => (
    <>
      <main className="container-cad-salas-leitos">
        <h1 className="title-group-cad-sala">Cadastro da Sala de Leitos</h1>
        <form action="" method="post" className="form-cad-sala-leitos">
          <div className="actions-cad-sala-leitos">
            <div className="cadastro-Sala-Leitos">
              <label htmlFor="">Bloco</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Sala-Leitos"
                value={blocoSalaLeito}
                onChange={(e) => setBlocoSalaLeito(e.target.value)}
                placeholder="Digite o Bloco Aqui"
              />
            </div>

            <div className="cadastro-Sala-Leitos">
              <label htmlFor="">Anexo</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Sala-Leitos"
                value={anexoSalaLeito}
                onChange={(e) => setAnexoSalaLeito(e.target.value)}
                placeholder="Digite o Anexo aqui"
              />
            </div>

            <div className="cadastro-Sala-Leitos">
              <label htmlFor="">Andar</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Sala-Leitos"
                value={andarSalaLeito}
                onChange={(e) => setAndarSalaLeito(e.target.value)}
                placeholder="Digite o Andar aqui"
              />
            </div>

            <div className="cadastro-Sala-Leitos">
              <label htmlFor="">Numero da Sala</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Sala-Leitos"
                value={numeroSalaLeito}
                onChange={(e) => setNumeroSalaLeito(e.target.value)}
                placeholder="Digite o Numero da Sala aqui"
              />
            </div>

            <div className="cadastro-Sala-Leitos">
              <label htmlFor="">Tipo de Leito</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Sala-Leitos"
                value={tipoSalaLeito}
                onChange={(e) => setTipoSalaLeito(e.target.value)}
                placeholder="Digite o tipo de Sala aqui"
              />
            </div>
          </div>

          <div className="form-actions-cad-sala-leitos">
            <BtnCustomized
              showImg="hidden"
              size="small"
              text="Cadastrar Sala"
              TypeText="strong"
              TypeBtn="button"
            />
          </div>
        </form>
      </main>
    </>
  );

  const renderConteudo = () => {
    switch (telaAtual) {
      case "sala-leitos":
        return renderCadSalaLeitos();

      case "leitos":
        return renderTelaLeitos();

      case "localizacoes":
        return (
          <div>
            <h1>teste localiza ai cuzao</h1>
          </div>
        );

      case "sala-cirurgia":
        return (
          <div>
            <h1>Vou te enfiar a peixeira</h1>
          </div>
        );

      case "consultorios":
        return renderTelaConsultorios();

      case "menu":
        return renderMenu();
      default:
        return renderMenu();
    }
  };

  const renderTelaLeitos = () => {
    <>
      <main className="container-cad-leitos">
        <h1 className="title-group-cad-sala">
          <form action="" className="form-cad-leito">
            <div className="actions-cad-leito">
              <h1 className="title-group-cad-leito"></h1>
              <div className="cadastro-leitos">
                <label htmlFor="">Bloco do Leito</label>
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Anexo do Leito</label>
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Andar do Leito</label>
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero da Sala</label>
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero do Leito</label>
              </div>
            </div>
          </form>
        </h1>
      </main>
    </>;
  };

  return <div className="container-Cad-Sala">{renderConteudo()}</div>;
}
