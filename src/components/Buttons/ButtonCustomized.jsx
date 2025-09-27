import "./btn.css";

export default function BtnCustomized({
  size,
  TypeText,
  onClick,
  text,
  img,
  variant,
  showImg,
}) {
  const Class = ["btn", `btn-${size}`, `btn-${variant}`].join(" ");
  const ClassText = ["textBtn", `textBtn-${TypeText}`].join(" ");
  const ShowImg = ["img-btn", `img-btn-${showImg}`].join(" ");

  return (
    <button className={Class} onClick={onClick}>
      <img src={img} alt="" className={ShowImg} />
      <p className={ClassText}>{text}</p>
    </button>
  );
}
