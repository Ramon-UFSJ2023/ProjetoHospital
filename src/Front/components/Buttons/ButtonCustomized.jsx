import "./btn.css";

export default function BtnCustomized({
  size,
  TypeText,
  onClick,
  text,
  img,
  variant,
  showImg,
  TypeBtn
}) {
  const Class = ["btn", `btn-${size}`, `btn-${variant}`].join(" ");
  const ClassText = ["textBtn", `textBtn-${TypeText}`].join(" ");
  const ShowImg = ["img-btn", `img-btn-${showImg}`].join(" ");

  return (
    <button className={Class} onClick={onClick} type={TypeBtn}>
      <img src={img} alt="" className={ShowImg} />
      <p className={ClassText}>{text}</p>
    </button>
  );
}
