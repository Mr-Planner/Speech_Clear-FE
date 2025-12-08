// todo 실제 서버 주소료 교체 
export const BASE_URL = "http://localhost:8080"; 

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

import axios from 'axios';

// 스피치 업로드 (분석 요청)
export async function uploadSpeech(formData, onUploadProgress) {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await axios.post(`${BASE_URL}/voice/analyze`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data", // axios는 자동 설정되지만 명시적으로
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
    withCredentials: true,
  });

  return res.data;
}

// 세그먼트 재녹음
export async function reRecordSegment(segmentId, formData) {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await axios.post(`${BASE_URL}/voice/segment/${segmentId}/re_record`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });

  return res.data;
}

// 스피치 상세 조회
export async function fetchSpeechDetail(speechId) {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}/voice/${speechId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch speech detail");
  }

  return await res.json();
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