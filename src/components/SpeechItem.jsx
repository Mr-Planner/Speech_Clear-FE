import { Link } from "react-router-dom";
import mic from "../assets/speechitem/mic.svg";
import trash from "../assets/speechitem/trash.svg";

// todo 넘치면 스크롤 필요
// todo 스피치 삭제시에 alert 띄우기 (완성도)
const SpeechItem = ({ id, title, category, date, duration, description, folderId, onDelete }) => {

  const detailPath = `/${folderId}/${id}`;

  return (
    <Link to = {detailPath} className="block">
      <article className="flex items-start justify-between w-full px-6 py-8 
                          border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-start gap-4">
          
          <img src={mic} alt="마이크" className="w-6 h-6 mt-1" />
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-700 mt-1">{description}</p>
          </div>
        </div>

        
        <div className="flex items-center gap-8">
          <span className="text-sm font-medium text-gray-800">{category}</span>
          <span className="text-sm text-gray-600">{date}</span>
          <span className="text-sm text-gray-600">{duration}</span>
                
          <button className="hover:bg-gray-100 p-1 rounded cursor-pointer"
              onClick={() => onDelete(id)}>
              <img src={trash} alt="스피치 삭제" className="w-4 h-4" />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default SpeechItem;