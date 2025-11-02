import { useState } from "react";
import angleRight from "../assets/sidebar/angle-right.svg";
import angleUp from "../assets/sidebar/angle-up.svg";
import archive from "../assets/sidebar/archive.svg";
import folderIcon from "../assets/sidebar/folder.svg";
import hideside from "../assets/sidebar/hideside.svg";
import overflowMenu from "../assets/sidebar/overflow-menu.svg";
import plus from "../assets/sidebar/plus.svg";
import setting from "../assets/sidebar/setting.svg";
import trash from "../assets/sidebar/trash.svg";


import { Link } from "react-router-dom";

// todo sideBar open여부는 HomePage가 소유 (props로 전달)
function SideBar() {
    // back : 아이디는 서버에서 받아야 (URL 용도)
    const folders = [{ id: crypto.randomUUID(), name: "수업" },
    { id: crypto.randomUUID(), name: "동아리" },
    { id: crypto.randomUUID(), name: "인턴" }];

    // state
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [isOverflowMenuBtnClicked, setIsOverflowMenuBtnClicked] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tempFolderName, setTempFolderName] = useState("");

    // speech 폴더명들
    // back :  모든 Speech 내부 배열은 DB에서 가져와야 함
    const [speechFolders, setSpeechFolders] = useState(folders);

    // function
    const toggleSideBar = () => {
        setIsSideBarOpen(prev => !prev);
    }

    const toggleFolders = () => {
        setIsFolderOpen(prev => !prev);
    }

    const addFolder = () => {
        setIsFolderOpen(true);
        const newFolderId = crypto.randomUUID();
        
        setSpeechFolders(prev => [{ id: newFolderId, name: "" }, ...prev]);
        setEditingId(newFolderId);
        setTempFolderName(""); // input 태그는 항상 비어있음
    }

    const saveFolderName = (targetId) => {
        const trimmed = tempFolderName.trim();

        if (trimmed === "") {
            alert("폴더 이름을 입력하세요");
            return;
        }

        if (speechFolders.some(folder => folder.name === trimmed)) {
            alert("중복된 폴더 이름입니다");
            return;
        }

        setSpeechFolders(prev =>
            prev.map(folder =>
            folder.id === targetId ? { ...folder, name: trimmed } : folder
            )
        );

        setEditingId(null);
        setTempFolderName("");
    };


    const cancelFolderName = (targetId) => {
        // targetId에 해당하는 SpeechFolder 삭제 
        setSpeechFolders(prev => prev.filter(folder => folder.id !== targetId));
        setEditingId(null); // 원래 id도 삭제
    }

    // 상태 적용
    return (
        <aside className="flex flex-col bg-gray-100 w-[250px] h-screen relative">
            <div className="flex justify-end p-2">
                <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick = {toggleSideBar}>
                    <img src = {hideside}></img>
                </button>
            </div>

            <nav>
                <ul className="flex flex-col gap-2 px-4">
                    <li className="flex flex-col gap-2 ">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 px-2">
                            <div className="flex gap-1.5 items-center">
                                <img src = {archive}></img>
                                <span>모든 Speech</span>
                            </div>

                            <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick = {addFolder} disabled = {editingId != null}>
                                <img src = {plus}></img>
                            </button>
                            <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick = {toggleFolders}>
                                <img src = {isFolderOpen ? angleUp : angleRight}></img>
                            </button> 
                        </div>       
                        
                        <ul className="flex flex-col gap-2 pl-6">
                            {isFolderOpen &&
                                speechFolders.map((folder) => (
                                    
                                <li key={folder.id} className="flex items-center w-full px-2 py-1">

                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">

                                        <img src={folderIcon} className="shrink-0" />

                                        {editingId === folder.id ? (
                                            <div className="flex items-center gap-2 flex-1 overflow-hidden flex-nowrap">

                                                <input
                                                autoFocus
                                                className="border rounded px-1 text-sm min-w-[100px] max-w-[150px] shrink"
                                                value={tempFolderName}
                                                onChange={(e) => setTempFolderName(e.target.value)}
                                                placeholder="폴더 이름"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        saveFolderName(folder.id);
                                                    }
                                                    if (e.key === "Escape") {
                                                        cancelFolderName(folder.id);
                                                    }
                                                }}
                                                />

                                                <div className="flex gap-1 shrink-0">
                                                        <button className="text-blue-600 text-xs hover:bg-gray-300 rounded cursor-pointer"
                                                            onClick={() => saveFolderName(folder.id)}>저장</button>
                                                        <button className="text-gray-500 text-xs hover:bg-gray-300 rounded cursor-pointer"
                                                            onClick={() => cancelFolderName(folder.id)}>취소</button>
                                                </div>

                                            </div>
                                        ) : (
                                        <Link to={`/speech/${folder.id}`} className="truncate max-w-[150px]">
                                            {folder.name}
                                        </Link>
                                        )}

                                    </div>

                                    {/* rename 중에는 메뉴 숨김 */}
                                    {editingId !== folder.id && (
                                        <button className="hover:bg-gray-300 rounded cursor-pointer ml-1 shrink-0">
                                        <img src={overflowMenu} />
                                        </button>
                                    )}
                                </li>


                                ))
                            }
                        </ul>
                    </li>
                        
                    <li className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 px-2">
                        <div className="flex gap-1.5 items-center">
                            <img src={trash} />
                            <Link to="/speech/trash">휴지통</Link>
                        </div>
                        <span></span>
                        <span></span>
                    </li>
                </ul>
            </nav>

            <div className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 px-6 absolute bottom-5">
                <div className="flex gap-1.5 items-center">
                    <img src={setting} />
                    <Link to="/settings">설정</Link>
                </div>
                <span></span>
                <span></span>
            </div>
        </aside>
    )
}

export default SideBar;