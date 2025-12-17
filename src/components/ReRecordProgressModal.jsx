
const ReRecordProgressModal = ({ 
    isOpen, 
    progress, 
    onClose, 
    title = "재녹음 분석 중...", 
    description = "잠시만 기다려주세요.\n서버에서 음성을 분석하고 있습니다." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-3xl p-8 w-[500px] relative shadow-lg flex flex-col items-center">
        {/* Close Button (Optional: Disable during processing) */}
        {/* <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
          disabled={progress < 100}
        >
          <FaXmark className="text-2xl" />
        </button> */}

        <h3 className="text-2xl font-bold text-gray-900 mb-8">
            {progress < 100 ? title : "완료!"}
        </h3>

        <div className="w-full px-4">
            <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#4687e1]">
                {progress < 100 ? "처리 중..." : "완료"}
            </span>
            <span className="text-sm font-medium text-[#4687e1]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
                className="bg-[#4687e1] h-3 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
            </div>
        </div>

        <p className="text-gray-500 mt-6 text-sm text-center whitespace-pre-line">
            {description}
        </p>
      </div>
    </div>
  );
};

export default ReRecordProgressModal;
