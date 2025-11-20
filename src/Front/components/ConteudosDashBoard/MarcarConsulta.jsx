import React, { useState, useEffect } from "react";
import "./style/GerenciasCadastro.css"; 
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import BtnCustomized from "../Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
// import { ptBR } from 'date-fns/locale';

registerLocale('ptBR', ptBR);

const formatarDataHoraLocalSQL = (date) => {
  const data = formatarDataLocalSQL(date);
  const hora = date.getHours().toString().padStart(2, '0');
  const minuto = date.getMinutes().toString().padStart(2, '0');
  const segundo = date.getSeconds().toString().padStart(2, '0');
  return `${data} ${hora}:${minuto}:${segundo}`;
};

const formatarDataLocalSQL = (date) => {
  const ano = date.getFullYear();
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const dia = date.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export default function MarcarConsulta() {
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      alert("Sessão não encontrada. Redirecionando para o login.");
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://localhost:3001/api/admin/medicos")
      .then((res) => res.json())
      .then((data) => setMedicos(data))
      .catch((err) => console.error("Erro ao buscar médicos:", err));
  }, []);

  const minTime = new Date();
  minTime.setHours(8, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(17, 0, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!medicoSelecionado || !dataSelecionada) {
      alert("Por favor, selecione um médico e uma data/hora.");
      return;
    }
    
    setIsLoading(true);

    const dataInicioSQL = formatarDataHoraLocalSQL(dataSelecionada);
    
    const body = {
      cpf_m: medicoSelecionado,
      data_inicio: dataInicioSQL,
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
        setMedicoSelecionado("");
      } else {
        alert(data.message || "Erro ao marcar consulta.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Não foi possível conectar ao servidor.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container-conteudo-admin" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form className="form-cad-fun" onSubmit={handleSubmit}>
        <h1 className="title-group-func">Marcar Nova Consulta</h1>

        <section className="sections-cad">
          <div className="input-groups-CadFun">
            <label htmlFor="medico">Médico</label>
            <select
              id="medico"
              className="inputs-Cad-Fun gender-input"
              value={medicoSelecionado}
              onChange={(e) => setMedicoSelecionado(e.target.value)}
              required
            >
              <option value="">Selecione um médico</option>
              {medicos.map((medico) => (
                <option key={medico.cpf} value={medico.cpf}>
                  {medico.nome_completo} ({medico.Especialidade})
                </option>
              ))}
            </select>
          </div>

          <div className="input-groups-CadFun">
            <label htmlFor="data">Data e Hora</label>
            <DatePicker
              id="data"
              selected={dataSelecionada}
              onChange={(date) => setDataSelecionada(date)}
              className="inputs-Cad-Fun"
              placeholderText="Escolha um dia e horário"
              locale={ptBR}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={60}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={new Date()} 
              minTime={minTime}
              maxTime={maxTime}
              filterDate={(date) => {
                const day = date.getDay();
                return day !== 0 && day !== 6;
              }}
              required
            />
          </div>
        </section>

        <div className="form-actions" style={{ justifyContent: 'center' }}>
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