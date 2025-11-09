import React from "react";
import "./style/GerenciasCadastro.css";
import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import BtnCustomized from "../Buttons/ButtonCustomized";
import CurrencyInput from "react-currency-input-field";
import { InputMask } from "@react-input/mask";

export default function GerenciarCadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [salario, setSalario] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [typeCad, setTypeCad] = useState("medico");
  const today = new Date();

  const min18Years = new Date(
    today.getFullYear() - 20,
    today.getMonth(),
    today.getDate()
  );

  const handleSubmit = (event) => {
    // 1. Impede que o formulário recarregue a página
    event.preventDefault();

    // 2. Mostra no console que funcionou
    console.log("Formulário enviado!");

    // 3. (Opcional) Mostra todos os dados que o formulário coletou
    console.log({
      nome,
      cpf,
      cep,
      salario,
      cidade,
      estado,
      bairro,
      logradouro,
      numero,
      gender,
      email,
      date,
      telefone,
      password,
    });
  };

  const searchCep = (event) => {
    const cepValue = event.target.value.replace(/\D/g, "");
    if (cepValue.length !== 8) {
      return;
    }
    fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          alert("CEP não encontrado. ");
        } else {
          setCidade(data.localidade);
          setBairro(data.bairro);
          setEstado(data.uf);
          setLogradouro(data.logradouro);
        }
      })
      .catch((error) => {
        console.log("Erro ao buscar o CEP", error);
        alert("Erro ao consultar o CEP.");
      });
  };

  return (
    <div className="container-conteudo-cadastro">
      <form action="" method="post" className="form-cad-fun">
        <div className="form-sections">
          <section className="sections-cad">
            <h1 className="title-group">Informações Pessoais</h1>
            <div className="input-groups-CadFun">
              <label htmlFor="Nome">Nome</label>
              <input
                type="text"
                name=""
                id=""
                className="inputs-Cad-Fun"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="CPF">CPF</label>
              <InputMask
                className="inputs-Cad-Fun"
                name="cpf"
                replacement={{ 0: /\d/ }}
                mask="000.000.000-00"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="date-born">Data de Nascimento</label>
              <DatePicker
                selected={date}
                onChange={(newDate) => setDate(newDate)}
                className="inputs-Cad-Fun"
                placeholderText="DD/MM/YYYY"
                dateFormat="dd/mm/YYYY"
                showMonthDropdown
                scrollableMonthYearDropdown
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                maxDate={min18Years}
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="gender">Genero</label>
              <select
                name=""
                id=""
                className="inputs-Cad-Fun gender-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Selecione seu Gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="">Telefone</label>
              <InputMask
                className="inputs-Cad-Fun"
                name="telefone"
                mask="(99) 99999-9999"
                replacement={{ 9: /\d/ }}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </section>

          <section className="sections-cad">
            <h1 className="title-group">Endereço</h1>

            <div className="input-groups-CadFun">
              <label for="estado">CEP</label>
              <InputMask
                className="inputs-Cad-Fun"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                mask="99999-999"
                replacement={{ 9: /\d/ }}
                placeholder="00000-000"
                onBlur={searchCep}
              />
            </div>

            <div className="input-groups-CadFun">
              <label for="Estado">Estado</label>
              <input
                type="text"
                name="Nome"
                id="input-estado"
                className="inputs-Cad-Fun"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              />
            </div>

            <div className="input-groups-CadFun">
              <label for="Cidade">Cidade</label>

              <input
                type="text"
                name="Nome"
                id="input-cidade"
                className="inputs-Cad-Fun"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>

            <div className="input-groups-CadFun">
              <label for="Bairro">Bairro</label>
              <input
                type="text"
                name="Bairro"
                id="input-name"
                className="inputs-Cad-Fun"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>

            <div className="input-groups-CadFun">
              <label for="Logradouro">Logradouro</label>
              <div className="logradouro-group">
                <input
                  type="text"
                  name="Logradouro"
                  id=""
                  className="inputs-Cad-Fun"
                  placeholder="Rua"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                />

                <input
                  type="text"
                  inputMode="numeric" // Melhora a experiência em celulares
                  name="Numero"
                  className="inputs-Cad-Fun"
                  placeholder="Nº"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  maxLength={5}
                />
              </div>
            </div>
          </section>

          <section className="sections-cad">
            <h1 className="title-group">Informações de Login</h1>
            <div className="input-groups-CadFun">
              <label for="Email">Email</label>
              <input
                type="email"
                name=""
                id=""
                className="inputs-Cad-Fun"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-groups-CadFun">
              <label for="password">Senha</label>
              <input
                type="password"
                name="Senha-cliente"
                id=""
                className="inputs-Cad-Fun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {typeCad === "medico" && (
              <>
                <h1 className="title-group">Informações Adicionais</h1>
                <div className="input-groups-CadFun">
                  <label htmlFor="">Salario</label>
                  <CurrencyInput
                    id="salario"
                    className="inputs-Cad-Fun"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    prefix="R$ "
                    groupSeparator="."
                    decimalSeparator=","
                    value={salario}
                    onValueChange={(value, salario) => setSalario(value)}
                  />
                </div>
              </>
            )}
            ;
          </section>
        </div>

        <div className="form-actions">
          <div className="action-group-left">
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Paciente"
              showImg="hidden"
              onClick={setTypeCad("paciente")}
            />
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Medico"
              showImg="hidden"
              onClick={setTypeCad("Medico")}
            />
          </div>
          <div className="action-group-right">
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Cadastrar"
              showImg="hidden"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
