import { Link } from "react-router-dom";
import mic from "../assets/speechitem/mic.svg";
import trash from "../assets/speechitem/trash.svg";

// todo 스피치 삭제시에 alert 띄우기 (완성도)
// todo 반응형으로 Speech정보 UI 약간 조절하기
const SpeechItem = ({ id, title, category, date, duration, description, folderId, onDelete }) => {

  const detailPath = `/${folderId}/${id}`;

  return (
    <Link to = {detailPath} className="block">
      <article className="flex items-center justify-between w-full px-6 py-4 h-24
                          border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
          
          <img src={mic} alt="마이크" className="w-6 h-6 shrink-0" />
          
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
            <p className="text-sm text-gray-700 mt-1 truncate">{description}</p>
          </div>
        </div>

        
        <div className="flex items-center gap-6 shrink-0">
          <span className="text-sm font-medium text-gray-800 w-32 text-center truncate">{category}</span>
          <span className="text-sm text-gray-600 w-40 text-center">{date}</span>
          <span className="text-sm text-gray-600 w-20 text-center">{duration}</span>
                
          <button className="hover:bg-gray-100 p-1 rounded cursor-pointer w-8 flex justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(id)
            }}>
              <img src={trash} alt="스피치 삭제" className="w-4 h-4" />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default SpeechItem;