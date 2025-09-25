import imgCentral from "../assets/BannerCentral.svg";
import SmallLogoHospital from "../assets/LogoHospital.png"

export default function LeftSide() {
  return (
    <aside className="painel-Left">
      <header id="header-Painel">
        <img src={SmallLogoHospital} alt="" className="SmallLogoHospital"/>
        <h1 className="title" id="title-Left">
          MARX ENGELS <br></br>HOSPITAL
        </h1>
      </header>
      <div className="img-SVG">
        <img src={imgCentral} alt="" id="img-login-screen" />
      </div>
    </aside>
  );
}
