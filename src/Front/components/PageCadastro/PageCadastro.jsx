import "./cadastro.css";
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";

export default function PageCadastro() {
  const navigate = useNavigate();

  const goPageInicialPacient = () => {
    navigate("/page-inicial-paciente");
  };

  const [optionsEstados, setOptionsEstados] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);

  useEffect(() =>{
    const url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"

    fetch(url)
    .then(response => response.json())
    .then(data =>{
      if(Array.isArray(data)){
        const options = data.map((estado) =>({
          value: estado.sigla,
          label: `${estado.nome} (${estado.sigla})`,
        }));
        setOptionsEstados(options);
      }
    })
    .catch(error =>{
      console.log("Erro ao buscar estados", error);
    })
  }, []);

  return (
    <div className="container">
      <h1 className="Title">Cadastro Paciente</h1>

      <form className="page-cadastro" action="/cadastro" method="post">
        <main className="Input-cad" id="left-side-cad">
          <div className="inputs-groups">
            <label for="nome">Nome</label>
            <input type="text" name="Nome" id="input-name" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="CPF">CPF</label>
            <input type="number" name="Nome" id="input-cpf" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="date-born">Data de Nascimento</label>
            <input type="date" name="" id="input-date" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="text">Telefone</label>
            <input type="tel" name="Nome" id="input-name" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="Email">Email</label>
            <input type="text" name="" id="" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="password">Password</label>
            <input type="password" name="Senha-cliente" id="" className="inputs" />
          </div>
        </main>

        <main className="Input-cad" id="right-side-cad">
          <div className="inputs-groups">
            <label for="nome">Cidade</label>
            <input type="text" name="Nome" id="input-name" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="Bairro">Bairro</label>
            <input type="text" name="Nome" id="input-bairro" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="estado">Estados</label>
            <Select 
              id="estado"
              name="estado"
              options={optionsEstados}
              value={estadoSelecionado}
              onChange={setEstadoSelecionado}
              placeholder="Selecione um Estado"
              isLoading={optionsEstados.length===0}
              maxMenuHeight={220}
              classNamePrefix="custom-select"
            />
          </div>

          <div className="inputs-groups">
            <label for="text">Telefone</label>
            <input type="tel" name="Nome" id="input-name" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="Email">Email</label>
            <input type="text" name="" id="" className="inputs" />
          </div>

          <div className="inputs-groups">
            <label for="password">Password</label>
            <input type="password" name="Senha-cliente" id="" className="inputs" />
          </div>
        </main>
      </form>
      
      <BtnCustomized
        size="medium"
        TypeText="strong"
        text="Cadastre-se"
        showImg="hidden"
        onClick={goPageInicialPacient}
      />
    </div>
  );
}
