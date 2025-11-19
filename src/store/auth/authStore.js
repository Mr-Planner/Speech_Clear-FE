import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest } from "../../service/authApi";

// todo localStorage에 accessToken, refreshToken 저장 X (다른 방법 사용)
export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const data = await loginRequest(email, password);
        const userName = data.userName || email;

        set({
          isLoggedIn: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userName,
        });
      },

      logout: () => {
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
