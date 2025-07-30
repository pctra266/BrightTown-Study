import Navbar from "../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;