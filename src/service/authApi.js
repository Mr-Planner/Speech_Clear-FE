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

    // 서버에서 보낸 응답 데이터
    return response.data;
  }
  
  catch (error) {
    if (error.response?.status === 401) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else if (error.response?.status >= 500) {
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else {
        throw new Error("로그인 중 오류가 발생했습니다.");
    }
  }
}

// 회원가입 요청
export async function signupRequest(email, password, name, gender) {
  try {
    const response = await api.post("/register", {
      email,
      password,
      name,
      gender,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error("이미 존재하는 이메일입니다.");
    } else if (error.response?.status >= 500) {
      throw new Error("서버 오류가 발생했습니다.");
    } else {
      throw new Error("회원가입 중 오류가 발생했습니다.");
    }
  }
}

// 로그아웃 요청
export async function logoutRequest() {
  try {
    await api.post("/logout");
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
    // 로그아웃 실패해도 클라이언트에서는 로그아웃 처리 진행
  }
}

// 이메일 중복 확인 요청
export async function checkEmailRequest(email) {

  try {
    const response = await api.post("/check-email", { email });
    return response.data; // { isDuplicate: boolean } 등 서버 응답에 따라 다름
  }
  catch (error) {
    if (error.response?.status === 409) {
      throw new Error("이미 사용 중인 이메일입니다.");
    } else if (error.response?.status >= 500) {
      throw new Error("서버 오류가 발생했습니다.");
    } else {
      throw new Error("중복 확인 중 오류가 발생했습니다.");
    }
  }
}