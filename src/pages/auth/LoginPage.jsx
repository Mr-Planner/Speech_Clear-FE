import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";

const LoginPage = () => {

    const navigate = useNavigate();
    const { isLoggedIn, login } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 이미 로그인 되어 있으면 홈으로
    useEffect(() => {
      if (isLoggedIn) {
        navigate("/");
      }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!email.trim() || !password.trim()) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
      }

      try {
        setLoading(true);
        await login(email, password); // zustand 액션
        navigate("/"); // 성공 후 홈 페이지 리다이렉션
      } catch (error) {
        console.error(error);
        alert("로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="h-full flex flex-col items-center pt-[25vh] bg-white px-4">

        <h1 className="text-4xl font-bold mb-10">SpeechClear</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full border border-gray-200 rounded-2xl
              px-4 py-3 text-gray-800 text-base
              focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400
            "
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full border border-gray-200 rounded-2xl
              px-4 py-3 text-gray-800 text-base
              focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full mt-4
              bg-[#7DCC74] hover:bg-[#76b85d]
              text-white font-semibold text-base
              rounded-2xl py-3
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors duration-150
              cursor-pointer
            "
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    );
};

export default LoginPage;
