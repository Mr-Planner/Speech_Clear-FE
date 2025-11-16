import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import HiddenSideBar from "./components/HiddenSideBar";

function App() {
  const [userName, setUserName] = useState("정상현");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const handleToggleSideBar = () => setIsSideBarOpen(prev => !prev);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        userName={userName}
        setUserName={setUserName}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="flex flex-1">
        {isSideBarOpen 
          ? <SideBar handleToggleSideBar={handleToggleSideBar} />
          : <HiddenSideBar handleToggleSideBar={handleToggleSideBar} />
        }

        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ userName, isLoggedIn }} />  
        </div>
      </div>
    </div>
  );
}

export default App;
