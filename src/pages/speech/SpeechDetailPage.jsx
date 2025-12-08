
import { useQuery } from "@tanstack/react-query";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC 플러그인 추가
import { useEffect, useRef, useState } from "react";
import { Line } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight, FaMicrophone } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSpeechDetail } from "../../service/speechApi";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 플러그인 확장
dayjs.extend(utc);

const SpeechDetailPage = () => {
  const { speechId } = useParams();
  const navigate = useNavigate();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const audioRef = useRef(null); // 오디오 객체 관리

  // 컴포넌트 언마운트 시 오디오 정지
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = async (url) => {
    console.log("Attempting to play audio:", url);

    if (!url) {
      console.error("Audio URL is missing");
      return;
    }

    // 기존 오디오 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      // 1. fetch로 데이터 가져오기 (CORS 및 포맷 확인용)
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      // 2. Blob으로 변환
      const blob = await response.blob();
      console.log("Audio Blob type:", blob.type); // 서버가 주는 타입 확인

      // 3. 타입이 없거나 이상하면 강제로 wav로 설정해보기 (필요시)
      // const audioBlob = new Blob([blob], { type: 'audio/wav' }); 
      
      // 4. Blob URL 생성
      const audioUrl = URL.createObjectURL(blob);
      
      // 5. 재생
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
      console.log("Audio playing successfully");

    } catch (err) {
      console.error("Audio play failed:", err);
      alert("오디오 재생 실패: " + err.message);
    }
  };

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
  // 서버에서 UTC로 주는데 'Z'가 없어서 로컬로 인식되는 문제 해결을 위해 .utc()로 파싱 후 .local()로 변환
  const formattedDate = dayjs.utc(speech.voice_created_at).local().format('M.D (ddd) h:mm A');
  
  // 시간 포맷 (voice_duration)
  const durationMin = Math.floor(speech.voice_duration / 60);
  const durationSec = Math.round(speech.voice_duration % 60);
  const formattedDuration = `${durationMin}분 ${durationSec}초`;

  // 파트별로 스크립트 그룹화 (이미 speech.scripts가 그룹화되어 있으므로 그대로 사용)
  const scripts = speech.scripts || [];

  // 그래프 데이터 준비
  const dBList = currentSegment?.dB_list || [];
  const startTime = currentSegment?.start || 0;
  const endTime = currentSegment?.end || 0;
  const duration = endTime - startTime;
  // 데이터 포인트 간의 시간 간격 계산 (전체 시간 / 데이터 개수)
  const interval = dBList.length > 1 ? duration / (dBList.length - 1) : 0;

  const chartData = {
    labels: dBList.map((_, i) => {
      const time = startTime + interval * i;
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec.toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Decibel (dB)',
        data: dBList,
        borderColor: '#7DCC74', // 테마색 (초록)
        backgroundColor: 'rgba(125, 204, 116, 0.1)', // 배경색 (연한 초록)
        tension: 0.4, // 부드러운 곡선
        pointRadius: 0, // 포인트 숨김
        pointHoverRadius: 4, // 호버 시 포인트 표시
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Volume: ${context.parsed.y} dB`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
            maxTicksLimit: 8,
            color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#9CA3AF'
        },
        // dB 값 범위에 따라 조정 가능 (예: -60 ~ 0)
        // min: -60, 
        // max: 0
      },
    },
    animation: {
        duration: 0 // 즉각적인 반응을 위해 애니메이션 최소화 (선택사항)
    }
  };

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
          className="px-4 py-2 bg-[#7DCC74] hover:bg-[#66BB6A] text-white rounded-lg font-bold transition-colors cursor-pointer"
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
                            if (idx !== -1) {
                              setCurrentSegmentIndex(idx);
                              playAudio(seg.segment_url); // 오디오 재생
                            }
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
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaChevronLeft size={20} />
            </button>
            <span className="text-2xl font-bold text-gray-800">
              {currentSegment?.order_no || currentSegmentIndex + 1} / {totalSegments}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentSegmentIndex === totalSegments - 1}
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {currentSegment ? (
            <>
              {/* Graph Area */}
              <div className="bg-white border border-gray-200 rounded-xl h-64 mb-8 p-4 shadow-sm relative w-full">
                {dBList.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        데이터가 없습니다.
                    </div>
                )}
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
                <button className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer">
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
