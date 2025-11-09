import "./style/cadastroSalas.css";
import ImgSalaLeitos from "../../assets/salas_leitos.jpg";
import ImgLeitos from "../../assets/leitos.jpg";
import ImgLocal from "../../assets/localizacoes.jpg";
import ImgSalaCirurgia from "../../assets/salaCirurgia.jpg";
import ImgConsultorios from "../../assets/consultorios.png";
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useState } from "react";

export default function CadastroDeSalas() {
    const [typeCad, setTypeCad] = useState("");

  return (
    <div className="container-Cad-Sala">
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
          />
        </div>
        <div></div>

      </main>
    </div>
  );
}
