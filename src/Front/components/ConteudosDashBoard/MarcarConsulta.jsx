import React, { useState, useEffect } from "react";
import "./style/GerenciasCadastro.css"; 
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
import Select from 'react-select'; 

registerLocale('ptBR', ptBR);

const formatarDataHoraLocalSQL = (date) => {
  if (!date) return null;
  const ano = date.getFullYear();
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const dia = date.getDate().toString().padStart(2, '0');
  const hora = date.getHours().toString().padStart(2, '0');
  const minuto = date.getMinutes().toString().padStart(2, '0');
  const segundo = date.getSeconds().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
};

const formatarDataApenas = (date) => {
    if (!date) return "";
    const ano = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const dia = date.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

export default function MarcarConsulta() {
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]); 
  const [diasComVagas, setDiasComVagas] = useState([]); 
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [internacao, setInternacao] = useState(false);
  const [leitos, setLeitos] = useState([]);
  const [leitoSelecionado, setLeitoSelecionado] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3001/api/admin/medicos", { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
         const options = data.map(m => ({ value: m.cpf, label: `${m.nome_completo} - ${m.Especialidade}` }));
         setMedicos(options);
      })
      .catch((err) => console.error("Erro ao buscar médicos:", err));

    if (user && user.eh_admin) {
        fetch("http://localhost:3001/api/admin/buscar-pacientes?busca=", { headers: { 'Authorization': `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
            const options = data.map(p => ({ value: p.cpf, label: `${p.primeiro_nome} ${p.sobrenome} (CPF: ${p.cpf})` }));
            setPacientes(options);
        });

        fetch("http://localhost:3001/api/admin/leitos-disponiveis", { headers: { 'Authorization': `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
            const options = data.map(l => ({ 
                value: { bloco: l.Bloco_Leito, anexo: l.Anexo_Leito, andar: l.Andar_Leito, sala: l.N_Sala, numero: l.N_Leito }, 
                label: `${l.Tipo_Leito} - Bloco ${l.Bloco_Leito} - Leito ${l.N_Leito}` 
            }));
            setLeitos(options);
        });
    }
  }, [token, user]);

  useEffect(() => {
      if (!medicoSelecionado || !token) {
          setDiasComVagas([]);
          setDataSelecionada(null);
          return;
      }

      fetch(`http://localhost:3001/api/medico/dias-com-vagas?cpf_m=${medicoSelecionado.value}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
          const dates = data.map(dateStr => {
              const [ano, mes, dia] = dateStr.split('-');
              return new Date(ano, mes - 1, dia);
          });
          setDiasComVagas(dates);
      })
      .catch(err => console.error("Erro ao buscar dias:", err));

  }, [medicoSelecionado, token]);

  useEffect(() => {
      if (!medicoSelecionado || !dataSelecionada || !token) {
          setHorariosDisponiveis([]);
          return;
      }

      setBuscandoHorarios(true);
      const dataFormatada = formatarDataApenas(dataSelecionada);
      
      fetch(`http://localhost:3001/api/medico/horarios-disponiveis?cpf_m=${medicoSelecionado.value}&data=${dataFormatada}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
          const dates = data.map(d => new Date(d));
          setHorariosDisponiveis(dates);
      })
      .catch(err => console.error("Erro ao buscar horários:", err))
      .finally(() => setBuscandoHorarios(false));

  }, [medicoSelecionado, dataSelecionada, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!medicoSelecionado || !dataSelecionada) {
      alert("Por favor, selecione um médico e uma data/hora.");
      return;
    }

    const horarioValido = horariosDisponiveis.some(d => d.getTime() === dataSelecionada.getTime());
    if (!horarioValido) {
        alert("O horário selecionado não está mais disponível.");
        return;
    }

    if (user.eh_admin && !pacienteSelecionado) {
        alert("Por favor, selecione um paciente.");
        return;
    }

    if (internacao && !leitoSelecionado) {
        alert("Para internação, é obrigatório selecionar um leito.");
        return;
    }
    
    setIsLoading(true);

    const body = {
      cpf_m: medicoSelecionado.value,
      data_inicio: formatarDataHoraLocalSQL(dataSelecionada),
      cpf_p: user.eh_admin ? pacienteSelecionado.value : null, 
      internacao: internacao,
      leito: internacao ? leitoSelecionado.value : null
    };

    try {
      const response = await fetch('http://localhost:3001/api/paciente/marcar-consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Consulta marcada com sucesso!");
        setDataSelecionada(null);
        setMedicoSelecionado(null);
        setHorariosDisponiveis([]);
        setDiasComVagas([]); 
        if(user.eh_admin) {
            setPacienteSelecionado(null);
            setInternacao(false);
            setLeitoSelecionado(null);
        }
      } else {
        alert(data.message || "Erro ao marcar consulta.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
    
    setIsLoading(false);
  };

  const isAdmin = user && user.eh_admin;

  return (
    <div className="container-conteudo-admin" style={{ maxWidth: '800px', margin: '0 auto', overflowY: 'auto' }}>
      <form className="form-cad-fun" onSubmit={handleSubmit} style={{height: 'auto', minHeight: '80%'}}>
        <h1 className="title-group-func" style={{marginTop: 0}}>Marcar Nova Consulta</h1>

        <div className="form-sections" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          
          {isAdmin && (
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
          )}

          <div className="input-groups-CadFun">
            <label>Médico</label>
            <Select
              options={medicos}
              value={medicoSelecionado}
              onChange={(val) => {
                  setMedicoSelecionado(val);
                  setDataSelecionada(null); 
                  setHorariosDisponiveis([]);
                  setDiasComVagas([]);
              }}
              placeholder="Selecione um médico..."
            />
          </div>

          <div className="input-groups-CadFun">
            <label>Data e Hora {buscandoHorarios && <span style={{fontSize:'12px', color:'#666'}}>(Buscando horários...)</span>}</label>
            <DatePicker
              selected={dataSelecionada}
              onChange={(date) => setDataSelecionada(date)}
              className="inputs-Cad-Fun"
              placeholderText={medicoSelecionado ? "Selecione uma data disponível" : "Selecione um médico primeiro"}
              locale={ptBR}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={60}
              dateFormat="dd/MM/yyyy HH:mm"
              includeDates={diasComVagas}
              includeTimes={horariosDisponiveis}
              disabled={!medicoSelecionado}
              required
            />
            {medicoSelecionado && diasComVagas.length === 0 && (
                <small style={{color: '#9f2a2a', marginTop: '5px'}}>
                    Este médico não possui datas disponíveis nos próximos 60 dias.
                </small>
            )}
          </div>

          {isAdmin && (
            <div style={{marginTop: '15px', padding: '15px', border: '1px dashed #9f2a2a', borderRadius: '10px', backgroundColor: '#fff5f5'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                    <input 
                        type="checkbox" 
                        id="chkInternacao" 
                        checked={internacao} 
                        onChange={(e) => setInternacao(e.target.checked)}
                        style={{transform: 'scale(1.5)', cursor: 'pointer'}}
                    />
                    <label htmlFor="chkInternacao" style={{fontSize: '18px', cursor: 'pointer', color: '#9f2a2a', fontWeight: 'bold'}}>
                        Requer Internação (Leito)
                    </label>
                </div>

                {internacao && (
                    <div className="input-groups-CadFun">
                        <label>Leito de Internação</label>
                        <Select
                            options={leitos}
                            value={leitoSelecionado}
                            onChange={setLeitoSelecionado}
                            placeholder="Selecione um leito vago..."
                            isClearable
                        />
                        <small style={{color: '#666'}}>O paciente ocupará o leito a partir da data da consulta.</small>
                    </div>
                )}
            </div>
          )}

        </div>

        <div className="form-actions" style={{ justifyContent: 'center', marginTop: '30px' }}>
          <BtnCustomized
            size="medium"
            TypeText="strong"
            text={isLoading ? "Agendando..." : "Confirmar Agendamento"}
            showImg="hidden"
            TypeBtn="submit"
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}