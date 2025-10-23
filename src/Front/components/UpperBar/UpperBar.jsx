import "./upperBar.css";
import lupaIcon from "../../assets/pesquisa.png";
import PropTypes from "prop-types";

export default function UpperBar({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  const elementsClass = "elements-second-navbar";

  return (
    <nav className="topper-bar">
      <div className="search-container">
        <div className="img-Teste"></div>
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

      <div className="functions-bar">
        <ul className="group-elements-second-navbar">
          {items.map((item, index) => (
            <li key={index} className={elementsClass}>
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
};
