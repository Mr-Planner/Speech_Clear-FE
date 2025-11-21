// todo 유저 정보 받아서 사이드 바 표시, 로그인 여부 표시 
import { Link, useNavigate } from "react-router-dom";
import LogButton from "./LogButton";
import user from "../assets/header/user.svg";
import { useAuthStore } from "../store/auth/authStore";

function Header() {
    const navigate = useNavigate();

    // zustand selector -> isLoggedIn의 변경만 감지 
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const userName = useAuthStore((s) => s.userName);
    const logout = useAuthStore((s) => s.logout);

    const handleLogIn = () => navigate("/login");
    const handleSignUp = () => navigate("/sign-up"); 
    const handleLogOut = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="flex justify-between items-center w-full bg-white px-6 py-2 border-b border-gray-300">
            <Link to="/" >
                <span className="text-[32px] font-bold">SpeechClear</span>
            </Link>
            
            <section className="flex gap-2 items-center">
               
                {isLoggedIn ? (    
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-1 cursor-pointer">
                            <img src={user} alt="유저" className="w-4.5 h-4.5"></img>
                            <span className="text-[17px] font-semibold">{userName}님</span>
                        </div>

                        <LogButton text = "로그아웃" onClick={handleLogOut}></LogButton>
                    </div>
                    
                ) : (
                    <div className="flex gap-1">
                        <LogButton text = "로그인" onClick={handleLogIn}></LogButton>
                        <LogButton text = "회원가입" onClick={handleSignUp}></LogButton>
                    </div>   
                )}
            </section>
        </header>
    )
}

export default Header