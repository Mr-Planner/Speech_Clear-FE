import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCompareFeedback } from '../../service/speechApi';

const ResultPage = () => {
    const { voiceId } = useParams();
    const navigate = useNavigate();

    const { data: comparisonData, isLoading, isError } = useQuery({
        queryKey: ['compareFeedback', voiceId],
        queryFn: () => fetchCompareFeedback(voiceId),
        enabled: !!voiceId,
    });

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">로딩 중...</div>;
    }

    if (isError || !comparisonData) {
        return <div className="flex items-center justify-center h-screen">데이터를 불러오는데 실패했습니다.</div>;
    }

    const { original, synthesized } = comparisonData;

    // 피드백 텍스트 포맷팅 함수 (SpeechDetailPage 로직 참고)
    const renderFormattedFeedback = (text) => {
        if (!text) return "피드백 내용이 없습니다.";

        return text.split('\n').map((line, index) => {
            const trimmed = line.trim();
            // <제목> 형식 체크
            if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                const isFirst = index === 0;
                return (
                    <h4 key={index} className={`font-bold text-gray-900 mb-1 text-base ${isFirst ? 'mt-0' : 'mt-3'}`}>
                        {trimmed.replace(/[<>]/g, '')}
                    </h4>
                );
            }
            if (trimmed === '') {
                return <div key={index} className="h-2" />;
            }
            return <p key={index} className="mb-1 text-gray-700 leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-12 min-h-screen bg-white">
            {/* Title: 괄호 제거 */}
            <h1 className="text-3xl font-bold mb-12 text-gray-900">
                {original?.name || "Speech 제목"}
            </h1>

            {/* Content Group */}
            <div className="space-y-8 mb-16">
                
                {/* Original Feedback Section */}
                <div className="w-full bg-gray-100 rounded-2xl p-8 shadow-sm">
                    {/* 상단 정렬(items-start)로 변경하여 텍스트가 길어져도 레이아웃 유지 */}
                    <div className="flex items-start gap-6">
                        <span className="font-bold text-gray-900 min-w-fit pt-1 text-lg">원본 Speech 피드백</span>
                        <div className="flex-1">
                            {renderFormattedFeedback(original?.total_feedback)}
                        </div>
                    </div>
                </div>

                {/* Final Feedback Section */}
                <div className="w-full bg-gray-100 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start gap-6">
                        {/* 일관성을 위해 라벨 변경 */}
                        <span className="font-bold text-gray-900 min-w-fit pt-1 text-lg">최종본 Speech 피드백</span>
                        <div className="flex-1">
                            {renderFormattedFeedback(synthesized?.total_feedback)}
                        </div>
                    </div>
                </div>

            </div>

            {/* Buttons: 녹색 테마 적용 */}
            <div className="flex justify-between items-center px-8">
                <a 
                    href={original?.original_url} 
                    download 
                    className="px-8 py-3 bg-[#7DCC74] hover:bg-[#66BB6A] text-white font-bold rounded-lg transition-colors cursor-pointer text-center min-w-[200px] shadow-md"
                >
                    원본 음성 다운로드
                </a>

                <a 
                    href={synthesized?.original_url} 
                    download 
                    className="px-8 py-3 bg-[#7DCC74] hover:bg-[#66BB6A] text-white font-bold rounded-lg transition-colors cursor-pointer text-center min-w-[200px] shadow-md"
                >
                    최종본 음성 다운로드
                </a>
            </div>
        </div>
    );
};

export default ResultPage;
