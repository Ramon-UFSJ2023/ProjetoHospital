import "./style/cadastroSalas.css";
import "./style/cadastroLeitos.css";
import ImgSalaLeitos from "../../assets/SalaLeitos.png";
import ImgLeitos from "../../assets/SalaLeito.png";
import ImgLocal from "../../assets/localidade.png";
import ImgSalaCirurgia from "../../assets/salaCirurgica.png";
import ImgConsultorios from "../../assets/consultorio.png";
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useState } from "react";

export default function CadastroDeSalas() {
  const [telaAtual, setTelaAtual] = useState("menu");

  const [bloco, setBloco] = useState("");
  const [anexo, setAnexo] = useState("");
  const [andar, setAndar] = useState("");
  const [numero, setNumero] = useState("");
  const [tipoSalaLeito, setTipoSalaLeito] = useState("");
  const [capacidadeSalaCirurgica, setCapacidadeSalaCirurgica] = useState("");
  const [numeroLeito, setNumeroLeito] = useState("");
  const [especialidadeConsultorio, setEspecialidadeConsultorio] = useState("");

  const renderConteudo = () => {
    switch (telaAtual) {
      case "sala-leitos":
        return renderCadSalaLeitos();

      case "leitos":
        return renderTelaLeitos();

      case "localizacoes":
        return renderTelaCadLocalizacao();

      case "sala-cirurgica":
        return renderTelaCadSalaCirurgica();

      case "Consultorios":
        return renderTelaConsultorios();

      case "menu":
        return renderMenu();
      default:
        return renderMenu();
    }
  };

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
            onChange={(e) => setTelaAtual(e.target.value)}
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
            onChange={(e) => setTelaAtual(e.target.value)}
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
            onChange={(e) => setTelaAtual(e.target.value)}
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
            onChange={(e) => setTelaAtual(e.target.value)}
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
            onChange={(e) => setTelaAtual(e.target.value)}
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
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
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
                value={anexo}
                onChange={(e) => setAnexo(e.target.value)}
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
                value={andar}
                onChange={(e) => setAndar(e.target.value)}
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
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
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
  const renderTelaLeitos = () => {
    return (
      <>
        <main className="container-cad-leitos">
          <h1 className="title-group-sala">Cadastro de Leito</h1>
          <form action="" className="form-cad-leito">
            <div className="actions-cad-leito">
              <div className="cadastro-leitos">
                <label htmlFor="">Bloco do Leito</label>
                <input
                  type="text"
                  className="inputs-Cad-Leitos"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  placeholder="Digite o Bloco Aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Anexo do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={anexo}
                  onChange={(e) => setAnexo(e.target.value)}
                  placeholder="Digite o Anexo aqui"
                />
              </div>

              <div className="cadastro-leitos">
                <label htmlFor="">Andar do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  placeholder="Digite o Andar aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero da Sala</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Digite o Numero da Sala aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={numeroLeito}
                  onChange={(e) => setNumeroLeito(e.target.value)}
                  placeholder="Digite o Numero do Leito aqui"
                />
              </div>
            </div>
            <div className="form-actions-cad-leito">
              <BtnCustomized
                showImg="hidden"
                size="small"
                text="Cadastrar Leito"
                TypeText="strong"
                TypeBtn="button"
              />
            </div>
          </form>
        </main>
      </>
    );
  };
  const renderTelaCadLocalizacao = () => {
    return (
      <>
        <main className="container-cad-leitos">
          <h1 className="title-group-sala">Cadastro de Localização</h1>
          <form action="" className="form-cad-leito">
            <div className="actions-cad-leito">
              <div className="cadastro-leitos">
                <label htmlFor="">Bloco do Leito</label>
                <input
                  type="text"
                  className="inputs-Cad-Leitos"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  placeholder="Digite o Bloco Aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Anexo do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={anexo}
                  onChange={(e) => setAnexo(e.target.value)}
                  placeholder="Digite o Anexo aqui"
                />
              </div>

              <div className="cadastro-leitos">
                <label htmlFor="">Andar do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  placeholder="Digite o Andar aqui"
                />
              </div>
            </div>

            <div className="form-actions-cad-leito">
              <BtnCustomized
                showImg="hidden"
                size="small"
                text="Cadastrar"
                TypeText="strong"
                TypeBtn="button"
              />
            </div>
          </form>
        </main>
      </>
    );
  };
  const renderTelaCadSalaCirurgica = () => {
    return (
      <>
        <main className="container-cad-leitos">
          <h1 className="title-group-sala">Cadastro Sala Cirurgica</h1>
          <form action="" className="form-cad-leito">
            <div className="actions-cad-leito">
              <div className="cadastro-leitos">
                <label htmlFor="">Bloco do Leito</label>
                <input
                  type="text"
                  className="inputs-Cad-Leitos"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  placeholder="Digite o Bloco Aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Anexo do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={anexo}
                  onChange={(e) => setAnexo(e.target.value)}
                  placeholder="Digite o Anexo aqui"
                />
              </div>

              <div className="cadastro-leitos">
                <label htmlFor="">Andar do Leito</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  placeholder="Digite o Andar aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero da Sala</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Digite o Numero da Sala aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Capacidade</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={capacidadeSalaCirurgica}
                  onChange={(e) => setCapacidadeSalaCirurgica(e.target.value)}
                  placeholder="Digite a Capacidade"
                />
              </div>
            </div>
            <div className="form-actions-cad-leito">
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
  };
  const renderTelaConsultorios = () => {
    return (
      <>
        <main className="container-cad-leitos">
          <h1 className="title-group-sala">Cadastro de Consultorio</h1>
          <form action="" className="form-cad-leito">
            <div className="actions-cad-leito">
              <div className="cadastro-leitos">
                <label htmlFor="">Bloco</label>
                <input
                  type="text"
                  className="inputs-Cad-Leitos"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  placeholder="Digite o Bloco Aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Anexo</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={anexo}
                  onChange={(e) => setAnexo(e.target.value)}
                  placeholder="Digite o Anexo aqui"
                />
              </div>

              <div className="cadastro-leitos">
                <label htmlFor="">Andar</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={andar}
                  onChange={(e) => setAndar(e.target.value)}
                  placeholder="Digite o Andar aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Numero</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Digite o Numero da Sala aqui"
                />
              </div>
              <div className="cadastro-leitos">
                <label htmlFor="">Especialidade</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className="inputs-Cad-Leitos"
                  value={especialidadeConsultorio}
                  onChange={(e) => setEspecialidadeConsultorio(e.target.value)}
                  placeholder="Digite a Especialiadade"
                />
              </div>
            </div>
            <div className="form-actions-cad-leito">
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
  };

  return <div className="container-Cad-Sala">{renderConteudo()}</div>;
}
