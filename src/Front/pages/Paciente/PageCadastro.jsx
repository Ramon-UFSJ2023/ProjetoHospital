import "./stylePaciente/cadastro.css";
import BtnCustomized from "../../components/Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PageCadastro() {
  const navigate = useNavigate();

  const goPageInicialPacient = () => {
    navigate("/page-inicial-paciente");
  };
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
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
    <div className="container">
      <h1 className="Title">Cadastro Paciente</h1>

      <form className="page-cadastro" action="/cadastro" method="post">
        <main className="Input-cad" id="side-information-personal">
          <h1 className="title-group">Informações Pessoais</h1>
          <div className="inputs-groups">
            <label for="nome">Nome</label>
            <input
              type="text"
              name="Nome"
              id="input-name"
              className="inputs"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="inputs-groups">
            <label for="CPF">CPF</label>
            <input
              type="text"
              inputMode="numeric"
              name="Nome"
              id="input-cpf"
              className="inputs"
              maxLength={11}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Apenas numeros"
            />
          </div>

          <div className="inputs-groups">
            <label for="date-born">Data de Nascimento</label>
            <DatePicker
              selected={date}
              onChange={(newDate) => setDate(newDate)}
              className="inputs"
              placeholderText="DD/MM/YYYY"
              dateFormat="dd/mm/YYYY"
              showMonthDropdown
              scrollableMonthYearDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
            />
          </div>

          <div className="inputs-groups">
            <label for="Gender">Genêro</label>
            <select
              name=""
              id=""
              className="inputs gender-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Selecione seu gênero"
            >
              <option value="">Selecione seu Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          <div className="inputs-groups">
            <label for="text">Telefone</label>
            <input
              type="tel"
              name="Nome"
              id="input-name"
              className="inputs"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
        </main>

        <main className="Input-cad" id="side-address">
          <h1 className="title-group">Endereço</h1>

          <div className="inputs-groups">
            <label for="estado">CEP</label>
            <input
              type="text"
              name="CEP"
              id="CEP"
              value={cep}
              className="inputs"
              onChange={(e) => setCep(e.target.value)}
              placeholder="Digite seu CEP(apenas numeros)"
              onBlur={searchCep}
              maxLength={8}
            />
          </div>

          <div className="inputs-groups">
            <label for="Estado">Estado</label>
            <input
              type="text"
              name="Nome"
              id="input-estado"
              className="inputs"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            />
          </div>

          <div className="inputs-groups">
            <label for="Cidade">Cidade</label>

            <input
              type="text"
              name="Nome"
              id="input-cidade"
              className="inputs"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="inputs-groups">
            <label for="Bairro">Bairro</label>
            <input
              type="text"
              name="Bairro"
              id="input-name"
              className="inputs"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <div className="inputs-groups">
            <label for="Logradouro">Logradouro</label>
            <div className="logradouro-group">
              <input
                type="text"
                name="Logradouro"
                id=""
                className="inputs"
                placeholder="Rua"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
              />

              <input
                type="text"
                inputMode="numeric" // Melhora a experiência em celulares
                name="Numero"
                className="inputs"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={5}
              />
            </div>
          </div>
        </main>

        <main className="side-login">
          <h1 className="title-group">Informações de Login</h1>
          <div className="inputs-groups">
            <label for="Email">Email</label>
            <input
              type="text"
              name=""
              id=""
              className="inputs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="inputs-groups">
            <label for="password">Senha</label>
            <input
              type="password"
              name="Senha-cliente"
              id=""
              className="inputs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
