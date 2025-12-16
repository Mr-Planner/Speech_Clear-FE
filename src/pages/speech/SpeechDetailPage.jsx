
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from 'react-chartjs-2';
import { FaStop } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight, FaMicrophone, FaPlay } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import ReRecordProgressModal from "../../components/ReRecordProgressModal";
import { BASE_URL, fetchSpeechDetail, reRecordSegment } from "../../service/speechApi"; // reRecordSegment 추가
import { useAuthStore } from '../../store/auth/authStore';

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
  const queryClient = useQueryClient(); // 클라이언트 초기화
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const audioRef = useRef(null); // 오디오 객체 관리
  const userId = useAuthStore((state) => state.userId); // userId 가져오기

  // 재녹음 관련 상태 및 ref
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForVoice, setIsWaitingForVoice] = useState(false); // VAD 대기 상태
  const [recordingDbList, setRecordingDbList] = useState([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(-1); // -1: 원본, 0+: 재녹음 버전
  const [countdown, setCountdown] = useState(null); // 카운트다운 상태 추가
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률 상태 추가
  const [isProcessing, setIsProcessing] = useState(false); // 처리 중 상태 추가
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null); // 스트림을 미리 로드하여 보관
  const isWaitingForVoiceRef = useRef(false); // interval 내에서 최신 상태 참조용
  const audioChunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const [selectedVersions, setSelectedVersions] = useState({}); // 각 세그먼트별 선택된 버전 관리 {segmentId: versionIndex}
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const intervalRef = useRef(null);
  const isAutoPlayingRef = useRef(false); // 연속 재생 중인지 추적



  const { data: speech, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["speech", speechId],
    queryFn: () => fetchSpeechDetail(speechId),
    enabled: !!speechId,
  });

  // 1. scripts 배열에서 모든 segments를 추출하여 하나의 평탄화된 배열로 만듦 (네비게이션용)
  // Hooks 규칙 준수를 위해 Early Return 이전에 계산 (데이터 없으면 빈 배열)
  const allSegments = useMemo(() => (speech?.scripts || []).flatMap(script => 
    (script.segments || []).map(seg => ({
      ...seg,
      part: script.part // part 정보도 세그먼트에 포함시킴
    }))
  ), [speech]);

  const segments = allSegments; 
  const currentSegment = segments[currentSegmentIndex];
  const totalSegments = segments.length;

  // 컴포넌트 언마운트 시 오디오 및 녹음 정지
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopRecordingResources();
    };
  }, []);

  // 세그먼트 변경 시 녹음 데이터 및 그래프 초기화 (네비게이션 시)
  // 세그먼트 변경 시 녹음 데이터 및 그래프 초기화 (네비게이션 시)
  useEffect(() => {
    setIsRecording(false);
    
    if (isAutoPlayingRef.current) {
        // 연속 재생으로 인한 변경인 경우: 오디오를 끄지 않음 (방금 재생 시작한 오디오가 있을 수 있음)
        // 단, 녹음 관련 리소스는 정리
        stopRecordingResources(false);
        isAutoPlayingRef.current = false;
    } else {
        // 수동 이동의 경우: 모든 리소스(오디오 포함) 정리
        stopRecordingResources(true);
    }

    setRecordingDbList([]);
    // 세그먼트 변경 시, 저장된 선택 버전이 있으면 복원, 없으면 최신 버전
    const savedIndex = selectedVersions[currentSegment?.segment_id];
    // savedIndex가 있으면 사용, 없으면(undefined) 최신 버전(length-1) 사용
    const maxIndex = (currentSegment?.versions?.length || 0) - 1;
    setActiveVersionIndex(savedIndex !== undefined ? savedIndex : maxIndex);
    setIsWaitingForVoice(false);
    isWaitingForVoiceRef.current = false;
  }, [currentSegmentIndex, currentSegment]); // currentSegment dependency added to detect version updates

  // 서버에서 받아온 재녹음 dB 데이터가 있으면 로드 (데이터 업데이트 시 반영)
  useEffect(() => {
    if (currentSegment?.user_audio_db_list && Array.isArray(currentSegment.user_audio_db_list)) {
        setRecordingDbList(currentSegment.user_audio_db_list);
    }
    // 데이터가 없으면? 위 effect에서 이미 초기화했으므로 굳이 여기서 초기화 안해도 됨.
    // 단, "재녹음 성공 -> 데이터 생김" 케이스를 위해 여기서는 set만 수행
  }, [currentSegment?.user_audio_db_list]); 

  const stopRecordingResources = (shouldStopAudio = true) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error(e));
        audioContextRef.current = null;
    }
    // 스트림은 stopRecordingResources에서 완전히 끄지 않고, 
    // 페이지 나갈때나 완전히 멈출때만 끄도록 관리할 수도 있으나, 
    // 여기서는 깔끔하게 매번 리셋
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
    // 오디오 재생 중이면 중지
    if (shouldStopAudio && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    setIsWaitingForVoice(false);
    isWaitingForVoiceRef.current = false;
  };

  // 녹음 버튼 클릭 핸들러 (카운트다운 로직 포함)
  const handleRecordClick = async () => {
    if (isRecording || isWaitingForVoice) {
      stopRecording();
      return;
    }

    // 이미 카운트다운 중이면 무시
    if (countdown !== null) return;

    try {
        // 1. 스트림 미리 확보 (Latency 제거)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // 2. 카운트다운 시작
        setCountdown(3);
        let count = 3;
        
        const countInterval = setInterval(() => {
          count -= 1;
          if (count > 0) {
            setCountdown(count);
          } else {
            clearInterval(countInterval);
            startStandby(); // 카운트다운 종료 후 대기 상태 진입
          }
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const startStandby = async () => {
    try {
        const stream = streamRef.current;
        if (!stream) {
            console.error("Stream not found!");
            return;
        }
        
        // 1. MediaRecorder 설정 (녹음 저장용 - 아직 start 안함)
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
             // 녹음 중단 시 로직은 handleStopRecording에서 처리
             // stream stop은 stopRecordingResources에서 일괄 처리
        };

        setCountdown(null); // 카운트다운 해제
        
        // VAD 대기 모드 진입
        setIsWaitingForVoice(true);
        isWaitingForVoiceRef.current = true;
        setRecordingDbList([]); // 초기화

        // 2. AudioContext 설정 (실시간 dB 분석용)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // 0.1초마다 dB 계산
        intervalRef.current = setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            
            let sumSquares = 0;
            for(let i = 0; i < dataArray.length; i++) {
                const normalized = (dataArray[i] - 128) / 128;
                sumSquares += normalized * normalized;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            
            let db;
            if (rms > 0) {
                db = 20 * Math.log10(rms);
            } else {
                db = -80; 
            }
            db = Math.max(db, -80);

            // VAD 로직: 목소리 임계값 체크
            if (isWaitingForVoiceRef.current) {
                // -30dB 이상이면 말하기 시작으로 간주 (기준 상향 조절)
                if (db > -30) {
                    console.log("Voice detected! Starting recording...");
                    mediaRecorder.start();
                    setIsRecording(true);
                    setIsWaitingForVoice(false);
                    isWaitingForVoiceRef.current = false;
                    // 첫 데이터 포인트 추가
                    setRecordingDbList(prev => [...prev, db]);
                }
                // 대기 중일 때는 그래프 업데이트 안 함 (혹은 작은 값으로 유지)
            } else {
                // 녹음 중일 때만 데이터 저장
                 setRecordingDbList(prev => [...prev, db]);
            }

        }, 100);

    } catch (err) {
        console.error("Error setting up audio resources:", err);
        setCountdown(null);
    }
  };

  const stopRecording = async () => {
    // VAD 대기 중이거나 녹음 중일 때 모두 멈출 수 있어야 함
    if (!mediaRecorderRef.current) return;

    // VAD 대기 중이면 바로 리소스 정리하고 종료
    if (isWaitingForVoice) {
        stopRecordingResources();
        return;
    }

    if (!isRecording) return; // 녹음 시작 전이면 무시

    mediaRecorderRef.current.stop();
    stopRecordingResources();
    setIsRecording(false);
    
    // UI 즉시 반응을 위해 처리 중 상태 표시
    setIsProcessing(true);
    setUploadProgress(10); // 초기 진입 시 10%

    // 잠시 대기 후 마지막 데이터 처리
    setTimeout(async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // 서버로 전송
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('db_list', JSON.stringify(recordingDbList)); // 그래프 데이터 전송 (백엔드 저장용)

        if (currentSegment?.segment_id) {
            let eventSource = null;
            try {
                // 1. SSE 연결 설정
                if (userId) {
                    eventSource = new EventSource(`${BASE_URL}/voice/progress/${userId}`);
                    
                    eventSource.onopen = () => {
                        console.log("SSE Connection Opened");
                    };

                    eventSource.onmessage = (event) => {
                        const progress = parseInt(event.data, 10);
                        if (!isNaN(progress)) {
                            console.log("SSE Progress:", progress);
                            setUploadProgress(Math.max(10, progress)); // 최소 10% 유지
                            if (progress === 100) {
                                eventSource.close();
                            }
                        }
                    };

                    eventSource.onerror = (err) => {
                        console.error("SSE Error:", err);
                        eventSource.close();
                    };
                }

                // 2. 재녹음 요청 전송 (진행률은 SSE로 받음)
                const response = await reRecordSegment(currentSegment.segment_id, formData);
                console.log("Re-record response:", response); // 응답 데이터 확인

                // 3. 완료 처리 (SSE가 100%를 보장하지 못할 경우를 대비해 강제 100%)
                setUploadProgress(100);
                if (eventSource) eventSource.close();

                // 4. 데이터 반영 (약간의 지연 후 모달 닫기)
                setTimeout(() => {
                    setIsProcessing(false);
                    setUploadProgress(0);

                    // 응답으로 받은 데이터(새로운 피드백, 버전 정보 등)를 처리
                // 가정: response가 새로 생성된 Version 객체이거나, 최소한 dB_list와 metrics를 포함함
                // 안전을 위해 전체 리스트 다시 불러오기도 수행하지만, 즉각적인 반응을 위해 캐시 업데이트 시도
                
                queryClient.setQueryData(["speech", speechId], (oldData) => {
                    if (!oldData || !oldData.scripts) return oldData;

                    const newScripts = oldData.scripts.map(script => ({
                        ...script,
                        segments: script.segments.map(seg => {
                           if (seg.segment_id === currentSegment.segment_id) {
                                // 기존 버전 리스트에 새 응답(버전) 추가
                                // response가 버전 객체라고 가정하고 처리. 
                                // 만약 response가 단순 데이터라면 구조를 맞춰주거나, refetch에 의존해야 함.
                                // 가장 확실한 건 refetch()이므로 여기서는 낙관적으로 versions 배열에 추가해봄.
                                const newVersion = {
                                    ...response,
                                    // id나 version_no가 없으면 임시 생성 (refetch되면 해결됨)
                                    id: response.id || Date.now(),
                                    version_no: (seg.versions?.length || 0) + 1
                                };
                                
                                const updatedVersions = [...(seg.versions || []), newVersion];

                                return {
                                    ...seg,
                                    versions: updatedVersions,
                                    // 최신 버전 정보로 세그먼트 루트 정보도 일부 갱신 가능 (필요 시)
                                };
                           }
                           return seg;
                        })
                    }));

                    return { ...oldData, scripts: newScripts };
                });
                
                // 데이터 정합성을 위해 서버에서 다시 받아옴
                refetch(); 

                alert("재녹음 완료!");
                }, 500);

            } catch (error) {
                console.error("Re-recording failed:", error);
                
                if (eventSource) eventSource.close();
                setIsProcessing(false);
                setUploadProgress(0);
                alert("재녹음 저장 실패");
            }
        }
    }, 500);
  };





  console.log("Speech Detail Data:", speech); // 디버깅용 로그


  // 세그먼트 데이터가 로드되면 첫 번째 세그먼트로 초기화 (필요 시) -> 재녹음 시 초기화 방지를 위해 제거
  // useEffect(() => {
  //   if (speech?.scripts) {
  //     setCurrentSegmentIndex(0);
  //   }
  // }, [speech]);



  if (isLoading) return <div className="p-8">로딩 중...</div>;
  if (isError) return <div className="p-8 text-red-500">에러 발생: {error.message}</div>;
  if (!speech) return <div className="p-8">데이터가 없습니다.</div>;



  console.log("Current Segment:", currentSegment); // 디버깅: 세그먼트 데이터 확인 (start 값 등)

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
  
  // 버전 데이터 처리
  const versions = currentSegment?.versions || [];
  const activeVersion = activeVersionIndex >= 0 ? versions[activeVersionIndex] : null;

  // 화면에 표시할 데이터 (버전 선택에 따라 변경)
  const displayMetrics = activeVersion?.metrics || currentSegment?.metrics;
  const displayFeedback = activeVersion ? activeVersion.feedback : currentSegment?.feedback;
  // 빨간 그래프 데이터 소스: 녹음 중이면 실시간 데이터, 아니면 선택된 버전의 데이터 (원본 선택 시 빈 배열)
  const displayRedDbList = activeVersion?.dB_list || []; 
  // 만약 "녹음 완료 후 저장된 데이터"가 방금 녹음한 것이라면? 
  // stopRecording에서 queryClient 업데이트 시 versions에 추가하므로 displayRedDbList에 반영됨.

  // 원본 데이터 interval (고정 0.1초 사용 - 메타데이터 시간과 데이터 포인트 불일치 방지)
  const originalInterval = 0.1;

  // 그래프의 지속 시간 계산 (데이터 포인트 개수 기반)
  const originalDataDuration = dBList.length * 0.1;
  const recordingDataDuration = (isRecording ? recordingDbList : displayRedDbList).length * 0.1;
  
  // 그래프 X축 최대 길이 설정
  const displayDuration = Math.max(originalDataDuration, recordingDataDuration);

  // Chart Data 구성 (Linear Scale 사용을 위해 x, y 데이터 변환)
  const chartData = {
    datasets: [
      {
        label: 'Original dB',
        data: dBList.map((val, i) => ({ x: i * originalInterval, y: val })), // 0.1초 고정 간격 (데이터 왜곡 방지)
        borderColor: '#7DCC74', // 테마색 (초록)
        backgroundColor: 'rgba(125, 204, 116, 0.1)', // 배경색 (연한 초록)
        tension: 0.4, // 부드러운 곡선
        pointRadius: 0, // 포인트 숨김
        pointHoverRadius: 4, // 호버 시 포인트 표시
        borderWidth: 2,
        fill: true,
        order: 2,
        yAxisID: 'y', // 명시적으로 y축 지정
      },
      {
        label: 'Recording dB',
        data: (isRecording ? recordingDbList : displayRedDbList).map((val, i) => ({ x: i * 0.1, y: val })), // 0.1초 간격 매핑
        borderColor: '#EF4444', // 빨간색 (녹음)
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
        order: 1,
        yAxisID: 'y', // 명시적으로 y축 지정
        // VAD 대기 중일 때는 데이터가 없으므로 그려지지 않음 (사용자가 말하기 시작하면 데이터 추가됨)
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
        type: 'linear', // 선형 스케일 사용 (시간 비례)
        position: 'bottom',
        grid: {
          display: false,
        },
        min: 0,
        max: displayDuration, // 최대 시간 설정 (그래프 스케일 고정)
        ticks: {
            maxTicksLimit: 8,
            color: '#9CA3AF',
            callback: function(value) {
                // 초 단위를 분:초로 변환
                const min = Math.floor((startTime + value) / 60);
                const sec = Math.floor((startTime + value) % 60);
                return `${min}:${sec.toString().padStart(2, '0')}`;
            }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#9CA3AF'
        },
      },
    },
    animation: {
        duration: 0 // 즉각적인 반응을 위해 애니메이션 최소화 (선택사항)
    }
  };



  // --- 오디오 관련 헬퍼 함수 ---

  // 세그먼트에 대한 재생 URL 결정 로직 (재녹음 버전 우선)
  const getAudioUrlForSegment = (segment, isCurrentSegment = false) => {
      if (!segment) return null;

      // 1. 현재 보고 있는 세그먼트라면 activeVersionIndex 사용
      if (isCurrentSegment && currentSegment?.segment_id === segment.segment_id && activeVersionIndex >= 0) {
           const activeVer = segment.versions ? segment.versions[activeVersionIndex] : null;
           if (activeVer) return activeVer.segment_url;
      } 
      
      // 2. 저장된 선택 버전이 있는지 확인
      const savedIndex = selectedVersions[segment.segment_id];
      if (savedIndex !== undefined) {
          if (savedIndex === -1) {
              return segment.segment_url;
          }
          if (savedIndex >= 0) {
              const savedVer = segment.versions ? segment.versions[savedIndex] : null;
              if (savedVer) return savedVer.segment_url;
          }
      }
      
      // 3. 없으면 최신 버전 사용
      const versions = segment.versions || [];
      if (versions.length > 0) {
           return versions[versions.length - 1].segment_url;
      }
      return segment.segment_url;
  };

  const playAudio = (url, playingIndex, isContinuous = false) => {
    if (!url) return;
    
    // 기존 재생 중지
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    // 연속 재생 로직
    if (isContinuous && typeof playingIndex === 'number') {
        audio.onended = () => {
            playNextSegment(playingIndex + 1);
        };
    }

    audio.play().catch(e => console.error("Audio playback error:", e));
  };

  const playNextSegment = (nextIndex) => {
      if (nextIndex >= 0 && nextIndex < allSegments.length) {

          // 자동 재생 플래그 설정 -> useEffect에서 오디오 정지 방지
          isAutoPlayingRef.current = true;
          
          const nextSeg = allSegments[nextIndex];
          // 다음 세그먼트로 이동 (UI 업데이트)
          setCurrentSegmentIndex(nextIndex);
          
          // 다음 세그먼트의 오디오 URL 결정 (최신 버전 우선)
          const nextUrl = getAudioUrlForSegment(nextSeg); // isCurrentSegment=false
          
          // 재생 (재귀적 호출 구조가 됨, 모드 유지)
          playAudio(nextUrl, nextIndex, true);
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
          


          {/* Script Content */}
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-gray-800">Script</h2>
                 <button 
                     onClick={() => {
                        // 현재 세그먼트부터 연속 재생 시작
                        const url = getAudioUrlForSegment(currentSegment, true);
                        playAudio(url, currentSegmentIndex, true);
                     }}
                     className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                 >
                     <FaPlay size={12} />
                     <span>전체 재생</span>
                 </button>
            </div>
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
                              // 수동 클릭 시에도 useEffect에 의한 오디오 정지를 방지
                              isAutoPlayingRef.current = true;
                              setCurrentSegmentIndex(idx);
                              
                              let urlToPlay = seg.segment_url; // Default fallback

                              // 현재 선택된 세그먼트를 다시 클릭한 경우: 현재 활성화된 버전 확인
                              const isCurrent = currentSegment?.segment_id === seg.segment_id;
                              
                              // Helper 함수 사용하여 URL 결정
                              // 클릭 시점의 activeVersionIndex를 반영하기 위해 
                              // 만약 index가 변경된다면 effect에 의해 activeVersionIndex가 max로 리셋되지만,
                              // "다시 클릭"의 경우 현재 상태 유지.
                              // "다른 문장 클릭"의 경우 effect가 아직 안 돌았으므로 activeVersionIndex는 이전 값임. 
                              // 따라서 getAudioUrlForSegment 내부 로직 보다는 명시적으로 여기서 처리하는 게 안전할 수 있음.
                              
                              if (isCurrent) {
                                  // 현재 보고 있는 버전 재생
                                   const activeVer = activeVersionIndex >= 0 && seg.versions ? seg.versions[activeVersionIndex] : null;
                                   urlToPlay = activeVer ? activeVer.segment_url : seg.segment_url;
                              } else {
                                  // 다른 문장 -> 최신 버전 (useEffect와 동일한 로직)
                                   const versions = seg.versions || [];
                                   if (versions.length > 0) {
                                       urlToPlay = versions[versions.length - 1].segment_url;
                                   }
                              }

                              playAudio(urlToPlay, idx, false); // idx 전달, isContinuous: false (단건 재생)
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
        {/* Right Column: Analysis & Feedback */}
        <section className="w-1/2 flex flex-col p-8 overflow-hidden bg-gray-50">
          
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
                {dBList.length > 0 || recordingDbList.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        데이터가 없습니다.
                    </div>
                )}
              </div>

              {/* Metrics */}
              {/* Version Navigation & Metrics */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-gray-900">
                         {activeVersionIndex === -1 ? "원본 분석 결과" : `재녹음 #${activeVersionIndex + 1} 결과`}
                     </h3>
                     <div className="flex items-center gap-2">
                         <button
                              onClick={() => {
                                  const nextIdx = Math.max(-1, activeVersionIndex - 1);
                                  setActiveVersionIndex(nextIdx);
                                  
                                  // 선택 상태 저장
                                  if (currentSegment) {
                                      setSelectedVersions(prev => ({
                                          ...prev,
                                          [currentSegment.segment_id]: nextIdx
                                      }));
                                  }

                                  const url = nextIdx === -1 
                                      ? currentSegment.segment_url 
                                      : (currentSegment.versions && currentSegment.versions[nextIdx] ? currentSegment.versions[nextIdx].segment_url : null);
                                  
                                  playAudio(url, currentSegmentIndex, false);
                              }}
                              disabled={activeVersionIndex === -1}
                              className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                              <FaChevronLeft size={16} />
                          </button>
                         
                         <span className="text-sm text-gray-500 font-medium w-16 text-center">
                             {activeVersionIndex === -1 ? "Original" : `Ver.${activeVersionIndex + 1}`}
                         </span>
                         
                         <button
                              onClick={() => {
                                  const maxIdx = (currentSegment?.versions?.length || 0) - 1;
                                  const nextIdx = Math.min(maxIdx, activeVersionIndex + 1);
                                  setActiveVersionIndex(nextIdx);

                                  // 선택 상태 저장
                                  if (currentSegment) {
                                      setSelectedVersions(prev => ({
                                          ...prev,
                                          [currentSegment.segment_id]: nextIdx
                                      }));
                                  }

                                  const url = nextIdx === -1 
                                      ? currentSegment.segment_url 
                                      : (currentSegment.versions && currentSegment.versions[nextIdx] ? currentSegment.versions[nextIdx].segment_url : null);
                                  
                                  playAudio(url, currentSegmentIndex, false);
                              }}
                              disabled={activeVersionIndex >= (currentSegment?.versions?.length || 0) - 1}
                              className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                              <FaChevronRight size={16} />
                          </button>
                     </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-1">목소리 크기</p>
                    <p className="text-xl font-bold text-gray-900">
                        {displayMetrics?.dB ? Number(displayMetrics.dB).toFixed(2) : 0} 
                        <span className="text-sm font-normal">dB</span>
                    </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-1">목소리 높낮이</p>
                    <p className="text-xl font-bold text-gray-900">
                        {displayMetrics?.pitch_mean_hz ? Number(displayMetrics.pitch_mean_hz).toFixed(2) : 0}
                        <span className="text-sm font-normal">Hz</span>
                    </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-1">말하기 속도</p>
                    <p className="text-xl font-bold text-gray-900">
                        {displayMetrics?.rate_wpm ? Number(displayMetrics.rate_wpm).toFixed(2) : 0}
                        <span className="text-sm font-normal">WPM</span>
                    </p>
                    </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 flex-1 flex flex-col max-h-[350px]">
                {/* Fixed Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex-none bg-white rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-900">상세 피드백</h3>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="text-gray-700 leading-relaxed text-sm">
                    {(() => {
                        const text = displayFeedback || "피드백이 없습니다.";
                        if (!text) return null;
                        
                        return text.split('\n').map((line, index) => {
                        const trimmed = line.trim();
                        // <제목> 형식 체크
                        if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                            // 첫 번째 줄이거나, 이전에 내용이 없었다면 margin-top 제거
                            const isFirst = index === 0;
                            
                            // < > 제거하고 굵게 표시
                            return (
                                <h4 key={index} className={`font-bold text-gray-900 mb-2 text-base ${isFirst ? 'mt-0' : 'mt-4'}`}>
                                    {trimmed.replace(/[<>]/g, '')}
                                </h4>
                            );
                        }
                        // 빈 줄은 무시하거나 간격으로 처리
                        if (trimmed === '') {
                            return <div key={index} className="h-2" />;
                        }
                        // 일반 텍스트
                        return <p key={index} className="mb-1">{line}</p>;
                        });
                    })()}
                    </div>
                </div>
              </div>

              {/* Re-record Button */}
              <div className="flex justify-center mt-auto flex-none">
                <button 
                    onClick={handleRecordClick}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 cursor-pointer
                        ${isRecording ? 'bg-gray-800 hover:bg-gray-900' : 
                          isWaitingForVoice ? 'bg-red-400 animate-pulse' : 'bg-red-500 hover:bg-red-600'}
                        ${countdown !== null ? 'bg-orange-400 hover:bg-orange-500 cursor-not-allowed' : ''}
                    `}
                    disabled={countdown !== null}
                >
                  {countdown !== null ? (
                    <span className="text-2xl font-bold text-white animate-pulse">{countdown}</span>
                  ) : isRecording ? (
                    <FaStop size={24} className="text-white" />
                  ) : isWaitingForVoice ? (
                    <span className="text-xs font-bold text-white text-center">말씀<br/>하세요</span>
                  ) : (
                    <FaMicrophone size={24} className="text-white" />
                  )}
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

      {/* Re-record Progress Modal */}
      <ReRecordProgressModal 
        isOpen={isProcessing} 
        progress={uploadProgress} 
        onClose={() => setIsProcessing(false)} 
      />
    </div>
  );
};



export default SpeechDetailPage;
