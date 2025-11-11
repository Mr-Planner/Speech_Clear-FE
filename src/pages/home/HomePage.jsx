import { useEffect, useState } from "react";


import SideBar from "../../components/SideBar";
import Header from "../../components/Header";

function HomePage() {
    // todo SideBar 가리는 state
    // todo 유저 정보 State -> SideBar, Header에 전달
    const [userName, setUserName] = useState("정상현");
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <div className="">
            <Header className = "" userName={userName} setUserName = {setUserName}
                isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}></Header>
            <SideBar></SideBar>
        </div>
    )
}

export default HomePage;