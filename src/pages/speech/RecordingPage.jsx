import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaPause, FaStop, FaXmark } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import SavePopup from '../../components/SavePopup';
import { BASE_URL, uploadSpeech } from '../../service/speechApi';
import { useAuthStore } from '../../store/auth/authStore';

dayjs.locale('ko');

const RecordingPage = () => {
  const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'paused' | 'stopped'
  const [duration, setDuration] = useState(0);
  // 컴포넌트 마운트 시점의 시간을 고정값으로 사용
  const [createdTime] = useState(() => 
    `${dayjs().locale('ko').format('YYYY년 M월 D일 dddd')} ${dayjs().locale('en').format('hh:mm A')}`
  );

  // Save Popup State
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);

  // Recording Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // RecordingState에 따른 타이머 수행
  useEffect(() => {
    let interval; // 타이머 ID 변수 (clearInterval을 위해)

    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [recordingState]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // functions
  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 권한이 필요합니다.");
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const handleResume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
      // 스트림 트랙 중지 (마이크 끄기)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecordingState('stopped');
    }
  };

  const handleCancel = () => {
    setRecordingState('idle');
    setDuration(0);
    audioChunksRef.current = [];
  };
  
  const handleSave = () => {
    setIsSavePopupOpen(true);
  };

  const [uploadProgress, setUploadProgress] = useState(0); // 0~100
  const navigate = useNavigate();

  const onSave = async (title, folderId) => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });

      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("name", title);
      formData.append("category_id", folderId); // 0 또는 폴더 ID 전송

      console.log("Saving Speech:", {
        name: title,
        category_id: folderId,
        fileSize: audioFile.size
      });

      // 업로드 요청 (진행률 콜백 제거 - SSE로 대체)
      // 1. SSE 연결 설정
      const userId = useAuthStore.getState().userId;
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }
      setUploadProgress(10); // 초기값 10% (분석 시작)

      const eventSource = new EventSource(`${BASE_URL}/voice/progress/${userId}`);
      console.log("SSE Connected to:", `${BASE_URL}/voice/progress/${userId}`);

      // SSE 연결이 열릴 때까지 기다리는 Promise
      const waitForConnection = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
             // 연결이 안되더라도 일단 업로드는 진행하도록 resolve
             console.warn("SSE Connection Timeout - proceeding with upload anyway");
             resolve();
        }, 5000);

        eventSource.onopen = () => {
          console.log("SSE Connection Opened");
          clearTimeout(timeoutId); // 타임아웃 해제
          resolve();
        };
        
        eventSource.onerror = (err) => {
          console.error("SSE Connection Error:", err);
          // 에러 발생 시에도 타임아웃 해제하고 진행
          clearTimeout(timeoutId);
          reject(err);
        };
      });

      eventSource.onmessage = (event) => {
        console.log("SSE Message Received:", event.data);
        const progress = parseInt(event.data, 10);
        
        if (!isNaN(progress)) {
          // 0이 오더라도 최소 1%로 유지하여 로딩바가 사라지지 않게 함
          setUploadProgress(Math.max(1, progress));

          if (progress === 100) {
            console.log("SSE Progress 100%, closing connection");
            eventSource.close();
          }
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        eventSource.close();
      };

      // 2. SSE 연결 대기 후 파일 업로드 요청
      await waitForConnection;
      
      // uploadSpeech는 이제 진행률 콜백 없이 호출
      // POST 요청이 완료되면(200 OK), 이미 작업은 끝난 것임.
      const response = await uploadSpeech(formData);
      
      // 3. 업로드 완료 후 처리
      // 강제로 100% UI 표시
      setUploadProgress(100);
      
      // SSE 연결 종료
      eventSource.close();

      // 잠시 대기 후 이동 (사용자가 100%를 볼 수 있게)
      setTimeout(() => {
        const newSpeechId = response.voice_id || response.id; 

        alert("성공적으로 저장되었습니다.");
        
        setRecordingState('idle');
        setDuration(0);
        audioChunksRef.current = [];
        setUploadProgress(0);

        // 상세 페이지로 이동
        navigate(`/${folderId}/${newSpeechId}`);
      }, 500);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("저장에 실패했습니다.");
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white relative">
      <div className="absolute top-40 text-5xl font-medium text-gray-800">
        {createdTime}
      </div>

      <div className="text-6xl font-medium mb-70">
        {formatDuration(duration)}
      </div>

      <div className="absolute bottom-20 flex items-center gap-8">
        {recordingState === 'idle' && (
          <button
            onClick={handleRecord}
            className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D32F2F] rounded-full"></div>
          </button>
        )}

        {recordingState === 'recording' && (
          <>
            <button
              onClick={handlePause}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaPause className="text-3xl text-black" />
            </button>
            <button
              onClick={handleStop}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaStop className="text-3xl text-black" />
            </button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-red-500" />
            </button>
            <button
              onClick={handleStop}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaStop className="text-3xl text-black" />
            </button>
          </>
        )}

        {recordingState === 'stopped' && (
          <>
            <button
              onClick={handleCancel}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaXmark className="text-4xl text-black font-bold" />
            </button>
            <button
              onClick={handleSave}
              className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <FaCheck className="text-4xl text-black font-bold" />
            </button>
          </>
        )}
      </div>

      <SavePopup 
        isOpen={isSavePopupOpen} 
        onClose={() => setIsSavePopupOpen(false)}
        onSave={onSave}
        uploadProgress={uploadProgress} // 진행률 전달
      />
    </div>
  );
};

export default RecordingPage;
