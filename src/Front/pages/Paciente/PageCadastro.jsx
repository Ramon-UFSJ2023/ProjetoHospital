import "./stylePaciente/cadastro.css";
import BtnCustomized from "../../components/Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PageCadastro() {
  const navigate = useNavigate();

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

  const formatarData = (dataJS) => {
    if (!dataJS) return null;
    const offset = dataJS.getTimezoneOffset();
    const dataLocal = new Date(dataJS.getTime() - offset * 60 * 1000);
    return dataLocal.toISOString().split("T")[0];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nomeCompleto = nome.split(" ");
    const primeiro_nome = nomeCompleto[0] || "";
    const sobrenome = nomeCompleto.slice(1).join(" ") || "";

    const cpfLimpo = cpf.replace(/\D/g, "");
    const cepLimpo = cep.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");

    const dataFormatada = formatarData(date);

    const dadosPaciente = {
      cpf: cpfLimpo,
      email: email,
      senha: password,
      genero: gender,
      data_nascimento: dataFormatada,
      primeiro_nome: primeiro_nome,
      sobrenome: sobrenome,
      rua: logradouro,
      cidade: cidade,
      bairro: bairro,
      numero: numero,
      cep: cepLimpo,
      telefone: telefoneLimpo,
    };

    try {
      const response = await fetch("http://localhost:3001/api/cadastro-paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosPaciente),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/page-inicial-paciente");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro de rede ou ao conectar com a API:", error);
      alert("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="container">
      <h1 className="Title">Cadastro Paciente</h1>

      <form className="page-cadastro" onSubmit={handleSubmit}>
        <main className="Input-cad" id="side-information-personal">
          <h1 className="title-group">Informações Pessoais</h1>

          <div className="inputs-groups">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              name="Nome"
              id="input-name"
              className="inputs"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="CPF">CPF</label>
            <input
              type="text"
              className="inputs-Cad-Fun"
              name="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              maxLength={14}
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="date-born">Data de Nascimento</label>
            <DatePicker
              selected={date}
              onChange={(newDate) => setDate(newDate)}
              className="inputs"
              placeholderText="DD/MM/YYYY"
              dateFormat="dd/MM/yyyy"
              showMonthDropdown
              scrollableMonthYearDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="Gender">Gênero</label>
            <select
              name="gender"
              id="gender"
              className="inputs gender-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Selecione seu Gênero</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div className="inputs-groups">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="text"
              className="inputs-Cad-Fun"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
              maxLength={15}
            />
          </div>
        </main>

        <main className="Input-cad" id="side-address">
          <h1 className="title-group">Endereço</h1>

          <div className="inputs-groups">
            <label htmlFor="cep">CEP</label>
            <input
              type="text"
              className="inputs-Cad-Fun"
              value={cep}
              id="cep"
              onChange={(e) => setCep(e.target.value)}
              placeholder="00000-000"
              onBlur={searchCep}
              required
              maxLength={9}
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="Estado">Estado</label>
            <input
              type="text"
              name="Estado"
              id="input-estado"
              className="inputs"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="Cidade">Cidade</label>
            <input
              type="text"
              name="Cidade"
              id="input-cidade"
              className="inputs"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="Bairro">Bairro</label>
            <input
              type="text"
              name="Bairro"
              id="input-bairro"
              className="inputs"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="Logradouro">Logradouro</label>
            <div className="logradouro-group">
              <input
                type="text"
                name="Logradouro"
                id="logradouro"
                className="inputs"
                placeholder="Rua"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                required
              />
              <input
                type="text"
                inputMode="numeric"
                name="Numero"
                className="inputs"
                placeholder="Nº"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={5}
                required
              />
            </div>
          </div>
        </main>

        <main className="side-login">
          <h1 className="title-group">Informações de Login</h1>

          <div className="inputs-groups">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="inputs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="inputs-groups">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              name="Senha-cliente"
              id="password"
              className="inputs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </main>
      </form>

      <BtnCustomized
        size="medium"
        TypeText="strong"
        text="Cadastre-se"
        showImg="hidden"
        onClick={handleSubmit}
      />
    </div>
  );
}
