import Fog from "../Fog/Fog";

interface LibraryBackGroundProps {
  children: React.ReactNode;
}

const LibraryBackGround = ({ children }: LibraryBackGroundProps) => {
  return (
    <div
      className=" min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center py-12"
      
    >
      <Fog></Fog>
      <div className="relative w-full">
        <div className=" flex-col flex justify-center items-center gap-8 ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LibraryBackGround;
