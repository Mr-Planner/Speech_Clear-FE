// src/services/authApi.js
import axios from "axios";

// 공통 axios 인스턴스 
const api = axios.create({

  // todo 실제 백엔드 주소로 수정
  baseURL: "http://localhost:8080", 
  withCredentials: false,
});

// 로그인 요청
export async function loginRequest(email, password) {
  const response = await api.post("/login", {
    email,
    password,
  });

  // 응답 형식: { accessToken, refreshToken, userName }
  return response.data;
}
