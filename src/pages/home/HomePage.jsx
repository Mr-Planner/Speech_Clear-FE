import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../store/auth/useAuth"

import { useNavigate, useParams } from "react-router-dom";
import { fetchSpeeches, deleteSpeech } from "../../service/speechApi";
import SpeechItem from "../../components/SpeechItem";

import recording from "../../assets/speech/recording.svg";

function HomePage() {

    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

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
    const {
        data: speeches,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["speeches", realFolderId],       // 캐시 key (폴더별로 캐시 분리)
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
        deleteMutation.mutate(speechId);
    };

    // todo 최신순 / 시간순 / 피드백 개수 순 정렬 예정 (완성도)
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
                            title={speech.title}
                            category={speech.category}
                            date={speech.date}
                            duration={speech.duration}
                            description={speech.description}
                            folderId={realFolderId}
                            onDelete={handleDeleteSpeech}
                        />
                    ))}
                </section>
            )}

            <button className="fixed bottom-8 right-8 z-9999 cursor-pointer" onClick={handleRecordingClick}>
                <img src={recording} alt = "녹음 시작"/>
            </button>
            
        </main>
    )   
}

export default HomePage;