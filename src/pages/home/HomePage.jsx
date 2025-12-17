import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useAuthStore } from "../../store/auth/authStore";

dayjs.extend(utc);
dayjs.extend(timezone);

import { useNavigate, useParams } from "react-router-dom";
import SpeechItem from "../../components/SpeechItem";
import { deleteSpeech, fetchSpeeches } from "../../service/speechApi";

import recording from "../../assets/speech/recording.svg";

function HomePage() {

    const navigate = useNavigate();
    
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    
    const { folderId } = useParams(); // /speech, /speech/:folderId
    const realFolderId = folderId ?? "all"; // 없을 경우 '모든 Speech'라고 가정

    const queryClient = useQueryClient();

    // function
    const handleRecordingClick = () => {
        if (!isLoggedIn) {
        navigate("/login");
        } else {
        navigate("/recording");
        }
  };

    // 서버에서 SpeechList가져오기
    // useQuery : GET(읽기) 전용
    const userId = useAuthStore((state) => state.userId);

    const {
        data: speeches,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["speeches", realFolderId, userId],       // 캐시 key (폴더별, 유저별로 캐시 분리)
        queryFn: () => fetchSpeeches(realFolderId), // 실제 fetch 함수  
        staleTime: 1000 * 60, // 1분까지는 fresh 데이터
    })

    // useMutation : DELETE / POST / PUT 등의 데이터 변경 
    const deleteMutation = useMutation({
        mutationFn: (speechId) => deleteSpeech(speechId),
        onSuccess: () => {
            // 이 폴더의 스피치 리스트만 다시 가져오기
            queryClient.invalidateQueries({
                queryKey: ["speeches", realFolderId],
            });
        },
        onError: (error) => {
            console.error("삭제 실패:", error);
            alert("스피치 삭제에 실패했습니다. 다시 시도해주세요.");
        }
    }); 

    const handleDeleteSpeech = (speechId) => {
        if (window.confirm("정말로 이 스피치를 삭제하시겠습니까?")) {
            deleteMutation.mutate(speechId);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto px-16 py-10">
            {isLoading && <p>로딩 중...</p>}

            {isError && (
                <p className="text-red-500">에러: {error.message}</p>
            )}

            {speeches && (
                <section className="mt-6 border-t border-gray-200 space-y-2">
                    {speeches.map((speech) => (
                        <SpeechItem
                            key={speech.id}
                            id={speech.id}
                            title={speech.name}
                            category={speech.category_name || "미분류"}
                            date={dayjs.utc(speech.created_at).local().locale('ko').format('M.D (ddd) h:mm A')}
                            duration={`${Math.floor(speech.duration_sec / 60)}분 ${Math.round(speech.duration_sec % 60)}초`}
                            description={speech.preview_text}
                            folderId={speech.category_id}
                            onDelete={handleDeleteSpeech}
                        />
                    ))}
                </section>
            )}

            <button 
                className="fixed bottom-8 right-8 z-50 cursor-pointer transition-all duration-300 hover:scale-110 hover:brightness-90" 
                onClick={handleRecordingClick}
            >
                <img src={recording} alt = "녹음 시작" className="drop-shadow-md"/>
            </button>
            
        </main>
    )   
}

export default HomePage;