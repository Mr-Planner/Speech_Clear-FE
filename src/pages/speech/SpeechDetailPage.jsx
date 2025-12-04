import { useQuery } from "@tanstack/react-query";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaMicrophone } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSpeechDetail } from "../../service/speechApi";

const SpeechDetailPage = () => {
  const { speechId } = useParams();
  const navigate = useNavigate();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const { data: speech, isLoading, isError, error } = useQuery({
    queryKey: ["speech", speechId],
    queryFn: () => fetchSpeechDetail(speechId),
    enabled: !!speechId,
  });

  console.log("Speech Detail Data:", speech); // 디버깅용 로그

  // 세그먼트 데이터가 로드되면 첫 번째 세그먼트로 초기화 (필요 시)
  useEffect(() => {
    if (speech?.scripts) {
      setCurrentSegmentIndex(0);
    }
  }, [speech]);

  if (isLoading) return <div className="p-8">로딩 중...</div>;
  if (isError) return <div className="p-8 text-red-500">에러 발생: {error.message}</div>;
  if (!speech) return <div className="p-8">데이터가 없습니다.</div>;

  // 1. scripts 배열에서 모든 segments를 추출하여 하나의 평탄화된 배열로 만듦 (네비게이션용)
  const allSegments = (speech.scripts || []).flatMap(script => 
    (script.segments || []).map(seg => ({
      ...seg,
      part: script.part // part 정보도 세그먼트에 포함시킴
    }))
  );

  // order_no가 있으면 정렬, 없으면 그대로 (현재 JSON에는 order_no가 없음, 필요시 추가 요청하거나 인덱스 사용)
  // JSON 예시에는 segment_id가 있으므로 이를 키로 사용
  const segments = allSegments; 
  const currentSegment = segments[currentSegmentIndex];
  const totalSegments = segments.length;

  // 이전/다음 세그먼트 이동
  const handlePrev = () => {
    if (currentSegmentIndex > 0) setCurrentSegmentIndex(prev => prev - 1);
  };
  const handleNext = () => {
    if (currentSegmentIndex < totalSegments - 1) setCurrentSegmentIndex(prev => prev + 1);
  };

  // 날짜 포맷 (voice_created_at)
  const formattedDate = dayjs(speech.voice_created_at).format('M.D (ddd) h:mm A');
  
  // 시간 포맷 (voice_duration)
  const durationMin = Math.floor(speech.voice_duration / 60);
  const durationSec = Math.round(speech.voice_duration % 60);
  const formattedDuration = `${durationMin}분 ${durationSec}초`;

  // 파트별로 스크립트 그룹화 (이미 speech.scripts가 그룹화되어 있으므로 그대로 사용)
  const scripts = speech.scripts || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-200 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{speech.voice_name}</h1>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
              {speech.category_name || "미분류"}
            </span>
            <span>{formattedDate}</span>
            <span>{formattedDuration}</span>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#7DCC74] hover:bg-[#66BB6A] text-white rounded-lg font-bold transition-colors"
        >
          목록으로
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Column: Script & Info */}
        <section className="w-1/2 border-r border-gray-200 overflow-y-auto p-8">
          
          {/* Tags */}
          <div className="flex gap-2 mb-8">
            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">#dB</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">#pitch</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">#wpm</span>
          </div>

          {/* Script Content */}
          <div className="space-y-8">
            {scripts.map((script, scriptIdx) => (
              <div key={scriptIdx}>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{script.part}</h3>
                <div className="space-y-2">
                  {script.segments.map((seg) => {
                    const isCurrent = currentSegment?.segment_id === seg.segment_id;
                    return (
                      <p 
                        key={seg.segment_id} 
                        className={`text-gray-700 leading-relaxed p-2 rounded cursor-pointer transition-colors
                          ${isCurrent ? 'bg-red-50 border-l-4 border-red-400 font-medium' : 'hover:bg-gray-50'}
                        `}
                        onClick={() => {
                            // 해당 세그먼트의 인덱스를 찾아서 이동
                            const idx = segments.findIndex(s => s.segment_id === seg.segment_id);
                            if (idx !== -1) setCurrentSegmentIndex(idx);
                        }}
                      >
                        {seg.text}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Analysis & Feedback */}
        <section className="w-1/2 flex flex-col p-8 overflow-y-auto bg-gray-50">
          
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handlePrev} 
              disabled={currentSegmentIndex === 0}
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={20} />
            </button>
            <span className="text-2xl font-bold text-gray-800">
              {currentSegment?.order_no || currentSegmentIndex + 1} / {totalSegments}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentSegmentIndex === totalSegments - 1}
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {currentSegment ? (
            <>
              {/* Graph Placeholder */}
              <div className="bg-white border border-gray-200 rounded-xl h-64 mb-8 flex items-center justify-center shadow-sm">
                <p className="text-gray-400">Graph Area (Placeholder)</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-1">목소리 크기</p>
                  <p className="text-xl font-bold text-gray-900">{currentSegment.metrics?.dB || 0} <span className="text-sm font-normal">dB</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-1">목소리 높낮이</p>
                  <p className="text-xl font-bold text-gray-900">{currentSegment.metrics?.pitch_mean_hz || 0} <span className="text-sm font-normal">Hz</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 mb-1">말하기 속도</p>
                  <p className="text-xl font-bold text-gray-900">{currentSegment.metrics?.rate_wpm || 0} <span className="text-sm font-normal">WPM</span></p>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">상세 피드백</h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentSegment.feedback || "피드백이 없습니다."}
                </p>
              </div>

              {/* Re-record Button (Visual Only) */}
              <div className="flex justify-center mt-auto">
                <button className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                  <FaMicrophone size={24} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              선택된 문장이 없습니다.
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default SpeechDetailPage;
