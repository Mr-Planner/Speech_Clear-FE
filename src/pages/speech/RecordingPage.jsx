import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useEffect, useState } from 'react';
import { FaCheck, FaPause, FaPlay, FaStop, FaXmark } from "react-icons/fa6";
import SavePopup from '../../components/SavePopup';

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
  const handleRecord = () => setRecordingState('recording');
  const handlePause = () => setRecordingState('paused');
  const handleResume = () => setRecordingState('recording');
  const handleStop = () => setRecordingState('stopped');
  const handleCancel = () => {
    setRecordingState('idle');
    setDuration(0);
  };
  
  const handleSave = () => {
    setIsSavePopupOpen(true);
  };

  const onSave = (title, folderId) => {
    // TODO: Implement actual save API call here
    console.log("Saving Speech:", {
      title: title,
      folderId: folderId,
      duration: duration,
      createdTime: createdTime
    });

    setRecordingState('idle');
    setDuration(0);
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
          <button
            onClick={handleResume}
            className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <FaPlay className="text-3xl text-black ml-1" />
          </button>
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
      />
    </div>
  );
};

export default RecordingPage;
