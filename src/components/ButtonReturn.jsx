import "../styles/btn.css";

export default function ButtunReturn({ text, onClick }) {
  return (
    <form class="form-btn-return">
      <button type="button" className="btn-return" onClick={onClick}>
        <label htmlFor="" className="text-btn-return">
          {text}
        </label>
      </button>
    </form>
  );
}
