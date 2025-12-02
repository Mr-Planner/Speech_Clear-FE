// todo 실제 서버 주소료 교체 
const BASE_URL = "http://localhost:8080"; 

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

// 스피치 목록 조회
export async function fetchSpeeches(folderId) {
  const accessToken = useAuthStore.getState().accessToken;

  // folderId가 0, 'all', null, undefined이면 전체 조회 (쿼리 파라미터 생략)
  const query = folderId && folderId !== 0 && folderId !== 'all' 
    ? `?category_id=${folderId}` 
    : '';

  const res = await fetch(`${BASE_URL}/voice/list${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch speeches");
  }

  const data = await res.json();
  return data.voices; // { voices: [...] } 형태에서 배열만 반환
}