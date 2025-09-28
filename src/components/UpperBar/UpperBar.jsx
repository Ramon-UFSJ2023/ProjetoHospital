import "./upperBar.css";

export default function upperBar() {

  return (
    <nav className="topper-bar">
      <div className="search-container">
        <div className="img-Teste"></div>
        <form action="" className="input-form">
          <img src="../assets/pesquisa.png" alt="" className="lupa-search" />
          <input
            type="search"
            name=""
            className="bar-search"
            placeholder="Pesquise Aqui..."
          />
        </form>
      </div>

      <div className="functions-bar">
        <ul className="group-elements-second-navbar">
          <li class="elements-second-navbar" onclick="">
            Consultas
          </li>
          <li className="elements-second-navbar">Reservar</li>
          <li className="elements-second-navbar">Cirurgias</li>
          <li className="elements-second-navbar">Pacientes</li>
        </ul>
      </div>
    </nav>
  );
}
