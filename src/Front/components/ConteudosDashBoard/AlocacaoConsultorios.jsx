import React, { useState, useEffect } from "react";
import "./style/alocacao.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';

// CORREÇÃO 1: Normalizar a data para meia-noite local
const getInicioDaSemana = (date) => {
  const d = new Date(date);
  const diaDaSemana = d.getDay();
  const diff = d.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Zera o horário para o início do dia local
  return d;
};

// CORREÇÃO 2: Nova função para formatar data local (YYYY-MM-DD)
const formatarDataLocalSQL = (date) => {
  const ano = date.getFullYear();
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const dia = date.getDate().toString().padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

// CORREÇÃO 3: Nova função para formatar data e hora local (YYYY-MM-DD HH:MM:SS)
const formatarDataHoraLocalSQL = (date) => {
  const data = formatarDataLocalSQL(date);
  const hora = date.getHours().toString().padStart(2, '0');
  const minuto = date.getMinutes().toString().padStart(2, '0');
  const segundo = date.getSeconds().toString().padStart(2, '0');
  return `${data} ${hora}:${minuto}:${segundo}`;
};

// (Função original 'formatarDataSQL' removida, pois foi substituída)

export default function GerenciarAlocacoes() {
  const [medicos, setMedicos] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);

  const [semanaSelecionada, setSemanaSelecionada] = useState(getInicioDaSemana(new Date()));
  const [consultorioSelecionado, setConsultorioSelecionado] = useState(null);
  const [medicoSelecionado, setMedicoSelecionado] = useState(null);

  const horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const diasDaSemana = [1, 2, 3, 4, 5]; 

  useEffect(() => {
    fetch("http://localhost:3001/api/admin/medicos")
      .then((res) => res.json())
      .then((data) => setMedicos(data))
      .catch((err) => console.error("Erro ao buscar médicos:", err));

    fetch("http://localhost:3001/api/admin/consultorios")
      .then((res) => res.json())
      .then((data) => {
        setConsultorios(data);
        if (data.length > 0) {
          setConsultorioSelecionado(data[0]); 
        }
      })
      .catch((err) => console.error("Erro ao buscar consultórios:", err));
  }, []);

  useEffect(() => {
    if (consultorioSelecionado) {
      fetchAlocacoes();
    }
  }, [consultorioSelecionado, semanaSelecionada]);

  const fetchAlocacoes = () => {
    if (!consultorioSelecionado) return; 

    const inicioSemana = getInicioDaSemana(semanaSelecionada);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 6); 

    const params = new URLSearchParams({
      ...consultorioSelecionado, 
      // CORREÇÃO 4: Usar a nova função de formatação local
      data_inicio_semana: `${formatarDataLocalSQL(inicioSemana)} 00:00:00`,
      data_fim_semana: `${formatarDataLocalSQL(fimSemana)} 23:59:59`,
    });

    fetch(`http://localhost:3001/api/admin/alocacoes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setAlocacoes(data))
      .catch((err) => console.error("Erro ao buscar alocações:", err));
  };

  const getDataDoSlot = (diaIndex, horario) => {
    const dataBase = new Date(semanaSelecionada);
    dataBase.setDate(dataBase.getDate() + diaIndex - 1); 
    const [hora, minuto] = horario.split(':');
    dataBase.setHours(parseInt(hora), parseInt(minuto), 0, 0);
    return dataBase;
  };

  const handleSlotClick = (diaIndex, horario) => {
    if (!consultorioSelecionado) {
      alert("Erro: Consultório não selecionado.");
      return;
    }

    const dataHoraInicio = getDataDoSlot(diaIndex, horario);
    const dataHoraFim = new Date(dataHoraInicio);
    dataHoraFim.setHours(dataHoraFim.getHours() + 1); 

    // CORREÇÃO 5: Usar a nova função que formata a hora local, sem converter para UTC
    const dataHoraInicioSQL = formatarDataHoraLocalSQL(dataHoraInicio);
    const dataHoraFimSQL = formatarDataHoraLocalSQL(dataHoraFim);

    const alocacaoExistente = getAlocacaoDoSlot(diaIndex, horario);

    if (alocacaoExistente) {
      if (window.confirm(`Deseja desalocar ${alocacaoExistente.nome_medico} deste horário?`)) {
        
        const body = {
          cpf_m: alocacaoExistente.CPF_M,
          bloco: consultorioSelecionado.Bloco,
          anexo: consultorioSelecionado.Anexo,
          andar: consultorioSelecionado.Andar,
          numero: consultorioSelecionado.Numero,
          // CORREÇÃO 6: Usar a string da hora local calculada, e não a string do DB
          data_inicio: dataHoraInicioSQL,
        };
        
        fetch("http://localhost:3001/api/admin/desalocar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          fetchAlocacoes(); 
        });
      }
    } else {
      if (!medicoSelecionado) {
        alert("Por favor, selecione um médico na lista da esquerda primeiro.");
        return;
      }
      
      if (window.confirm(`Alocar ${medicoSelecionado.nome_completo} neste horário?\n\nConsultório: ${consultorioSelecionado.Numero}\nData: ${dataHoraInicio.toLocaleString('pt-BR')}`)) {
        
        const body = {
          cpf_m: medicoSelecionado.cpf,
          bloco: consultorioSelecionado.Bloco,
          anexo: consultorioSelecionado.Anexo,
          andar: consultorioSelecionado.Andar,
          numero: consultorioSelecionado.Numero,
          data_inicio: dataHoraInicioSQL, // Já está corrigido pela CORREÇÃO 5
          data_fim: dataHoraFimSQL,       // Já está corrigido pela CORREÇÃO 5
        };

        fetch("http://localhost:3001/api/admin/alocar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.message.includes("sucesso")) {
            fetchAlocacoes(); 
          }
        });
      }
    }
  };

  const getAlocacaoDoSlot = (diaIndex, horario) => {
    const dataSlot = getDataDoSlot(diaIndex, horario);
    
    // Esta comparação .getTime() é robusta e deve funcionar corretamente
    // desde que os dados do DB sejam lidos corretamente pelo 'new Date()'
    return alocacoes.find(a => {
      const dataInicioAlocacao = new Date(a.Data_Inicio);
      return dataInicioAlocacao.getTime() === dataSlot.getTime();
    });
  };

  return (
    // O JSX permanece o mesmo
    <div className="container-conteudo-admin">
      <div className="alocacao-controles">
        <div className="input-groups-CadFun">
          <label>Selecione a Semana:</label>
          <DatePicker
            selected={semanaSelecionada}
            onChange={(date) => setSemanaSelecionada(getInicioDaSemana(date))}
            className="inputs-Cad-Fun"
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
          />
        </div>
        <div className="input-groups-CadFun">
          <label>Selecione o Consultório:</label>
          <select
            className="inputs-Cad-Fun gender-input"
            value={consultorioSelecionado ? JSON.stringify(consultorioSelecionado) : ""}
            onChange={(e) => {
              if (e.target.value) {
                setConsultorioSelecionado(JSON.parse(e.target.value));
              }
            }}
          >
            {!consultorioSelecionado && <option value="">Carregando...</option>}
            {consultorios.map((c, index) => (
              <option key={index} value={JSON.stringify(c)}>
                {`Bloco ${c.Bloco} / Andar ${c.Andar} / Sala ${c.Numero} (${c.Especialidade || 'Geral'})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="alocacao-body">
        
        <div className="medico-list-container">
          <h2 className="title-group-func">Médicos Disponíveis</h2>
          <div className="medico-list">
            {medicos.map((medico) => (
              <div
                key={medico.cpf}
                className={`medico-list-item ${medicoSelecionado?.cpf === medico.cpf ? "selected" : ""}`}
                onClick={() => setMedicoSelecionado(medico)}
              >
                <strong>{medico.nome_completo}</strong>
                <small>{medico.Especialidade}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-container">
          <table className="schedule-grid">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Segunda</th>
                <th>Terça</th>
                <th>Quarta</th>
                <th>Quinta</th>
                <th>Sexta</th>
              </tr>
            </thead>
            <tbody>
              {horarios.slice(0, -1).map((horario) => ( 
                <tr key={horario}>
                  <td>{horario} - {horarios[horarios.indexOf(horario) + 1]}</td>
                  
                  {diasDaSemana.map((diaIndex) => {
                    const alocacao = getAlocacaoDoSlot(diaIndex, horario);
                    return (
                      <td
                        key={diaIndex}
                        className={alocacao ? "slot-ocupado" : "slot-livre"}
                        onClick={() => handleSlotClick(diaIndex, horario)}
                      >
                        {alocacao ? (
                          <>
                            <strong>{alocacao.nome_medico}</strong>
                            <small>(Clique p/ desalocar)</small>
                          </>
                        ) : "Livre"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}