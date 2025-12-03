import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFolder, FaXmark } from "react-icons/fa6";
import { useShallow } from 'zustand/react/shallow';
import { useFolderStore } from '../store/folder/folderStore';

// todo 저장 후 redirect (완성된 녹음본으로) + 로딩률 보여주기 
const SavePopup = ({ isOpen, onClose, onSave, uploadProgress }) => {
  const { folders, fetchFolders } = useFolderStore(
    useShallow((state) => ({
      folders: state.folders,
      fetchFolders: state.fetchFolders,
    }))
  );
  const [speechTitle, setSpeechTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(0);
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setSpeechTitle("");
      setSelectedFolderId(0);
      setIsFolderDropdownOpen(false);
    }
  }, [isOpen, fetchFolders]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!speechTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    // 0(모든 Speech) 또는 특정 폴더 ID 전송
    onSave(speechTitle, selectedFolderId);
    // onClose는 상위 컴포넌트(RecordingPage)에서 성공 시 처리하거나,
    // 여기서 닫지 않고 로딩바를 보여줌.
  };

  const selectedFolderName = selectedFolderId === 0 
    ? "모든 Speech" 
    : folders.find(f => f.id === selectedFolderId)?.name || "선택하세요";

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-[600px] relative shadow-lg">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
          disabled={uploadProgress > 0} // 업로드 중 닫기 방지
        >
          <FaXmark className="text-2xl" />
        </button>

        <div className="flex flex-col gap-8 mt-4 px-4">
          {/* Title Input */}
          <div className="flex items-center gap-4">
            <label className="text-2xl font-bold min-w-[100px]">제목 :</label>
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={speechTitle}
              onChange={(e) => setSpeechTitle(e.target.value)}
              className="text-2xl text-gray-500 placeholder-gray-300 outline-none flex-1"
              autoFocus
              disabled={uploadProgress > 0}
            />
          </div>

          {/* Folder Selection */}
          <div className="flex items-start gap-4">
            <label className="text-2xl font-bold min-w-[100px] pt-1">저장위치 :</label>
            <div className="relative">
              <button 
                onClick={() => !uploadProgress && setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                className={`flex items-center justify-between gap-2 bg-gray-200 px-4 py-2 rounded-lg min-w-[200px] text-lg text-gray-700 transition-colors ${uploadProgress > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 cursor-pointer'}`}
                disabled={uploadProgress > 0}
              >
                <div className="flex items-center gap-2">
                  <FaFolder />
                  <span>{selectedFolderName}</span>
                </div>
                {isFolderDropdownOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
              </button>

              {/* Dropdown Menu */}
              {isFolderDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedFolderId(0);
                      setIsFolderDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-gray-700 cursor-pointer"
                  >
                    <FaFolder className="text-gray-500" />
                    <span>모든 Speech</span>
                  </button>

                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setIsFolderDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-left text-gray-700 cursor-pointer"
                    >
                      <FaFolder className="text-gray-500" />
                      <span>{folder.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar or Save Button */}
        <div className="flex justify-end mt-12 px-4">
          {uploadProgress > 0 ? (
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-[#4687e1]">업로드 중...</span>
                <span className="text-sm font-medium text-[#4687e1]">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#4687e1] h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleConfirm}
              className="bg-[#7DCC74] hover:bg-[#66BB6A] cursor-pointer text-white text-xl font-bold px-8 py-3 rounded-xl transition-colors shadow-md"
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavePopup;
