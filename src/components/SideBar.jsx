import { useState } from "react";
import hideside from "../assets/sidebar/hideside.svg";

function SideBar() {
    const folderNames = ["수업", "동아리", "인턴"];

    const [isOpen, setIsOpen] = useState(false);
    const [speechFolderName, setSpeechFolderName] = useState(folderNames);
    // 모든 Speech 내부 배열은 DB에서 가져와야 함


    // 상태 적용
    return (
        <aside className="bg-colors-background-bg-secondary-medium">
            <button>
                <img src = {hideside}></img>
            </button>

            <nav>
                <details open>
                    <summary>모든 Speech</summary>
                    <ul>
                        <li><a href="/speech/lesson">수업</a></li>
                        <li><a href="/speech/club">동아리</a></li>
                        <li><a href="/speech/intern">인턴</a></li>
                    </ul>
                </details>

                 <ul>
                    <li><a href="/speech/trash">휴지통</a></li>
                </ul>

                <ul>
                    <li><a href="/speech/trash">설정</a></li>
                </ul>
            </nav>
        </aside>
    )
}

export default SideBar;