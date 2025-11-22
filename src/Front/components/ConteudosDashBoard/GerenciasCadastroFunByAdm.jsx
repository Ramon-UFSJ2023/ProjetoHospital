import React, { useState, useEffect } from "react";
import "./style/GerenciasCadastro.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BtnCustomized from "../Buttons/ButtonCustomized";
import CurrencyInput from "react-currency-input-field";
import Select from 'react-select'; 

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
  const [admin, setAdmin] = useState(0); 
  const [conselho, setConselho] = useState(0); 
  const [cargaHoraria, setCargaHoraria] = useState(40);
  const [especialidadesOptions, setEspecialidadesOptions] = useState([]);
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState([]);
  const [crm, setCrm] = useState("");
  const [cofen, setCofen] = useState("");
  const [formacao, setFormacao] = useState("Graduado em Enfermagem");
  const today = new Date();

  const min18Years = new Date(
    today.getFullYear() - 20,
    today.getMonth(),
    today.getDate()
  );

  const formatarData = (dataJS) => {
    if (!dataJS) return null;
    const offset = dataJS.getTimezoneOffset();
    const dataLocal = new Date(dataJS.getTime() - (offset * 60 * 1000));
    return dataLocal.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/especialidades')
        .then(res => res.json())
        .then(data => {
            const options = data.map(esp => ({ value: esp.Nome, label: esp.Nome }));
            setEspecialidadesOptions(options);
        })
        .catch(err => console.error("Erro ao carregar especialidades", err));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Enviando cadastro para o tipo:", typeCad);

    const nomeCompleto = nome.split(' ');
    const primeiro_nome = nomeCompleto[0] || '';
    const sobrenome = nomeCompleto.slice(1).join(' ') || '';

    const cpfLimpo = cpf.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const dataFormatada = formatarData(date);
    
    const salarioNumerico = typeCad !== 'paciente' ? (parseFloat(salario) || 0.0) : 0.0;

    const listaEspecialidades = especialidadesSelecionadas.map(item => item.value);

    const dadosGerais = {
      typeCad: typeCad, 
      
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

      salario: salarioNumerico,
      eh_admin: admin,
      eh_conselho: conselho,
      carga_horaria: cargaHoraria,

      crm: crm,
      especialidades: listaEspecialidades, 

      cofen: cofen,
      formacao: formacao
    };

    try {
      const response = await fetch('http://localhost:3001/api/admin/cadastro-geral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosGerais),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); 
        setNome("");
        setCpf("");
        setEmail("");
        setEspecialidadesSelecionadas([]);
        //Ia caçar limpar todos os campo mas acho que nem precisava
      } else {
        alert(data.message); 
      }

    } catch (error) {
      console.error('Erro de rede ou ao conectar com a API:', error);
      alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
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
      <form className="form-cad-fun" onSubmit={handleSubmit}>
        <div className="form-sections">
          <section className="sections-cad side-information-personal-func">
            <h1 className="title-group-func">Informações Pessoais</h1>
            <div className="input-groups-CadFun">
              <label htmlFor="Nome">Nome Completo</label>
              <input
                type="text"
                name="Nome"
                id="Nome"
                className="inputs-Cad-Fun"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="CPF">CPF</label>
              <input
                type="text"
                className="inputs-Cad-Fun"
                name="cpf"
                id="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                maxLength={14}
                required
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="date-born">Data de Nascimento</label>
              <DatePicker
                selected={date}
                onChange={(newDate) => setDate(newDate)}
                className="inputs-Cad-Fun"
                placeholderText="DD/MM/YYYY"
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                scrollableMonthYearDropdown
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                maxDate={typeCad === 'paciente' ? new Date() : min18Years} 
                required
              />
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="gender">Gênero</label>
              <select
                name="gender"
                id="gender"
                className="inputs-Cad-Fun gender-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="input-groups-CadFun">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="text"
                className="inputs-Cad-Fun"
                name="telefone"
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
              />
            </div>
          </section>

          <section className="sections-cad">
            <h1 className="title-group-func">Endereço</h1>
            <div className="input-groups-CadFun">
              <label htmlFor="cep">CEP</label>
              <input
                type="text"
                className="inputs-Cad-Fun"
                value={cep}
                id="cep"
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                onBlur={searchCep}
                maxLength={9}
                required
              />
            </div>
            <div className="input-groups-CadFun">
              <label htmlFor="Estado">Estado</label>
              <input
                type="text"
                name="Estado"
                id="input-estado"
                className="inputs-Cad-Fun"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              />
            </div>
            <div className="input-groups-CadFun">
              <label htmlFor="Cidade">Cidade</label>
              <input
                type="text"
                name="Cidade"
                id="input-cidade"
                className="inputs-Cad-Fun"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
            </div>
            <div className="input-groups-CadFun">
              <label htmlFor="Bairro">Bairro</label>
              <input
                type="text"
                name="Bairro"
                id="input-bairro"
                className="inputs-Cad-Fun"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </div>
            <div className="input-groups-CadFun">
              <label htmlFor="Logradouro">Logradouro</label>
              <div className="logradouro-group">
                <input
                  type="text"
                  name="Logradouro"
                  id="logradouro"
                  className="inputs-Cad-Fun"
                  placeholder="Rua"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  required
                />
                <input
                  type="text"
                  inputMode="numeric"
                  name="Numero"
                  className="inputs-Cad-Fun"
                  placeholder="Nº"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
            </div>
          </section>

          <section className="sections-cad">
            <h1 className="title-group-func">Informações de Login</h1>
            <div className="input-groups-CadFun">
              <label htmlFor="Email">Email</label>
              <input
                type="email"
                name="Email"
                id="Email"
                className="inputs-Cad-Fun"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-groups-CadFun">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                name="Senha-cliente"
                id="password"
                className="inputs-Cad-Fun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {typeCad !== "paciente" && (
              <>
                <h1 className="title-group-func title-group-last-section">
                  Informações de Funcionário
                </h1>
                
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="salario" className="title-group-func-label">
                    Salário
                  </label>
                  <CurrencyInput
                    id="salario"
                    className="inputs-Cad-Fun"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    prefix="R$ "
                    groupSeparator="."
                    decimalSeparator=","
                    value={salario}
                    onValueChange={(value) => setSalario(value || "")}
                    required
                  />
                </div>
                
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="cargaHoraria" className="title-group-func-label">
                    Carga Horária (sem.)
                  </label>
                  <input
                    type="number"
                    id="cargaHoraria"
                    className="inputs-Cad-Fun"
                    value={cargaHoraria}
                    onChange={(e) => setCargaHoraria(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="Administrador" className="title-group-func-label">
                    É Administrador?
                  </label>
                  <select
                    id="Administrador"
                    value={admin}
                    onChange={(e) => setAdmin(Number(e.target.value))}
                    className="inputs-Cad-Fun gender-input"
                    required
                  >
                    <option value={0}>Não</option>
                    <option value={1}>Sim</option>
                  </select>
                </div>
                
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="Conselho" className="title-group-func-label">
                    É do Conselho?
                  </label>
                  <select
                    id="Conselho"
                    value={conselho}
                    onChange={(e) => setConselho(Number(e.target.value))}
                    className="inputs-Cad-Fun gender-input"
                    required
                  >
                    <option value={0}>Não</option>
                    <option value={1}>Sim</option>
                  </select>
                </div>
              </>
            )}

            {typeCad === "medico" && (
              <>
                <h1 className="title-group-func title-group-last-section">
                  Informações de Médico
                </h1>
                
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="Especialidade" className="title-group-func-label">
                    Especialidades
                  </label>
                  <Select
                    isMulti
                    name="especialidades"
                    options={especialidadesOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={especialidadesSelecionadas}
                    onChange={setEspecialidadesSelecionadas}
                    placeholder="Selecione..."
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: '20px',
                            border: 'none',
                            boxShadow: 'none',
                            backgroundColor: '#fca2a2',
                            minHeight: '40px'
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#9f2a2a',
                            borderRadius: '10px'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: 'white',
                        }),
                        multiValueRemove: (base) => ({
                            ...base,
                            color: 'white',
                            ':hover': {
                                backgroundColor: '#780606',
                                color: 'white',
                            },
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: '#ffebeb'
                        }),
                        input: (base) => ({
                            ...base,
                            color: 'white'
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 9999
                        })
                    }}
                  />
                </div>

                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="CRM" className="title-group-func-label">
                    CRM (ex: 123456-SP)
                  </label>
                  <input
                    type="text"
                    id="CRM"
                    className="inputs-Cad-Fun"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {typeCad === "enfermeiro" && (
              <>
                <h1 className="title-group-func title-group-last-section">
                  Informações de Enfermeiro
                </h1>
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="Formacao" className="title-group-func-label">
                    Formação
                  </label>
                  <select
                    id="Formacao"
                    className="inputs-Cad-Fun gender-input"
                    value={formacao}
                    onChange={(e) => setFormacao(e.target.value)}
                    required
                  >
                    <option value="Graduado em Enfermagem">Graduado em Enfermagem</option>
                    <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                  </select>
                </div>
                <div className="input-groups-CadFun class-div-salario">
                  <label htmlFor="COFEN" className="title-group-func-label">
                    COFEN (ex: 123456-BA)
                  </label>
                  <input
                    type="text"
                    id="COFEN"
                    className="inputs-Cad-Fun"
                    value={cofen}
                    onChange={(e) => setCofen(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

          </section>
        </div>

        <div className="form-actions">
          <div className="action-group-left">
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Paciente"
              showImg="hidden"
              onClick={() => setTypeCad("paciente")}
              TypeBtn="button"
              className={typeCad === 'paciente' ? 'active-type' : ''} 
            />
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Medico"
              showImg="hidden"
              onClick={() => setTypeCad("medico")}
              TypeBtn="button"
              className={typeCad === 'medico' ? 'active-type' : ''} 
            />
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Enfermeiro"
              showImg="hidden"
              onClick={() => setTypeCad("enfermeiro")}
              TypeBtn="button"
              className={typeCad === 'enfermeiro' ? 'active-type' : ''} 
            />
          </div>
          <div className="action-group-right">
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Cadastrar"
              showImg="hidden"
              TypeBtn="submit"
            />
          </div>
        </div>
      </form>
    </div>
  );
}