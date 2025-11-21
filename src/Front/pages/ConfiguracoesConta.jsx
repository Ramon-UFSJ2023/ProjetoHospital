import React, { useState, useEffect } from "react";
import UpperBar from "../components/UpperBar/UpperBar";
import BtnCustomized from "../components/Buttons/ButtonCustomized";
import { useNavigate } from "react-router-dom";
import "../components/ConteudosDashBoard/style/GerenciasCadastro.css"; 

export default function ConfiguracoesConta() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primeiro_nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    data_nascimento: "",
    genero: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: ""
  });
  
  const navItems = [{ label: "Voltar", onClick: () => navigate(-1) }];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
        return;
    }

    fetch('http://localhost:3001/api/meus-dados', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        let dataNasc = "";
        if (data.data_nascimento) {
            dataNasc = new Date(data.data_nascimento).toISOString().split('T')[0];
        }

        setFormData({
            ...data,
            data_nascimento: dataNasc,
            rua: data.rua || "",
            numero: data.numero || "",
            bairro: data.bairro || "",
            cidade: data.cidade || "",
            cep: data.cep || "",
            telefone: data.telefone || ""
        });
    })
    .catch(err => console.error("Erro ao carregar dados:", err));
  }, [navigate]);

  const handleCepBlur = (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    rua: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                }));
            }
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3001/api/meus-dados/atualizar', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rua: formData.rua,
                numero: formData.numero,
                bairro: formData.bairro,
                cidade: formData.cidade,
                cep: formData.cep,
                telefone: formData.telefone
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Dados atualizados com sucesso!");
        } else {
            alert(data.message || "Erro ao atualizar.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão.");
    }
  };

  return (
    <div style={{ backgroundColor: '#feeded', minHeight: '100vh' }}>
      <UpperBar items={[]} />
      
      <div className="container-conteudo-cadastro" style={{ marginTop: '20px', height: 'auto' }}>
        <form className="form-cad-fun" onSubmit={handleSubmit} style={{ height: 'auto' }}>
          <h1 className="title-group-func">Minhas Configurações</h1>

          <section className="sections-cad">
            <h2 className="title-group-func-label" style={{textAlign: 'center', marginBottom: '10px', color: '#666'}}>
                Dados Pessoais (Não editáveis)
            </h2>
            <div className="form-sections">
                <div className="input-groups-CadFun">
                    <label>Nome Completo</label>
                    <input className="inputs-Cad-Fun" value={`${formData.primeiro_nome} ${formData.sobrenome}`} disabled />
                </div>
                <div className="input-groups-CadFun">
                    <label>CPF</label>
                    <input className="inputs-Cad-Fun" value={formData.cpf} disabled />
                </div>
                <div className="input-groups-CadFun">
                    <label>Email</label>
                    <input className="inputs-Cad-Fun" value={formData.email} disabled />
                </div>
            </div>
          </section>

          <section className="sections-cad" style={{ marginTop: '20px', borderTop: '2px dashed #fca2a2', paddingTop: '20px' }}>
             <h2 className="title-group-func-label" style={{textAlign: 'center', marginBottom: '10px'}}>
                Endereço e Contato (Editáveis)
            </h2>
            
            <div className="form-sections">
                <div className="input-groups-CadFun">
                    <label>Telefone</label>
                    <input 
                        type="text" 
                        name="telefone"
                        className="inputs-Cad-Fun" 
                        value={formData.telefone} 
                        onChange={handleChange}
                        maxLength={15}
                    />
                </div>

                <div className="input-groups-CadFun">
                    <label>CEP</label>
                    <input 
                        type="text" 
                        name="cep"
                        className="inputs-Cad-Fun" 
                        value={formData.cep} 
                        onChange={handleChange}
                        onBlur={handleCepBlur}
                        maxLength={9}
                    />
                </div>

                <div className="input-groups-CadFun">
                    <label>Cidade</label>
                    <input 
                        type="text" 
                        name="cidade"
                        className="inputs-Cad-Fun" 
                        value={formData.cidade} 
                        onChange={handleChange}
                    />
                </div>

                 <div className="input-groups-CadFun">
                    <label>Bairro</label>
                    <input 
                        type="text" 
                        name="bairro"
                        className="inputs-Cad-Fun" 
                        value={formData.bairro} 
                        onChange={handleChange}
                    />
                </div>

                <div className="input-groups-CadFun">
                    <label>Logradouro</label>
                    <div className="logradouro-group">
                        <input 
                            type="text" 
                            name="rua"
                            className="inputs-Cad-Fun" 
                            value={formData.rua} 
                            onChange={handleChange}
                            placeholder="Rua"
                        />
                        <input 
                            type="text" 
                            name="numero"
                            className="inputs-Cad-Fun" 
                            value={formData.numero} 
                            onChange={handleChange}
                            placeholder="Nº"
                        />
                    </div>
                </div>
            </div>
          </section>

          <div className="form-actions" style={{ justifyContent: 'center', marginBottom: '30px' }}>
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Salvar Alterações"
              showImg="hidden"
              TypeBtn="submit"
            />
            <div style={{width: '20px'}}></div>
            <BtnCustomized
              size="medium"
              TypeText="strong"
              text="Voltar"
              variant="secondary" 
              showImg="hidden"
              TypeBtn="button"
              onClick={() => navigate(-1)}
            />
          </div>
        </form>
      </div>
    </div>
  );
}