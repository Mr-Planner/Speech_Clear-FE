// router.js
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Pages
import HomePage from "./pages/home/HomePage";
import FolderPage from "./pages/folder/FolderPage";
import SpeechDetailPage from "./pages/speech/SpeechDetailPage";
import FeedbackPage from "./pages/speech/FeedbackPage";
import ResultPage from "./pages/speech/ResultPage";
import TrashPage from "./pages/speech/TrashPage";
import SettingPage from "./pages/home/SettingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecordingPage from "./pages/speech/RecordingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,   // 전체 레이아웃
    children: [
      // 1) 기본 홈 (/)
      { index: true, element: <HomePage /> },

      // 2) /:folderId
      { path: ":folderId", element: <HomePage /> },

      // 3) /:folderId/:speechId
      { path: ":folderId/:speechId", element: <SpeechDetailPage /> },

      // 4) /trash
      { path: "trash", element: <TrashPage /> },

      // 5) /setting
      { path: "setting", element: <SettingPage /> },

      // 6) /login
      { path: "login", element: <LoginPage /> },

      // 7) /sign-up
      { path: "sign-up", element: <SignUpPage /> },

      // 8) /recording
      { path: "recording", element: <RecordingPage /> },

      // 9) /:folderId/:speechId/feedback
      { path: ":folderId/:speechId/feedback", element: <FeedbackPage /> },

      // 10) /:folderId/:speechId/result
      { path: ":folderId/:speechId/result", element: <ResultPage /> },
    ],
  },
]);

export default router;
