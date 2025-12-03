import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HiddenSideBar from "./components/HiddenSideBar";
import SideBar from "./components/SideBar";

function App() {

  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const location = useLocation(); // 현재 path 경로 정보 가져오기
  const hideSidebarPaths = ["/login", "/sign-up", "/recording"];
  const showSideBar = !hideSidebarPaths.includes(location.pathname);

  const handleToggleSideBar = () => setIsSideBarOpen(prev => !prev);

  return (
    <div className="flex flex-col h-screen">
      <Header/>

      <div className="flex flex-1 overflow-hidden">
        {showSideBar&& (isSideBarOpen
          ? <SideBar handleToggleSideBar={handleToggleSideBar} />
          : <HiddenSideBar handleToggleSideBar={handleToggleSideBar} />
        )}

        <div className="flex-1 overflow-y-auto">
          <Outlet />  
        </div>
      </div>
    </div>
  );
}

export default App;
