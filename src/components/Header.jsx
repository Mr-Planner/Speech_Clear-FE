// todo 유저 정보 받아서 사이드 바 표시, 로그인 여부 표시 
// todo 라우터 구조 만들어두기..?
import { Link } from "react-router-dom";
import LogButton from "./LogButton";
import user from "../assets/header/user.svg";


function Header({userName, setUserName, isLoggedIn, setIsLoggedIn}) {

    // function
    const handleLogOut = () => {
        setUserName("");
        setIsLoggedIn(false);
    }

    const handleLogIn = () => {
        // 로그인 페이지로 이동
    }
    
    const handleSignUp = () => {
        // 회원가입 페이지로 이동
    }

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