// src/services/authApi.js
import axios from "axios";

// 공통 axios 인스턴스 
const api = axios.create({

  baseURL: "http://localhost:8080", 
  withCredentials: false,
});

// 로그인 요청
export async function loginRequest(email, password) {
  try {
    
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const response = await api.post("/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    // 응답 형식: { message, user, access_token, token_type }
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else if (error.response?.status === 422) {
        console.error("422 Validation Error:", error.response.data);
        throw new Error("입력값이 올바르지 않습니다. (서버가 Form Data를 원하거나 필드명이 다를 수 있음)");
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
    // 회원가입도 Form Data 형식으로 변경 (Swagger 확인)
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("gender", gender); // 성별 추가
    
    const response = await api.post("/register", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
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
    // 중복 확인도 Form Data 형식으로 통일
    const formData = new URLSearchParams();
    formData.append("email", email);

    const response = await api.post("/check-email", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    return response.data; // { isDuplicate: boolean } 등 서버 응답에 따라 다름
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error("이미 사용 중인 이메일입니다.");
    } else if (error.response?.status >= 500) {
      throw new Error("서버 오류가 발생했습니다.");
    } else {
      throw new Error("중복 확인 중 오류가 발생했습니다.");
    }
  }
}