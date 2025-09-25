export default function Btn({ id, icon, text, onClick }) {
  return (
    <button id={id} className="btn" onClick={onClick}>
      <img src={icon} alt="" className="img-btn" />
      <p className="text-btn">{text}</p>
    </button>
  );
}
