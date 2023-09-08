import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import SideBar from "../components/SideBar/SideBar";

const Main = () => {
  return (
    <>
      <Header />
      <SideBar />
      <div id="main-app" >
        <Outlet />
      </div>
    </>
  );
};

export default Main;
