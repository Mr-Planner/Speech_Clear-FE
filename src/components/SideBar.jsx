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
import { createFolder, deleteFolderById, fetchFolders, updateFolder } from "../service/folderApi";

import { useAuthStore } from "../store/auth/authStore";

// todo 서버 통신 : 폴더 불러오기, 추가 / 수정 / 삭제 작업 서버와 통신
// todo 폴더 선택별 SpeechItem 컴포넌드들 선택 
function SideBar({handleToggleSideBar}) {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        const loadFolders = async () => {
            const data = await fetchFolders();
            setSpeechFolders(data);
        };
        loadFolders();
    }, []);
    
    // state
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [tempFolderName, setTempFolderName] = useState("");
    // 기존 폴더 수정, 삭제용 state
    const [renamingId, setRenamingId] = useState(null); 

    // speech 폴더명들
    const [speechFolders, setSpeechFolders] = useState([]);

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

        // toggle 버튼 클릭 시 동작 중인 폴더 추가, 수정, 삭제 rollback
        if (addingId) {
            // 서버에서도 삭제
            await deleteFolderById(addingId);

            // 클라이언트에서도 삭제 (리스트에서 제거)
            setSpeechFolders(prev => prev.filter(folder => folder.id !== addingId));
        }

        setAddingId(null);
        setEditingId(null); // 수정/삭제 버튼 안뜨도록 
        setRenamingId(null);
        setTempFolderName("");

    }

    // 폴더 추가 시에 임시 입력칸을 만드는 함수
    const addFolder = () => {
        setIsFolderOpen(true);
        const newFolderId = crypto.randomUUID();
        
        setSpeechFolders(prev => [{ id: newFolderId, name: "" }, ...prev]);
        setAddingId(newFolderId);
        setTempFolderName(""); // input 태그는 항상 비어있음
    }

    const saveFolderName = async (targetId) => {
        const trimmed = tempFolderName.trim();

        if (trimmed === "") {
            alert("폴더 이름을 입력하세요");
            return;
        }

        if (speechFolders.some(folder => folder.name === trimmed)) {
            alert("중복된 폴더 이름입니다");
            return;
        }

        const newFolder = await createFolder(trimmed);

        setSpeechFolders(prev => prev.map(f =>
        f.id === targetId ? newFolder : f
        ));

        setAddingId(null);
        setTempFolderName("");
    };


    const cancelFolderName = (targetId) => {
        // targetId에 해당하는 SpeechFolder 삭제 
        setSpeechFolders(prev => prev.filter(folder => folder.id !== targetId));
        setAddingId(null); // 원래 id도 삭제
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

        if (speechFolders.some(folder => folder.name === trimmed && folder.id !== id))
            return alert("중복된 이름입니다");

        const updated = await updateFolder(id, trimmed);
        setSpeechFolders(prev => prev.map(folder => folder.id === id ? updated : folder));

        setRenamingId(null);
        setTempFolderName("");
    };

    const cancelRename = () => {
        setRenamingId(null); 
        setTempFolderName("");
    };

    const deleteFolder = async (id) => {
        const ok = await deleteFolderById(id);

        if (ok) setSpeechFolders(prev => prev.filter(folder => folder.id !== id)); 
        setEditingId(null); // 메뉴 닫기
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
                            {isFolderOpen &&
                            speechFolders.map((folder) => {

                                const isAdding = addingId === folder.id;
                                const isRenaming = renamingId === folder.id;  
                                const isMenuOpen = editingId === folder.id;

                                let content;

                                // 새 폴더 생성 
                                if (isAdding) {
                                    content = (
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <input
                                                autoFocus
                                                className="border rounded px-1 text-sm min-w-[100px] max-w-[150px] shrink"
                                                value={tempFolderName}
                                                onChange={(e) => setTempFolderName(e.target.value)}
                                                placeholder="폴더 이름"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveFolderName(folder.id);
                                                    if (e.key === "Escape") cancelFolderName(folder.id);
                                                }}
                                            />
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    className="text-blue-600 text-xs cursor-pointer hover:bg-gray-300 rounded"
                                                    onClick={() => saveFolderName(folder.id)}
                                                >
                                                저장
                                                </button>
                                                <button
                                                    className="text-gray-500 text-xs cursor-pointer hover:bg-gray-300 rounded"
                                                    onClick={() => cancelFolderName(folder.id)}
                                                >
                                                취소
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                                // 기존 폴더 이름 수정 
                                else if (isRenaming) {
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
                                            if (!isAdding && !isRenaming && !isMenuOpen) {
                                                navigate(`/speech/${folder.id}`); // 폴더 이동 
                                            }
                                        }}
                                        >
                                        <img src={folderIcon} className="shrink-0 mr-2" alt = "폴더"/>

                                        {content}

                                        <div className="relative shrink-0 flex items-center h-full">

                                            {(!isAdding && !isRenaming) && (
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
                            })
                            }
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