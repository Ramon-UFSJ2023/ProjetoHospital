import "./cadastro.css"

export default function PageCadastro(){
    return (
        <div className="container">
            <h1 className="Title">Paciente</h1>
            <main className="page-Cadastro">
                <h2>Nome</h2>
                <input type="text" name="Nome" id="input-name" className="inputs"/>
            </main>
        </div>
    );
}