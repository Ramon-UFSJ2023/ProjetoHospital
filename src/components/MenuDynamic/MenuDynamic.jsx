import "../styles/dynamicMenu.css";
import React from "react";
import PropTypes from "prop-types";

export default function MenuDynamic({ items, className = "" }) {
  if (!items || items.length === 0) {
    return null;
  }
  const menuClass = `nav-bar-top ${className}`;

  return (
    <nav className={menuClass}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href={item.url}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

MenuDynamic.prototype = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};
