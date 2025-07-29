interface TowerProp{
  srcImage:string,
  nameTower:string
}

const Tower:React.FC<TowerProp> = ({srcImage,nameTower}) => {
  return (
    <div className="relative h-full inline-block glow-on-hover">
    <div className="h-full inline-block">
      <img
        src={srcImage}
        alt={nameTower}
        className="h-full object-contain "
      />
      <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-4 py-1 text-lg font-bold text-shadow-stroke">
        {nameTower}
      </h2>
    </div>
  </div>
  )
}

export default Tower