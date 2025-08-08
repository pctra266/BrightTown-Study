import SkyIsland from "../assets/images/skyIsland.png";
import BackGround from "../components/Background/BackGround";
import Tower from "../components/Tower/Tower";
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="relative top-15 min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-blue-400 overflow-hidden p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 justify-center">
  <BackGround></BackGround>
  <div className="relative z-10 w-full max-w-6xl mx-auto">
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 lg:gap-16 mb-4 sm:mb-8">
      <div className="w-full sm:w-auto flex justify-center">
        <Tower 
          srcImage={SkyIsland} 
          nameTower={"Library"} 
          path={"/library"}
        />
      </div>
      <div className="w-full sm:w-auto flex justify-center">
        <Tower 
          srcImage={SkyIsland} 
          nameTower={"Exhibition"} 
          path={"/manage-book"}
        />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 lg:gap-16">
      <div className="w-full sm:w-auto flex justify-center">
        <Tower 
          srcImage={SkyIsland} 
          nameTower={"Discussion"} 
          path={"/talk"}
        />
      </div>
      {(user?.role === "1" || user?.role === "0") && (
        <div className="w-full sm:w-auto flex justify-center">
          <Tower 
            srcImage={SkyIsland} 
            nameTower={"Dashboard"} 
            path={"/admin"}
          />
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default Home;