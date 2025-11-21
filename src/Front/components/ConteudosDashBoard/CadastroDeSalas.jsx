import "./style/cadastroSalas.css";
import "./style/cadastroLeitos.css";
import ImgSalaLeitos from "../../assets/SalaLeitos.png";
import ImgLeitos from "../../assets/SalaLeito.png";
import ImgLocal from "../../assets/localidade.png";
import ImgSalaCirurgia from "../../assets/salaCirurgica.png";
import ImgConsultorios from "../../assets/consultorio.png";
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useState, useEffect } from "react";
import ListaLocalizacoes from "./ListaLocalizacoes"; 
import ListaConsultorios from "./ListaConsultorios"; 
import ListaSalaCirurgia from "./ListaSalaCirurgia";
import ListaSalaLeitos from "./ListaSalaLeitos"; 
import ListaLeitos from "./ListaLeitos"; 

export default function CadastroDeSalas() {
  const [telaAtual, setTelaAtual] = useState("menu");
  

  const [subTelaLocalizacao, setSubTelaLocalizacao] = useState("menu");
  const [subTelaConsultorios, setSubTelaConsultorios] = useState("menu");
  const [subTelaSalaCirurgia, setSubTelaSalaCirurgia] = useState("menu");
  const [subTelaSalaLeitos, setSubTelaSalaLeitos] = useState("menu");
  const [subTelaLeitos, setSubTelaLeitos] = useState("menu"); 

  const [bloco, setBloco] = useState("");
  const [anexo, setAnexo] = useState("");
  const [andar, setAndar] = useState("");
  const [numero, setNumero] = useState("");
  
  const [tipoSalaLeito, setTipoSalaLeito] = useState("");
  const [capacidadeSalaCirurgica, setCapacidadeSalaCirurgica] = useState("");
  const [numeroLeito, setNumeroLeito] = useState("");
  const [especialidadeConsultorio, setEspecialidadeConsultorio] = useState("");

  const [listaLocalizacoes, setListaLocalizacoes] = useState([]);
  const [listaSalasLeito, setListaSalasLeito] = useState([]); 
  
  const [localizacaoSelecionadaString, setLocalizacaoSelecionadaString] = useState("");
  const [salaLeitoSelecionadaString, setSalaLeitoSelecionadaString] = useState(""); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const precisaLocalizacao = 
        (telaAtual === "Consultorios" && subTelaConsultorios === "cadastrar") ||
        (telaAtual === "sala-cirurgica" && subTelaSalaCirurgia === "cadastrar") ||
        (telaAtual === "sala-leitos" && subTelaSalaLeitos === "cadastrar");

    if (precisaLocalizacao) {
        fetch("http://localhost:3001/api/admin/localizacoes?busca=", {
             headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setListaLocalizacoes(data))
        .catch(err => console.error("Erro ao buscar localizações", err));
    }

    if (telaAtual === "leitos" && subTelaLeitos === "cadastrar") {
        fetch("http://localhost:3001/api/admin/buscar-salas-leito?busca=", {
            headers: { 'Authorization': `Bearer ${token}` }
       })
       .then(res => res.json())
       .then(data => setListaSalasLeito(data))
       .catch(err => console.error("Erro ao buscar salas de leito", err));
    }

  }, [telaAtual, subTelaConsultorios, subTelaSalaCirurgia, subTelaSalaLeitos, subTelaLeitos]);

  const handleLocalizacaoChange = (e) => {
      const val = e.target.value;
      setLocalizacaoSelecionadaString(val);
      if (val) {
          const loc = JSON.parse(val);
          setBloco(loc.Bloco);
          setAnexo(loc.Anexo);
          setAndar(loc.Andar);
      } else {
          setBloco(""); setAnexo(""); setAndar("");
      }
  };

  const handleSalaLeitoChange = (e) => {
      const val = e.target.value;
      setSalaLeitoSelecionadaString(val);
      if (val) {
          const sala = JSON.parse(val);
          setBloco(sala.Bloco);
          setAnexo(sala.Anexo);
          setAndar(sala.Andar);
          setNumero(sala.N_Sala);
      } else {
          setBloco(""); setAnexo(""); setAndar(""); setNumero("");
      }
  };

  const renderConteudo = () => {
    switch (telaAtual) {
      case "sala-leitos": return renderGerenciadorSalaLeitos();
      case "leitos": return renderGerenciadorLeitos(); 
      case "localizacoes": return renderGerenciadorLocalizacao();
      case "sala-cirurgica": return renderGerenciadorSalaCirurgia();
      case "Consultorios": return renderGerenciadorConsultorios();
      case "menu": return renderMenu();
      default: return renderMenu();
    }
  };

  const handleCadastrarLocalizacao = async () => {
    if (!bloco || !anexo || !andar) { alert("Preencha todos os campos!"); return; }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3001/api/admin/localizacoes/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bloco, anexo, andar })
        });
        const data = await response.json();
        if (response.ok) { alert("Localização cadastrada!"); setBloco(""); setAnexo(""); setAndar(""); setSubTelaLocalizacao("listar"); } 
        else { alert(data.message); }
    } catch (error) { console.error(error); alert("Erro ao conectar."); }
  };

  const handleCadastrarConsultorio = async () => {
    if (!bloco || !numero) { alert("Selecione local e número!"); return; }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3001/api/admin/consultorios/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bloco, anexo, andar, numero, especialidade: especialidadeConsultorio })
        });
        const data = await response.json();
        if (response.ok) { alert("Consultório cadastrado!"); setNumero(""); setEspecialidadeConsultorio(""); setSubTelaConsultorios("listar"); } 
        else { alert(data.message); }
    } catch (error) { console.error(error); alert("Erro ao conectar."); }
  };

  const handleCadastrarSalaCirurgia = async () => {
    if (!bloco || !numero || !capacidadeSalaCirurgica) { alert("Preencha todos os campos!"); return; }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3001/api/admin/salas-cirurgia/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bloco, anexo, andar, numero, capacidade: capacidadeSalaCirurgica })
        });
        const data = await response.json();
        if (response.ok) { alert("Sala cadastrada!"); setNumero(""); setCapacidadeSalaCirurgica(""); setSubTelaSalaCirurgia("listar"); } 
        else { alert(data.message); }
    } catch (error) { console.error(error); alert("Erro ao conectar."); }
  };

  const handleCadastrarSalaLeitos = async () => {
    if (!bloco || !numero || !tipoSalaLeito) { alert("Preencha todos os campos!"); return; }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3001/api/admin/salas-leito/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bloco, anexo, andar, numero, tipo_leito: tipoSalaLeito })
        });
        const data = await response.json();
        if (response.ok) { alert("Sala de Leito cadastrada!"); setNumero(""); setTipoSalaLeito(""); setSubTelaSalaLeitos("listar"); } 
        else { alert(data.message); }
    } catch (error) { console.error(error); alert("Erro ao conectar."); }
  };

  const handleCadastrarLeito = async () => {
    if (!bloco || !numero || !numeroLeito) { alert("Selecione a sala e informe o número do leito!"); return; }
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3001/api/admin/leitos/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                bloco, anexo, andar, 
                n_sala: numero,
                n_leito: numeroLeito 
            })
        });
        const data = await response.json();
        if (response.ok) { 
            alert("Leito cadastrado!"); 
            setNumeroLeito(""); 
            setSubTelaLeitos("listar"); 
        } else { alert(data.message); }
    } catch (error) { console.error(error); alert("Erro ao conectar."); }
  };

  const renderMenu = () => (
    <>
      <main className="LinesOptions">
        <div className="optionsCad">
          <img src={ImgSalaLeitos} alt="Sala Leitos" className="config-img-cad-sala" />
          <BtnCustomized size="small" TypeText="strong" text="Sala de Leitos" showImg="hidden" TypeBtn="button" onClick={() => { setTelaAtual("sala-leitos"); setSubTelaSalaLeitos("menu"); }} />
        </div>

        <div className="optionsCad">
          <img src={ImgLeitos} alt="Leitos" className="config-img-cad-sala" />
          <BtnCustomized size="small" TypeText="strong" text="Leitos" showImg="hidden" TypeBtn="button" onClick={() => { setTelaAtual("leitos"); setSubTelaLeitos("menu"); }} />
        </div>

        <div className="optionsCad">
          <img src={ImgLocal} alt="Localizações" className="config-img-cad-sala" />
          <BtnCustomized size="small" TypeText="strong" text="Localizações" showImg="hidden" TypeBtn="button" onClick={() => { setTelaAtual("localizacoes"); setSubTelaLocalizacao("menu"); }} />
        </div>
      </main>

      <main className="LinesOptions LineDown">
        <div></div>
        <div className="optionsCad">
          <img src={ImgSalaCirurgia} alt="Sala Cirurgia" className="config-img-cad-sala" />
          <BtnCustomized size="small" TypeText="strong" text="Sala Cirurgica" showImg="hidden" TypeBtn="button" onClick={() => { setTelaAtual("sala-cirurgica"); setSubTelaSalaCirurgia("menu"); }} />
        </div>

        <div className="optionsCad">
          <img src={ImgConsultorios} alt="Consultorios" className="config-img-cad-sala" />
          <BtnCustomized size="small" TypeText="strong" text="Consultorios" showImg="hidden" TypeBtn="button" onClick={() => { setTelaAtual("Consultorios"); setSubTelaConsultorios("menu"); }} />
        </div>
        <div></div>
      </main>
    </>
  );

  const renderGerenciadorBase = (titulo, img, subState, setSubState, ComponenteLista, ComponenteCadastro) => {
    if (subState === "menu") {
        return (
            <div className="container-conteudo-admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', height: '100%' }}>
                <h1 className="title-group-cad-sala">Gerenciar {titulo}</h1>
                <div style={{ display: 'flex', gap: '50px', marginTop: '20px' }}>
                    <div className="optionsCad">
                        <img src={img} className="config-img-cad-sala" style={{height: '180px', width: '180px', objectFit: 'contain'}} alt="Ver Lista" />
                        <BtnCustomized size="medium" TypeText="strong" text={`Ver ${titulo}`} showImg="hidden" TypeBtn="button" onClick={() => setSubState("listar")} />
                    </div>
                    <div className="optionsCad">
                        <img src={img} className="config-img-cad-sala" style={{height: '180px', width: '180px', objectFit: 'contain', filter: 'hue-rotate(90deg)'}} alt="Cadastrar" />
                        <BtnCustomized size="medium" TypeText="strong" text="Cadastrar Novo" showImg="hidden" TypeBtn="button" onClick={() => setSubState("cadastrar")} />
                    </div>
                </div>
                <div style={{marginTop: '40px'}}>
                     <BtnCustomized size="small" TypeText="strong" text="Voltar ao Menu" showImg="hidden" TypeBtn="button" onClick={() => setTelaAtual("menu")} />
                </div>
            </div>
        );
    } else if (subState === "listar") {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div style={{padding: '10px 20px'}}><BtnCustomized size="small" TypeText="strong" text="< Voltar" showImg="hidden" TypeBtn="button" onClick={() => setSubState("menu")} /></div>
                <ComponenteLista />
            </div>
        );
    } else if (subState === "cadastrar") {
        return <ComponenteCadastro />;
    }
  };

  const renderGerenciadorLocalizacao = () => renderGerenciadorBase("Localizações", ImgLocal, subTelaLocalizacao, setSubTelaLocalizacao, ListaLocalizacoes, renderFormCadLocalizacao);
  const renderGerenciadorConsultorios = () => renderGerenciadorBase("Consultórios", ImgConsultorios, subTelaConsultorios, setSubTelaConsultorios, ListaConsultorios, renderFormCadConsultorio);
  const renderGerenciadorSalaCirurgia = () => renderGerenciadorBase("Salas Cirúrgicas", ImgSalaCirurgia, subTelaSalaCirurgia, setSubTelaSalaCirurgia, ListaSalaCirurgia, renderFormCadSalaCirurgia);
  const renderGerenciadorSalaLeitos = () => renderGerenciadorBase("Salas de Leitos", ImgSalaLeitos, subTelaSalaLeitos, setSubTelaSalaLeitos, ListaSalaLeitos, renderFormCadSalaLeitos);
  const renderGerenciadorLeitos = () => renderGerenciadorBase("Leitos", ImgLeitos, subTelaLeitos, setSubTelaLeitos, ListaLeitos, renderFormCadLeito);

  const FormWrapper = ({ titulo, subStateSetter, children, onSubmit }) => (
    <main className="container-cad-leitos" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{width: '100%', padding: '10px 20px', alignSelf: 'flex-start'}}>
            <BtnCustomized size="small" TypeText="strong" text="< Voltar" showImg="hidden" TypeBtn="button" onClick={() => subStateSetter("menu")} />
        </div>
        <h1 className="title-group-sala">{titulo}</h1>
        <form className="form-cad-leito" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <div className="actions-cad-leito" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {children}
            </div>
            <div className="form-actions-cad-leito" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <BtnCustomized showImg="hidden" size="medium" text="Cadastrar" TypeText="strong" TypeBtn="submit" />
            </div>
        </form>
    </main>
  );

  const renderFormCadLocalizacao = () => (
    <FormWrapper titulo="Nova Localização" subStateSetter={setSubTelaLocalizacao} onSubmit={handleCadastrarLocalizacao}>
        <div className="cadastro-leitos"><label>Bloco</label><input type="text" className="inputs-Cad-Leitos" value={bloco} onChange={(e) => setBloco(e.target.value)} placeholder="Ex: Bloco A" required /></div>
        <div className="cadastro-leitos"><label>Anexo</label><input type="text" className="inputs-Cad-Leitos" value={anexo} onChange={(e) => setAnexo(e.target.value)} placeholder="Ex: Ala Norte" required /></div>
        <div className="cadastro-leitos"><label>Andar</label><input type="text" className="inputs-Cad-Leitos" value={andar} onChange={(e) => setAndar(e.target.value)} placeholder="Ex: 2" required /></div>
    </FormWrapper>
  );

  const renderFormCadConsultorio = () => (
    <FormWrapper titulo="Novo Consultório" subStateSetter={setSubTelaConsultorios} onSubmit={handleCadastrarConsultorio}>
        <div className="cadastro-leitos">
            <label>Localização</label>
            <select className="inputs-Cad-Leitos" value={localizacaoSelecionadaString} onChange={handleLocalizacaoChange} required style={{cursor: 'pointer'}}>
                <option value="">Selecione...</option>
                {listaLocalizacoes.map((loc, idx) => <option key={idx} value={JSON.stringify(loc)}>{`${loc.Bloco} - ${loc.Anexo} - ${loc.Andar}`}</option>)}
            </select>
        </div>
        <div className="cadastro-leitos"><label>Número da Sala</label><input type="text" className="inputs-Cad-Leitos" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 101" required /></div>
        <div className="cadastro-leitos"><label>Especialidade</label><input type="text" className="inputs-Cad-Leitos" value={especialidadeConsultorio} onChange={(e) => setEspecialidadeConsultorio(e.target.value)} placeholder="Ex: Cardiologia" /></div>
    </FormWrapper>
  );

  const renderFormCadSalaCirurgia = () => (
    <FormWrapper titulo="Nova Sala de Cirurgia" subStateSetter={setSubTelaSalaCirurgia} onSubmit={handleCadastrarSalaCirurgia}>
        <div className="cadastro-leitos">
            <label>Localização</label>
            <select className="inputs-Cad-Leitos" value={localizacaoSelecionadaString} onChange={handleLocalizacaoChange} required style={{cursor: 'pointer'}}>
                <option value="">Selecione...</option>
                {listaLocalizacoes.map((loc, idx) => <option key={idx} value={JSON.stringify(loc)}>{`${loc.Bloco} - ${loc.Anexo} - ${loc.Andar}`}</option>)}
            </select>
        </div>
        <div className="cadastro-leitos"><label>Número da Sala</label><input type="text" className="inputs-Cad-Leitos" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 101" required /></div>
        <div className="cadastro-leitos"><label>Capacidade</label><input type="number" className="inputs-Cad-Leitos" value={capacidadeSalaCirurgica} onChange={(e) => setCapacidadeSalaCirurgica(e.target.value)} placeholder="Ex: 5" required /></div>
    </FormWrapper>
  );

  const renderFormCadSalaLeitos = () => (
    <FormWrapper titulo="Nova Sala de Leitos" subStateSetter={setSubTelaSalaLeitos} onSubmit={handleCadastrarSalaLeitos}>
        <div className="cadastro-leitos">
            <label>Localização</label>
            <select className="inputs-Cad-Leitos" value={localizacaoSelecionadaString} onChange={handleLocalizacaoChange} required style={{cursor: 'pointer'}}>
                <option value="">Selecione...</option>
                {listaLocalizacoes.map((loc, idx) => <option key={idx} value={JSON.stringify(loc)}>{`${loc.Bloco} - ${loc.Anexo} - ${loc.Andar}`}</option>)}
            </select>
        </div>
        <div className="cadastro-leitos"><label>Número da Sala</label><input type="text" className="inputs-Cad-Leitos" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 101" required /></div>
        <div className="cadastro-leitos"><label>Tipo de Leito</label><input type="text" className="inputs-Cad-Leitos" value={tipoSalaLeito} onChange={(e) => setTipoSalaLeito(e.target.value)} placeholder="Ex: UTI, Enfermaria" required /></div>
    </FormWrapper>
  );

  const renderFormCadLeito = () => (
    <FormWrapper titulo="Novo Leito" subStateSetter={setSubTelaLeitos} onSubmit={handleCadastrarLeito}>
        <div className="cadastro-leitos">
            <label>Sala de Leito</label>
            <select className="inputs-Cad-Leitos" value={salaLeitoSelecionadaString} onChange={handleSalaLeitoChange} required style={{cursor: 'pointer'}}>
                <option value="">Selecione uma sala...</option>
                {listaSalasLeito.map((sala, idx) => (
                    <option key={idx} value={JSON.stringify(sala)}>
                        {`${sala.Tipo_Leito} - ${sala.Bloco} - ${sala.Anexo} - ${sala.Andar} - Sala ${sala.N_Sala}`}
                    </option>
                ))}
            </select>
        </div>
        <div className="cadastro-leitos"><label>Número do Leito</label><input type="text" className="inputs-Cad-Leitos" value={numeroLeito} onChange={(e) => setNumeroLeito(e.target.value)} placeholder="Ex: 01" required /></div>
    </FormWrapper>
  );

  return <div className="container-Cad-Sala">{renderConteudo()}</div>;
}