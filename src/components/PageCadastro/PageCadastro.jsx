import "./cadastro.css";
import BtnCustomized from "../Buttons/ButtonCustomized"

export default function PageCadastro() {
  return (
    <div className="container">
      <h1 class="Title">Paciente</h1>
      <form class="page-cadastro" action="/cadastro" method="post">
        <div class="inputs-groups">
          <label for="nome">Nome</label>
          <input type="text" name="Nome" id="input-name" class="inputs" />
        </div>

        <div class="inputs-groups">
          <label for="CPF">CPF</label>
          <input type="number" name="Nome" id="input-cpf" class="inputs" />
        </div>

        <div class="inputs-groups">
          <label for="date-born">Data de Nascimento</label>
          <input type="date" name="" id="input-date" class="inputs" />
        </div>

        <div class="inputs-groups">
          <label for="text">Telefone</label>
          <input type="tel" name="Nome" id="input-name" class="inputs" />
        </div>

        <div class="inputs-groups">
          <label for="Email">Email</label>
          <input type="text" name="" id="" class="inputs" />
        </div>

        <div class="inputs-groups">
          <label for="password">Password</label>
          <input type="password" name="Senha-cliente" id="" class="inputs" />
        </div>
      </form>
    </div>
  );
}
