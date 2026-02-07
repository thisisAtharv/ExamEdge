import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AboutUsPage from "./pages/AboutUsPage";

import DashboardLayout from "./components/DashboardLayout";
import DashboardHomePage from "./pages/DashboardHomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyQuizzesPage from "./pages/MyQuizzesPage";
import QuizPage from "./pages/QuizPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import StudyResourcesPage from "./pages/StudyResourcesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MyBadgesPage from "./pages/MyBadgesPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-pass" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutUsPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
          <Route index element={<DashboardHomePage />} />
          <Route path="quizzes" element={<MyQuizzesPage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="quiz/:quizId/results" element={<QuizResultsPage />} />
          <Route path="resources" element={<StudyResourcesPage/>}/>
          <Route path="leaderboard" element={<LeaderboardPage/>}/>
          <Route path="badges" element={<MyBadgesPage/>}/>
          <Route path="profile" element={<ProfilePage/>}/>
      </Route>

    </Routes>
  );
}

export default App;
