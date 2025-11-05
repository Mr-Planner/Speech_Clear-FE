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
// todo 설정은 화면 기준으로 보이게 (바닥에서 몇 %)
function SideBar() {
    // back : 아이디는 서버에서 받아야 (URL 용도)
    const folders = [{ id: crypto.randomUUID(), name: "수업" },
    { id: crypto.randomUUID(), name: "동아리" },
    { id: crypto.randomUUID(), name: "인턴" }];
    
    // state
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [tempFolderName, setTempFolderName] = useState("");
    // 기존 폴더 수정, 삭제용 state
    const [renamingId, setRenamingId] = useState(null); 


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
        setAddingId(newFolderId);
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

    const saveRename = (id) => {
        const trimmed = tempFolderName.trim();
        if (!trimmed) return alert("폴더 이름을 입력하세요");
        if (speechFolders.some(f => f.name === trimmed && f.id !== id))
            return alert("중복된 이름입니다");

        setSpeechFolders(prev =>
            prev.map(f => f.id === id ? { ...f, name: trimmed } : f)
        );

        setRenamingId(null);
        setTempFolderName("");
    };

    const cancelRename = () => {
        setRenamingId(null); 
        setTempFolderName("");
    };

    const deleteFolder = (id) => {
        setSpeechFolders(prev => prev.filter(f => f.id !== id)); 
        setEditingId(null); // 메뉴 닫기
    };

    


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

                            <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick = {addFolder} disabled = {addingId != null}>
                                <img src = {plus}></img>
                            </button>
                            <button className = "hover:bg-gray-300 rounded cursor-pointer" onClick = {toggleFolders}>
                                <img src = {isFolderOpen ? angleUp : angleRight}></img>
                            </button> 
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
                                                    className="text-blue-600 text-xs hover:bg-gray-300 rounded"
                                                    onClick={() => saveFolderName(folder.id)}
                                                >
                                                저장
                                                </button>
                                                <button
                                                    className="text-gray-500 text-xs hover:bg-gray-300 rounded"
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
                                            <Link to={`/speech/${folder.id}`} className="truncate max-w-[150px] ">
                                                {folder.name}
                                            </Link>
                                        </div>
                                    );
                                }

                                return (
                                    <li key={folder.id} className="flex items-center w-full px-2 py-1">

                                        
                                        <img src={folderIcon} className="shrink-0 mr-2" />

                                        
                                        {content}

                                        {/* 오른쪽 메뉴 버튼 */}
                                        <div className="relative shrink-0">

                                        
                                        {(!isAdding && !isRenaming) && (
                                            <button
                                                className="hover:bg-gray-300 rounded cursor-pointer ml-1 p-1.5"
                                                onClick={() => modifyFolder(folder.id)}
                                            >
                                            <img src={overflowMenu} className="pointer-events-none" />
                                            </button>
                                        )}

                                        {/* 메뉴 열린 경우 */}
                                        {isMenuOpen && (
                                            <div className="absolute top-full right-0 mt-1 z-50 translate-x-[55px] -translate-y-[2px] flex flex-col
                                                            bg-gray-200 border shadow-sm rounded text-sm w-[50px]">
                                            <button
                                                className="px-2 py-1 hover:bg-gray-300 cursor-pointer"
                                                onClick={() => startRename(folder.id, folder.name)} // rename 시작
                                            >
                                                수정
                                            </button>
                                            <button
                                                className="px-2 py-1 hover:bg-gray-300 cursor-pointer"
                                                onClick={() => deleteFolder(folder.id)} // 삭제
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

                            {
                                // isFolderOpen &&
                                // speechFolders.map((folder) => (
                                
                                    
                                // <li key={folder.id} className="flex items-center w-full px-2 py-1">

                                //     <div className="flex items-center gap-2 flex-1">

                                //         <img src={folderIcon} className="shrink-0" />

                                //         {addingId === folder.id ? (
                                //             <div className="flex items-center gap-2 flex-1 overflow-hidden flex-nowrap">

                                //                 <input
                                //                 autoFocus
                                //                 className="border rounded px-1 text-sm min-w-[100px] max-w-[150px] shrink"
                                //                 value={tempFolderName}
                                //                 onChange={(e) => setTempFolderName(e.target.value)}
                                //                 placeholder="폴더 이름"
                                //                 onKeyDown={(e) => {
                                //                     if (e.key === "Enter") {
                                //                         saveFolderName(folder.id);
                                //                     }
                                //                     if (e.key === "Escape") {
                                //                         cancelFolderName(folder.id);
                                //                     }
                                //                 }}
                                //                 />

                                //                 <div className="flex gap-1 shrink-0">
                                //                         <button className="text-blue-600 text-xs hover:bg-gray-300 rounded cursor-pointer"
                                //                             onClick={() => saveFolderName(folder.id)}>저장</button>
                                //                         <button className="text-gray-500 text-xs hover:bg-gray-300 rounded cursor-pointer"
                                //                             onClick={() => cancelFolderName(folder.id)}>취소</button>
                                //                 </div>

                                //             </div>
                                //         ) : (
                                //         <Link to={`/speech/${folder.id}`} className="truncate max-w-[150px]">
                                //             {folder.name}
                                //         </Link>
                                //         )}
                                            

                                //     </div>

                                //     <div className="relative">
                                //         {/* rename시에는 메뉴 버튼 안보이게 */}
                                //         {
                                //             (addingId !== folder.id) && (
                                //             <button 
                                //                 className="hover:bg-gray-300 rounded cursor-pointer ml-1 shrink-0 p-1.5"
                                //                 onClick={() => modifyFolder(folder.id)}
                                //             > 
                                //                 <img src={overflowMenu} className="pointer-events-none"/>
                                //             </button>
                                //             )
                                //         }

                                //         {
                                //             editingId === folder.id && (
                                //                     <div className="absolute top-full right-0 mt-1 z-50 translate-x-[55px] -translate-y-[2px] flex flex-col 
                                //                                   bg-gray-200 border shadow-sm rounded text-sm w-[50px]">
                                //                     <button className="px-2 py-1 hover:bg-gray-300 cursor-pointer">수정</button>
                                //                     <button className="px-2 py-1 hover:bg-gray-300 cursor-pointer">삭제</button>
                                //                 </div>
                                //             )
                                //         }
                                //     </div>

                                // </li>
                                // ))
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