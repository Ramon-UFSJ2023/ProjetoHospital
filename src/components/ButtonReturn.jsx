import "../styles/btn.css"

export default function ButtunReturn({text, onClick}) {
  return (
    <form class="form-btn-return">
      <button type="button" clasName="btn-return" onClick={onClick}>
        <label htmlFor="" className="text-btn-return">
          {text}
        </label>
      </button>
    </form>
  );
}
