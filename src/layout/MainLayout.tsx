import Navbar from "../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main className="relative top-15">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;