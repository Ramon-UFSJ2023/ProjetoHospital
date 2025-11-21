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

    fetch("http://localhost:3001/api/admin/buscar-leitos?busca=", {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
        const options = data.map(l => ({ 
            value: { 
                bloco: l.Bloco_Leito, 
                anexo: l.Anexo_Leito, 
                andar: l.Andar_Leito, 
                n_sala: l.N_Sala, 
                n_leito: l.N_Leito 
            }, 
            label: `Leito ${l.N_Leito} - Sala ${l.N_Sala} (${l.Tipo_Leito})` 
        }));
        setLeitos(options);
    });

  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!enfermeiroSelecionado || !leitoSelecionado) {
        alert("Selecione o enfermeiro e o leito.");
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
                    <label>Leito Responsável</label>
                    <Select 
                        options={leitos} 
                        value={leitoSelecionado} 
                        onChange={setLeitoSelecionado}
                        placeholder="Selecione o leito..."
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
                        />
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
                    Nota: O sistema validará automaticamente se o enfermeiro cumpriu o descanso de 36h desde seu último plantão ou cirurgia.
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