import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, logoutRequest, signupRequest } from "../../service/authApi";

// todo localStorage에 accessToken, refreshToken 저장 X (다른 방법 사용)

// 로그인 관련 전역상태 
// create : 생성 
export const useAuthStore = create(
  // persist : localstroge에 저장 
  persist(
    (set) => ({
      // 상태 변수, 초기값 설정
      isLoggedIn: false,
      userName: null,
      accessToken: null,
      refreshToken: null,

      // 로그인 함수
      login: async (email, password) => {
        const data = await loginRequest(email, password); // api 요청 
        const userName = data.userName || email;

        // zustand 상태 업데이트 (로그인 성공)
        set({
          isLoggedIn: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userName,
        });
      },

      // 회원가입 함수
      signup: async (email, password, name, gender) => {
        await signupRequest(email, password, name, gender);
        // 회원가입 후 자동 로그인 처리는 하지 않음 (로그인 페이지로 이동 유도)
      },

      // 로그아웃 함수
      logout: async () => {
        try {
          await logoutRequest(); // 서버에 로그아웃 요청
        } catch (error) {
          console.error("로그아웃 요청 중 에러 발생 (무시하고 진행)", error);
        }
        
        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          userName: null,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
