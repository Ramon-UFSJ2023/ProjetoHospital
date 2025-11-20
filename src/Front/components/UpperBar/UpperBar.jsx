import "./upperBar.css";
import lupaIcon from "../../assets/pesquisa.png";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; 

export default function UpperBar({ items, onMenuItemClick = () => {} }) {
  const navigate = useNavigate(); 
  const [userName, setUserName] = useState("Conta"); 

  useEffect(() => {
    const userString = localStorage.getItem('user');
    console.log("AAAAAAAAAAAAAAAAAAAAAA")
    console.log(userString)
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user.primeiro_nome) {
            setUserName(user.primeiro_nome);
        }
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage", e);
      }
    }
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  const elementsClass = "elements-second-navbar";
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); 
  };

  const handleProfileChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "config") {
      console.log("Usuário selecionou: Configurações de conta");
    } else if (selectedValue === "sair") {
      console.log("Usuário selecionou: Sair");
      logout(); 
    }
  };

  return (
    <nav className="topper-bar">
      <div className="search-container">
        <form action="" className="input-form">
          <img src={lupaIcon} alt="" className="lupa-search" />
          <input
            type="search"
            name=""
            className="bar-search"
            placeholder="Pesquise Aqui..."
          />
        </form>
      </div>

      <div className="profile-container">
        <select
          className="profile-select"
          onChange={handleProfileChange}
          value="conta" // Força o valor 'conta' para mostrar o nome como label principal
        >
          <option value="conta" disabled hidden> 
            {/* Mostra o nome do usuário aqui */}
            {userName}
          </option>
          <option value="config">Configurações de conta</option>
          <option value="sair">Sair</option>
        </select>
      </div>

      <div className="functions-bar">
        <ul className="group-elements-second-navbar">
          {items.map((item, index) => (
            <li
              key={index}
              className={elementsClass}
              onClick={() => onMenuItemClick(item.label)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

UpperBar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onMenuItemClick: PropTypes.func,
};