import React, { useState, useEffect } from "react";
import "./style/GerenciasCadastro.css"; 
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import BtnCustomized from "../Buttons/ButtonCustomized";
import Select from 'react-select';

registerLocale('ptBR', ptBR);

const formatarDataLocalSQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - offset);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
};

export default function AlocarEnfermeiro() {
  const [enfermeiros, setEnfermeiros] = useState([]);
  const [leitos, setLeitos] = useState([]);
  
  const [enfermeiroSelecionado, setEnfermeiroSelecionado] = useState(null);
  const [leitoSelecionado, setLeitoSelecionado] = useState(null);
  
  const [minDataEntrada, setMinDataEntrada] = useState(null);

  const [dataEntrada, setDataEntrada] = useState(new Date());
  const [dataSaida, setDataSaida] = useState(() => {
     const d = new Date();
     d.setHours(d.getHours() + 12);
     return d;
  });

  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3001/api/admin/enfermeiros", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(e => ({ value: e.cpf, label: `${e.nome_completo} (COFEN: ${e.COFEN})` }));
        setEnfermeiros(options);
    });

    fetch("http://localhost:3001/api/admin/leitos-ocupados", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(l => ({ 
            value: { 
                bloco: l.Bloco_Leito, 
                anexo: l.Anexo_Leito, 
                andar: l.Andar_Leito, 
                n_sala: l.N_Sala, 
                n_leito: l.N_Leito,
                data_entrada_paciente: l.Data_Entrada_Leito 
            }, 
            label: `Leito ${l.N_Leito} (${l.Tipo_Leito}) - Pac: ${l.nome_paciente || 'N/D'}` 
        }));
        setLeitos(options);
    });

  }, [token]);

  const handleLeitoChange = (selectedOption) => {
      setLeitoSelecionado(selectedOption);
      
      if (selectedOption) {
          const dataPaciente = new Date(selectedOption.value.data_entrada_paciente);
          setMinDataEntrada(dataPaciente);

          if (dataEntrada < dataPaciente) {
              setDataEntrada(dataPaciente);
              const novaSaida = new Date(dataPaciente);
              novaSaida.setHours(novaSaida.getHours() + 12);
              setDataSaida(novaSaida);
          }
      } else {
          setMinDataEntrada(null);
      }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!enfermeiroSelecionado || !leitoSelecionado) {
        alert("Selecione o enfermeiro e o leito.");
        return;
    }

    if (minDataEntrada && dataEntrada < minDataEntrada) {
        alert(`A data de início não pode ser anterior à entrada do paciente (${minDataEntrada.toLocaleString()}).`);
        return;
    }

    const payload = {
        cpf_e: enfermeiroSelecionado.value,
        ...leitoSelecionado.value,
        data_entrada: formatarDataLocalSQL(dataEntrada),
        data_saida: formatarDataLocalSQL(dataSaida)
    };

    try {
        const response = await fetch('http://localhost:3001/api/admin/alocar-enfermeiro-leito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert("Alocação realizada com sucesso!");
            setEnfermeiroSelecionado(null);
            setLeitoSelecionado(null);
            setMinDataEntrada(null);
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão.");
    }
  };

  return (
    <div className="container-conteudo-cadastro" style={{ overflowY: 'auto' }}>
        <form className="form-cad-fun" onSubmit={handleSubmit} style={{ height: 'auto', minHeight: '100%' }}>
            <h1 className="title-group-func" style={{ marginTop: '0' }}>Alocar Plantão de Enfermeiro</h1>
            
            <div className="form-sections" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div className="input-groups-CadFun">
                    <label>Enfermeiro</label>
                    <Select 
                        options={enfermeiros} 
                        value={enfermeiroSelecionado} 
                        onChange={setEnfermeiroSelecionado}
                        placeholder="Selecione o enfermeiro..."
                    />
                </div>

                <div className="input-groups-CadFun">
                    <label>Leito Ocupado</label>
                    <Select 
                        options={leitos} 
                        value={leitoSelecionado} 
                        onChange={handleLeitoChange} 
                        placeholder="Selecione um leito com paciente..."
                        noOptionsMessage={() => "Nenhum leito ocupado disponível"}
                    />
                </div>

                <div style={{display:'flex', gap: '20px'}}>
                    <div className="input-groups-CadFun" style={{flex: 1}}>
                        <label>Início do Plantão</label>
                        <DatePicker
                            selected={dataEntrada}
                            onChange={(date) => setDataEntrada(date)}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy HH:mm"
                            className="inputs-Cad-Fun"
                            locale={ptBR}
                            minDate={minDataEntrada || new Date()} 
                            minTime={
                                (minDataEntrada && dataEntrada.toDateString() === minDataEntrada.toDateString()) 
                                ? minDataEntrada 
                                : new Date().setHours(0,0,0,0)
                            }
                            maxTime={new Date().setHours(23,59,59,999)}
                        />
                        {minDataEntrada && (
                            <small style={{color: '#9f2a2a', marginTop: '5px'}}>
                                Mínimo: {minDataEntrada.toLocaleString('pt-BR')}
                            </small>
                        )}
                    </div>
                    <div className="input-groups-CadFun" style={{flex: 1}}>
                        <label>Fim do Plantão (Máx 12h)</label>
                        <DatePicker
                            selected={dataSaida}
                            onChange={(date) => setDataSaida(date)}
                            showTimeSelect
                            dateFormat="dd/MM/yyyy HH:mm"
                            className="inputs-Cad-Fun"
                            locale={ptBR}
                            minDate={dataEntrada}
                        />
                    </div>
                </div>
                
                <p style={{textAlign:'center', color: '#666', fontStyle:'italic', fontSize:'14px'}}>
                    Nota: O sistema validará a jornada de 12h e o descanso de 36h.
                </p>

            </div>

            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <BtnCustomized
                    size="medium"
                    TypeText="strong"
                    text="Confirmar Alocação"
                    showImg="hidden"
                    TypeBtn="submit"
                />
            </div>
        </form>
    </div>
  );
}