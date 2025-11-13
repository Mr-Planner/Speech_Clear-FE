import { useState } from "react";


import Header from "../../components/Header";
import SideBar from "../../components/SideBar";

function HomePage() {
    // todo SideBar가리는 state
    // todo 유저 정보 State -> SideBar, Header에 전달
    const [userName, setUserName] = useState("정상현");
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <div className="flex flex-col h-screen">
            <Header className = "" userName={userName} setUserName = {setUserName}
                isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
            </Header>
            
            <SideBar></SideBar>
        </div>
    )   
}

export default HomePage;