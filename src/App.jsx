import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import HiddenSideBar from "./components/HiddenSideBar";

function App() {

  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const handleToggleSideBar = () => setIsSideBarOpen(prev => !prev);

  return (
    <div className="flex flex-col h-screen">
      <Header/>

      <div className="flex flex-1">
        {isSideBarOpen 
          ? <SideBar handleToggleSideBar={handleToggleSideBar} />
          : <HiddenSideBar handleToggleSideBar={handleToggleSideBar} />
        }

        <div className="flex-1 overflow-y-auto">
          <Outlet />  
        </div>
      </div>
    </div>
  );
}

export default App;
