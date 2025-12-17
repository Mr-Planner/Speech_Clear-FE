import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, signupRequest } from "../../service/authApi";

// 로그인 관련 전역상태 
// create : 생성 
export const useAuthStore = create(
  // persist : localstroge에 저장 
  // todo accessToken, refreshToken localStorage에 저장 X (다른 방법 사용)
  // HttpOnly Coockie + Memory 사용 
  // Back 로직 수정 필요... (백엔드에서 쿠키로 전송해야 함)
  persist(
    (set) => ({
      // 상태 변수, 초기값 설정
      isLoggedIn: false,
      userName: null,
      userId: null, // user_id 추가
      accessToken: null,
      refreshToken: null,

      // 로그인 함수
      login: async (email, password) => {
        const data = await loginRequest(email, password); // api 요청 
        
        // 백엔드 응답 형식에 맞춰 수정
        // { message, user: { name, ... }, access_token, user_id, ... }
        // user_id가 최상위에 있는지 user 객체 안에 있는지 확인 필요하지만, 
        // 일단 data.user_id 또는 data.user.id로 가정하고 저장
        const userName = data.user?.name || email;
        const accessToken = data.access_token;
        const userId = data.user_id || data.user?.id; // user_id 저장
        const refreshToken = null; // 현재 백엔드에서 안 줌

        // zustand 상태 업데이트 (로그인 성공)
        set({
          isLoggedIn: true,
          accessToken,
          refreshToken,
          userName,
          userId, // 상태에 추가
        });
      },

      // 회원가입 함수
      signup: async (email, password, name, gender) => {
        await signupRequest(email, password, name, gender);
        // 회원가입 후 자동 로그인 처리는 하지 않음 (로그인 페이지로 이동 유도)
      },

      // 로그아웃 함수
      logout: () => {
        // 서버 요청 없이 클라이언트 상태만 초기화
        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          userName: null,
          userId: null, 
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
