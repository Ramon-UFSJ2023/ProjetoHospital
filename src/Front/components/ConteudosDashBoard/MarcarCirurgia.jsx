import React, { useState, useEffect } from "react";
import "./style/GerenciasCadastro.css"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import BtnCustomized from "../Buttons/ButtonCustomized";
import Select from 'react-select';
import CurrencyInput from "react-currency-input-field";

export default function MarcarCirurgia() {
  const [pacientes, setPacientes] = useState([]);
  const [salas, setSalas] = useState([]);
  const [leitos, setLeitos] = useState([]);
  const [enfermeiros, setEnfermeiros] = useState([]);
  const [medicos, setMedicos] = useState([]); 

  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [salaSelecionada, setSalaSelecionada] = useState(null);
  const [leitoSelecionado, setLeitoSelecionado] = useState(null);
  const [enfermeirosSelecionados, setEnfermeirosSelecionados] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState(null);

  const [dataEntrada, setDataEntrada] = useState(new Date());
  const [nTuss, setNTuss] = useState("");
  const [valor, setValor] = useState("");
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3001/api/admin/buscar-pacientes?busca=", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(p => ({ value: p.cpf, label: `${p.primeiro_nome} ${p.sobrenome} (CPF: ${p.cpf})` }));
        setPacientes(options);
    });

    fetch("http://localhost:3001/api/admin/salas-cirurgia", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(s => ({ 
            value: { bloco: s.Bloco, anexo: s.Anexo, andar: s.Andar, numero: s.N_Sala }, 
            label: `Bloco ${s.Bloco} - Sala ${s.N_Sala} (Cap: ${s.Capacidade})` 
        }));
        setSalas(options);
    });

    fetch("http://localhost:3001/api/admin/leitos-disponiveis", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(l => ({ 
            value: { bloco: l.Bloco_Leito, anexo: l.Anexo_Leito, andar: l.Andar_Leito, sala: l.N_Sala, numero: l.N_Leito }, 
            label: `${l.Tipo_Leito} - Bloco ${l.Bloco_Leito} - Leito ${l.N_Leito}` 
        }));
        setLeitos(options);
    });

    fetch("http://localhost:3001/api/admin/enfermeiros", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(e => ({ value: e.cpf, label: `${e.nome_completo} (COFEN: ${e.COFEN})` }));
        setEnfermeiros(options);
    });

    fetch("http://localhost:3001/api/admin/medicos", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
         const options = data.map(m => ({ value: m.cpf, label: `${m.nome_completo} - ${m.Especialidade}` }));
         setMedicos(options);
    });

  }, [token]);

  const formatarDataLocalSQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pacienteSelecionado || !salaSelecionada) {
        alert("Paciente e Sala Cirúrgica são obrigatórios.");
        return;
    }
    
    if (user.eh_admin && !medicoSelecionado) {
        alert("Administradores devem selecionar um médico responsável.");
        return;
    }

    const payload = {
        cpf_p: pacienteSelecionado.value,
        data_entrada: formatarDataLocalSQL(dataEntrada),
        sala_cirurgia: salaSelecionada.value,
        leito: leitoSelecionado ? leitoSelecionado.value : null,
        enfermeiros: enfermeirosSelecionados.map(e => e.value),
        n_tuss: nTuss,
        valor: valor ? parseFloat(valor.replace(',', '.')) : 0.0,
        medico_responsavel: user.eh_admin ? medicoSelecionado.value : null 
    };

    try {
        const response = await fetch('http://localhost:3001/api/medico/marcar-cirurgia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert("Cirurgia marcada com sucesso!");
            setPacienteSelecionado(null);
            setSalaSelecionada(null);
            setLeitoSelecionado(null);
            setEnfermeirosSelecionados([]);
            setNTuss("");
            setValor("");
        } else {
            alert(data.message || "Erro ao marcar cirurgia.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão.");
    }
  };

  return (
    <div className="container-conteudo-cadastro" style={{ overflowY: 'auto' }}>
        <form className="form-cad-fun" onSubmit={handleSubmit} style={{ height: 'auto', minHeight: '100%' }}>
            <h1 className="title-group-func" style={{ marginTop: '0' }}>Agendamento de Cirurgia</h1>
            
            <div className="form-sections" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <section className="sections-cad" style={{ width: '100%' }}>
                    <div className="input-groups-CadFun">
                        <label>Paciente</label>
                        <Select 
                            options={pacientes} 
                            value={pacienteSelecionado} 
                            onChange={setPacienteSelecionado}
                            placeholder="Selecione o paciente..."
                            isClearable
                        />
                    </div>

                    {user && user.eh_admin && (
                         <div className="input-groups-CadFun">
                            <label>Médico Responsável</label>
                            <Select 
                                options={medicos} 
                                value={medicoSelecionado} 
                                onChange={setMedicoSelecionado}
                                placeholder="Selecione o médico..."
                            />
                        </div>
                    )}

                    <div className="input-groups-CadFun">
                        <label>Data e Hora</label>
                        <DatePicker
                            selected={dataEntrada}
                            onChange={(date) => setDataEntrada(date)}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy HH:mm"
                            className="inputs-Cad-Fun"
                            locale={ptBR}
                        />
                    </div>
                </section>

                <section className="sections-cad" style={{ width: '100%' }}>
                    <h2 className="title-group-func">Alocação de Recursos</h2>
                    
                    <div className="input-groups-CadFun">
                        <label>Sala de Cirurgia</label>
                        <Select 
                            options={salas} 
                            value={salaSelecionada} 
                            onChange={setSalaSelecionada}
                            placeholder="Selecione a sala..."
                        />
                    </div>

                    <div className="input-groups-CadFun">
                        <label>Leito de Recuperação (Opcional)</label>
                        <Select 
                            options={leitos} 
                            value={leitoSelecionado} 
                            onChange={setLeitoSelecionado}
                            placeholder="Selecione um leito livre (Enfermaria/UTI)..."
                            isClearable
                        />
                    </div>

                    <div className="input-groups-CadFun">
                        <label>Equipe de Enfermagem</label>
                        <Select 
                            options={enfermeiros} 
                            value={enfermeirosSelecionados} 
                            onChange={setEnfermeirosSelecionados}
                            isMulti
                            placeholder="Selecione os enfermeiros..."
                        />
                    </div>
                </section>

                 <section className="sections-cad" style={{ width: '100%' }}>
                    <div className="input-groups-CadFun">
                        <label>Código TUSS (Procedimento)</label>
                        <input 
                            type="text" 
                            className="inputs-Cad-Fun" 
                            value={nTuss}
                            onChange={e => setNTuss(e.target.value)}
                            placeholder="Ex: 30101010"
                        />
                    </div>
                    <div className="input-groups-CadFun">
                         <label>Valor Estimado</label>
                         <CurrencyInput
                            className="inputs-Cad-Fun"
                            placeholder="R$ 0,00"
                            decimalsLimit={2}
                            prefix="R$ "
                            onValueChange={(value) => setValor(value)}
                         />
                    </div>
                 </section>

            </div>

            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <BtnCustomized
                    size="medium"
                    TypeText="strong"
                    text="Confirmar Agendamento"
                    showImg="hidden"
                    TypeBtn="submit"
                />
            </div>
        </form>
    </div>
  );
}