import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../service/authApi";
import { useAuthStore } from "../../store/auth/authStore";

const SettingPage = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleDeleteAccount = async () => {
        if (!confirm("정말로 탈퇴하시겠습니까?\n\n탈퇴 시 모든 데이터(음성, 분석 기록 등)가 즉시 삭제되며 복구할 수 없습니다.")) {
            return;
        }

        try {
            await deleteUser();
            alert("회원 탈퇴가 완료되었습니다.");
            logout(); // 로그아웃 처리 (토큰 삭제 등)
            navigate("/login"); // 로그인 페이지로 이동
        } catch (error) {
            console.error("Account deletion failed:", error);
            alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <main className="flex-1 p-10">
            <h1 className="text-2xl font-bold mb-8">설정</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">계정 관리</h2>
                
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                    <div>
                        <h3 className="text-base font-medium text-gray-900">회원 탈퇴</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            탈퇴 시 모든 데이터가 영구적으로 삭제됩니다.
                        </p>
                    </div>
                    <button 
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </main>
    );
};

export default SettingPage;
