import "../styles/btn.css"

export default function BtnCustomized({size, TypeText, onClick, text, img, variant}){

    const Class = [
        'btn',
        `btn-${size}`,
        `btn-${variant}`
    ].join(' ')
    const ClassText = [
        'textBtn',
        `textBtn-${TypeText}`
    ].join(' ')

    return (
        <button className={Class} onClick={onClick}>
            <img src={img} alt="" className="img-btn"/>
            <p className={ClassText}>{text}</p>
        </button>
    );
}