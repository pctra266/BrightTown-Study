import SkyIsland from "../assets/images/skyIsland.png";
import BackGround from "../components/Background/BackGround";
import Tower from "../components/Tower/Tower";
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  console.log(user);
  return (
    <div className="relative h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-blue-400 overflow-hidden p-4 flex flex-col gap-4 justify-center">
      <BackGround></BackGround>
      <div className="relative z-10">
        <div className="flex justify-center gap-16 h-[300px]">
          <Tower srcImage={SkyIsland} nameTower={"Library"} path={"/library"} ></Tower>
          <Tower srcImage={SkyIsland} nameTower={"Inspiration"} path={"/inspo"} ></Tower>
        </div>
        <div className="flex justify-center  gap-16 h h-[300px]">
          <Tower srcImage={SkyIsland} nameTower={"Discussion"} path={"/talk"} ></Tower>
          {user?.role === "1" && (
            <Tower srcImage={SkyIsland} nameTower={"Dashboard"} path={"/admin"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;