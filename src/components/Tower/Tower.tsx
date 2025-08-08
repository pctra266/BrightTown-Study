import { Link } from "react-router-dom";
import { useThemeMode } from '../../contexts/ThemeContext'; 

interface TowerProp{
  srcImage:string,
  nameTower:string,
  path:string
}

const Tower:React.FC<TowerProp> = ({srcImage,nameTower,path}) => {
  const { actualTheme } = useThemeMode();
  return (
    <div className="relative inline-block glow-on-hover h-[300px]">
    <Link to={path} className="h-full inline-block">
      <img
        src={srcImage}
        alt={nameTower}
        className={`h-full object-contain ${actualTheme === 'dark'?"brightness-85":"" } `}
      />
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-4 py-1 text-lg font-bold text-shadow-stroke">
        {nameTower}
      </h2>
    </Link>
  </div>
  )
}

export default Tower