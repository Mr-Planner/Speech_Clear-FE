// todo 실제 서버 주소료 교체 
const BASE_URL = "http://localhost:8080"; 

// 폴더별 speech 리스트 가져오기
// export async function fetchSpeeches(folderId) {
//   const folderQuery = folderId ? `?folderId=${folderId}` : "";
    
//   const res = await fetch(`${BASE_URL}/speeches${folderQuery}`, {
//     credentials: "include", // 쿠키/세션 쓰면 유지
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch speeches");
//   }

//   return res.json(); // [{ id, title, category, date, duration, description }, ...]
// }

// 스피치 삭제 (서버)
export async function deleteSpeech(speechId) {
  const res = await fetch(`${BASE_URL}/speeches/${speechId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete speech");
  }

  return true;
}

import { useAuthStore } from "../store/auth/authStore";

// 스피치 업로드 (분석 요청)
export async function uploadSpeech(formData) {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}/voice/analyze`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // fetch가 FormData를 감지하면 Content-Type을 자동으로 설정함 (boundary 포함)
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to upload speech");
  }

  return res.json();
}

export async function fetchSpeeches(folderId) {
  // 임시(fake) 데이터 (렌더링 용도)
  const mockData = [
    {
      id: 1,
      title: "전공심화 프로젝트 발표",
      folderId: "1",
      category: "수업",
      date: "10.2 (목) 2:30 PM",
      duration: "10분",
      description: "안녕하세요 SpeechClear라는 주제로 발표를 하게 된...",
    },
    {
      id: 2,
      title: "동아리 면접 준비",
      folderId: "2",      
      category: "동아리",
      date: "10.1 (수) 11:30 AM",
      duration: "6분",
      description: "안녕하세요 저는 피아노 동아리에 지원한...",
    },
    {
      id: 3,
      title: "인턴 면접 준비",
      folderId: "3",
      category: "인턴",
      date: "9.27 (토) 2:30 PM",
      duration: "8분",
      description: "안녕하십니까 저는 이번 하기 계절학기 인턴십에 지원한...",
    },
  ];

  // 폴더 필터링(실제 API 동작 흐름 유지)
  if (folderId && folderId !== "all") {
    return mockData.filter((s) => s.folderId === folderId);
  }

  // all이면 전체 반환
  return mockData;
}