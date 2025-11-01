import { useState } from "react";
import hideside from "../assets/sidebar/hideside.svg";
import angleRight from "../assets/sidebar/angle-right.svg";
import angleUp from "../assets/sidebar/angle-up.svg";
import plus from "../assets/sidebar/plus.svg";
import archive from "../assets/sidebar/archive.svg";
import folder from "../assets/sidebar/folder.svg";
import setting from "../assets/sidebar/setting.svg";
import trash from "../assets/sidebar/trash.svg";


import { Link } from "react-router-dom";

function SideBar() {
    const folderNames = ["수업", "동아리", "인턴"];

    // state
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [speechFolderNames, setSpeechFolderNames] = useState(folderNames);
    // 모든 Speech 내부 배열은 DB에서 가져와야 함

    // back : 폴더 이름에 따른 고유 식별자 (URL 용도)
    const folderName = "";

    // function
    const toggleSideBar = () => {
        setIsSideBarOpen(prev => !prev);
    }

    const toggleFolders = () => {
        setIsFolderOpen(prev => !prev);
    }


    // 상태 적용
    return (
        <aside className="bg-colors-background-bg-secondary-medium">
            <button onClick = {toggleSideBar}>
                <img src = {hideside}></img>
            </button>

            <nav>
                <ul>
                    <li>
                        <div>
                            <img src = {archive}></img>
                            <span>모든 Speech</span>
                            <button>
                                <img src = {plus}></img>
                            </button>
                            <button onClick = {toggleFolders}>
                                <img src = {isFolderOpen ? angleUp : angleRight}></img>
                            </button>   
                        </div>                        
                        <ul>
                            {isFolderOpen &&
                                speechFolderNames.map(name => (
                                    <li key={name}>
                                        <img src = {folder}></img>
                                        <Link to={`/speech/${folder.id}`}>
                                            {name}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </li>

                    <li>
                        <img src = {trash}></img>
                        <Link to = "/speech/trash">휴지통</Link> 
                    </li>

                    <li>
                        <img src = {setting}></img>
                        <Link to = "/settings">설정</Link> 
                    </li>
                </ul>
                
            </nav>
        </aside>
    )
}

export default SideBar;