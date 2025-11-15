import hideside from "../assets/sidebar/hideside.svg";
import setting from "../assets/sidebar/setting.svg";

import { Link } from "react-router-dom";

function HiddenSideBar({ handleToggleSideBar }) {

    return (
        <aside className="flex flex-col justify-between bg-gray-50 w-10 items-center">
            <button className = "hover:bg-gray-300 rounded cursor-pointer p-1" onClick={handleToggleSideBar}>
                    <img src = {hideside} alt = "사이드바 열기"></img>
            </button>

            <Link
                to="/settings"
                className="p-1 flex gap-1.5 items-center min-h-8 hover:bg-gray-200 rounded cursor-pointer"
            >
                <img src={setting} alt="설정 아이콘"></img>
            </Link>
        </aside>
    )
}

export default HiddenSideBar;