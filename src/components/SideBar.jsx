import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import angleRight from "../assets/sidebar/angle-right.svg";
import angleUp from "../assets/sidebar/angle-up.svg";
import archive from "../assets/sidebar/archive.svg";
import folderIcon from "../assets/sidebar/folder.svg";
import hideside from "../assets/sidebar/hideside.svg";
import overflowMenu from "../assets/sidebar/overflow-menu.svg";
import plus from "../assets/sidebar/plus.svg";
import setting from "../assets/sidebar/setting.svg";
import trash from "../assets/sidebar/trash.svg";

import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from "../store/auth/authStore";
import { useFolderStore } from "../store/folder/folderStore";

// todo 폴더 선택별 SpeechItem 컴포넌드들 선택 
function SideBar({handleToggleSideBar}) {
    const navigate = useNavigate();

    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const { folders, fetchFolders, addFolder: storeAddFolder,
        updateFolder: storeUpdateFolder, deleteFolder: storeDeleteFolder } = useFolderStore(
        useShallow((state) => ({
            folders: state.folders,
            fetchFolders: state.fetchFolders,
            addFolder: state.addFolder,
            updateFolder: state.updateFolder,
            deleteFolder: state.deleteFolder,
        }))
    );

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);
    
    // state
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [tempFolderName, setTempFolderName] = useState("");
    // 기존 폴더 수정, 삭제용 state
    const [renamingId, setRenamingId] = useState(null); 

    // function
    const handleNavigation = (path) => {
        if (isLoggedIn) {
            navigate(path);
        } else {
            navigate("/login");
        }
    };

    const toggleFolders = async() => {
        setIsFolderOpen(prev => !prev);
        setAddingId(null);
        setEditingId(null); // 수정/삭제 버튼 안뜨도록 
        setRenamingId(null);
        setTempFolderName("");

    }

    // 폴더 추가 시에 임시 입력칸을 만드는 함수
    const addFolder = () => {
        setIsFolderOpen(true);
        setAddingId("temp-new-id"); // 임시 ID
        setTempFolderName(""); 
    }

    const saveFolderName = async () => {
        const trimmed = tempFolderName.trim();

        if (trimmed === "") {
            alert("폴더 이름을 입력하세요");
            return;
        }

        if (folders.some(folder => folder.name === trimmed)) {
            alert("중복된 폴더 이름입니다");
            return;
        }

        try {
            // 서버에 폴더 추가 요청
            await storeAddFolder(trimmed);
            setAddingId(null);
            setTempFolderName("");
        } catch (e) {
            console.error(e);
            alert("폴더 추가 실패");
        }
    };

    const cancelFolderName = () => {
        setAddingId(null); 
        setTempFolderName("");
    }

    const modifyFolder = (targetId) => {
        // 한번 더 클릭하면 안보이도록
        setEditingId(prev => prev===targetId ? null : targetId);
        
    }

    const startRename = (targetId, currentName) => {
        setRenamingId(targetId);          
        setEditingId(null);         
        setTempFolderName(currentName); // 기존 이름 input에 넣음
    }

    const saveRename = async (id) => {
        const trimmed = tempFolderName.trim();
        if (!trimmed) return alert("폴더 이름을 입력하세요");

        if (folders.some(folder => folder.name === trimmed && folder.id !== id))
            return alert("중복된 이름입니다");

        try {
            await storeUpdateFolder(id, trimmed);
            setRenamingId(null);
            setTempFolderName("");
        } catch (e) {
            console.error(e);
            alert("폴더 수정 실패");
        }
    };

    const cancelRename = () => {
        setRenamingId(null); 
        setTempFolderName("");
    };

    const deleteFolder = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await storeDeleteFolder(id);
            setEditingId(null); 
        } catch (e) {
            console.error(e);
            alert("폴더 삭제 실패");
        }
    };


    // 상태 적용
    return (
        <aside className="flex flex-col bg-gray-100 w-[250px] h-full relative">
            <div className="flex justify-end p-2">
            <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick={handleToggleSideBar}>
                    <img src = {hideside} alt = "사이드바 닫기"></img>
            </button>
            </div>

            <nav>
                <ul className="flex flex-col gap-2 px-4">
                    <li className="flex flex-col gap-2 ">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 pl-2 pr-0.5">
                            <div className="flex gap-1.5 items-center">
                                <img src = {archive}></img>
                                <span>모든 Speech</span>
                            </div>
                            <div className = "flex justify-center gap-0.5">
                                <button className = "hover:bg-gray-300 rounded cursor-pointer p-1 w-7 h-7 flex items-center justify-center" onClick = {addFolder} disabled = {addingId != null}>
                                    <img src = {plus} alt = "폴더 추가"></img>
                                </button>
                                <button className = "hover:bg-gray-300 rounded cursor-pointer p-1 w-7 h-7 flex items-center justify-center" onClick = {toggleFolders}>
                                    <img src = {isFolderOpen ? angleUp : angleRight} alt = "폴더 열기/닫기"></img>
                                </button> 
                            </div>
                            
                        </div>       
                        
                        <ul className="flex flex-col gap-2 pl-6">
                            {isFolderOpen && (
                                <>
                                    {addingId && (
                                        <li className="flex items-center w-full px-0.5 py-1 min-h-8 cursor-pointer hover:bg-gray-200">
                                            <img src={folderIcon} className="shrink-0 mr-2" alt = "폴더"/>
                                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                <input
                                                    autoFocus
                                                    className="border rounded px-1 text-sm min-w-[100px] max-w-[150px] shrink"
                                                    value={tempFolderName}
                                                    onChange={(e) => setTempFolderName(e.target.value)}
                                                    placeholder="폴더 이름"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveFolderName();
                                                        if (e.key === "Escape") cancelFolderName();
                                                    }}
                                                />
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        className="text-blue-600 text-xs cursor-pointer hover:bg-gray-300 rounded"
                                                        onClick={saveFolderName}
                                                    >
                                                    저장
                                                    </button>
                                                    <button
                                                        className="text-gray-500 text-xs cursor-pointer hover:bg-gray-300 rounded"
                                                        onClick={cancelFolderName}
                                                    >
                                                    취소
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )}

                                    {folders.map((folder) => {
                                        const isRenaming = renamingId === folder.id;  
                                        const isMenuOpen = editingId === folder.id;

                                        let content;

                                        // 기존 폴더 이름 수정 
                                        if (isRenaming) {
                                            content = (
                                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                <input
                                                    autoFocus
                                                    className="border rounded px-1 text-sm min-w-[100px] max-w-[150px] shrink"
                                                    value={tempFolderName}
                                                    onChange={(e) => setTempFolderName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveRename(folder.id);
                                                    if (e.key === "Escape") cancelRename();
                                                    }}
                                                />
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                    className="text-blue-600 text-xs hover:bg-gray-300 rounded"
                                                    onClick={() => saveRename(folder.id)}
                                                    >
                                                    저장
                                                    </button>
                                                    <button
                                                    className="text-gray-500 text-xs hover:bg-gray-300 rounded"
                                                    onClick={cancelRename}
                                                    >
                                                    취소
                                                    </button>
                                                </div>
                                                </div>
                                            );
                                        }
                                        // 기본 폴더명
                                        else {
                                            content = (
                                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                    <span  className="truncate max-w-[150px] ">
                                                        {folder.name}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <li
                                                key={folder.id}
                                                className="flex items-center w-full px-0.5 py-1 min-h-8 cursor-pointer hover:bg-gray-200"
                                                onClick={() => {
                                                    if (!isRenaming && !isMenuOpen) {
                                                        navigate(`/speech/${folder.id}`); // 폴더 이동 
                                                    }
                                                }}
                                                >
                                                <img src={folderIcon} className="shrink-0 mr-2" alt = "폴더"/>

                                                {content}

                                                <div className="relative shrink-0 flex items-center h-full">

                                                    {!isRenaming && (
                                                    <button
                                                        className="hover:bg-gray-300 rounded cursor-pointer px-2 flex items-center justify-center h-[75%]"

                                                        onClick={(e) => {
                                                        e.stopPropagation();   // 해당 폴더이름으로 이동 방지
                                                        modifyFolder(folder.id);
                                                        }}
                                                    >
                                                        <img src={overflowMenu} className="pointer-events-none w-3 h-3 " alt = "폴더 수정"/>
                                                    </button>
                                                    )}

                                                    {isMenuOpen && (
                                                    <div
                                                        className="absolute top-full right-0 mt-1 z-50 flex flex-col translate-x-[55px] -translate-y-0.5
                                                                bg-gray-200 border shadow-sm rounded text-sm w-[60px]"
                                                        onClick={(e) => e.stopPropagation()} //  해당 폴더이름으로 이동 방지
                                                    >
                                                        <button
                                                            className="px-2 py-1 hover:bg-gray-300 cursor-pointer"
                                                            onClick={() => startRename(folder.id, folder.name)}
                                                        >
                                                        수정
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 hover:bg-gray-300 cursor-pointer"
                                                            onClick={() => deleteFolder(folder.id)}
                                                        >
                                                        삭제
                                                        </button>
                                                    </div>
                                                    )}

                                                </div>
                                            </li>
                                            );
                                    })}
                                </>
                            )}
                        </ul>
                    </li>
                        
                    <li className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 px-2">
                        <div 
                            className="flex gap-1.5 items-center min-h-8 hover:bg-gray-200 rounded cursor-pointer" 
                            onClick={() => handleNavigation("/speech/trash")}
                        >
                            <img src={trash} alt = "휴지통"/>
                            <span>휴지통</span>
                        </div>
                        <span></span>
                        <span></span>
                    </li>
                </ul>

                <ul className="px-4 absolute bottom-5 left-0 w-full">
                    <li className="grid grid-cols-[1fr_auto_auto] items-center w-full h-9 px-2">
                        <div
                            onClick={() => handleNavigation("/settings")}
                            className="flex gap-1.5 items-center min-h-8 hover:bg-gray-200 rounded cursor-pointer"
                        >
                            <img src={setting} alt="설정" />
                            <span>설정</span>
                        </div>
                        <span></span>
                        <span></span>
                    </li>
                </ul>
            </nav>

           
        </aside>
    )
}

export default SideBar;