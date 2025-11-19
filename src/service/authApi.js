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
  try {
    const response = await api.post("/login", {
      email,
      password,
    });

    // 응답 형식: { accessToken, refreshToken, userName }
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else if (error.response?.status >= 500) {
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else {
        throw new Error("로그인 중 오류가 발생했습니다.");
    }
  }
}
