import FogImg from "../../assets/images/Fog.png";
import "./Fog.css"

const Fog = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <img src={FogImg} className="absolute left-[70%] w-[350px] animate-fog2 opacity-10" />
      <img src={FogImg} className="absolute left-[75%] w-[350px] animate-fog5 opacity-10" />
      <img src={FogImg} className="fixed top-[55%] left-[-15%] w-[1000px] opacity-15 animate-fogHero" />
    </div>
  );
};

export default Fog;
