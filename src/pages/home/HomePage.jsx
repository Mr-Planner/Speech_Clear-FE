import { useState } from "react";


import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import HiddenSideBar from "../../components/HiddenSideBar";

function HomePage() {
    // todo 유저 정보 State -> SideBar, Header에 전달
    const [userName, setUserName] = useState("정상현");
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);

    // function
    const handleToggleSideBar = () => setIsSideBarOpen(prev => !prev);

    return (
        <div className="flex flex-col h-screen">
            <Header userName={userName} setUserName = {setUserName}
                isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
            </Header>
            
             <div className="flex flex-1 overflow-hidden">
                {   
                    isSideBarOpen ? <SideBar handleToggleSideBar={handleToggleSideBar}></SideBar> 
                        : <HiddenSideBar handleToggleSideBar={handleToggleSideBar}></HiddenSideBar>
                }
            </div>
        </div>
    )   
}

export default HomePage;