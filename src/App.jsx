import { Navigate, Route, Routes } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import TabLayout from "@/components/layout/TabLayout";
import DiaryProvider from "@/contexts/DiaryProvider";
import ArchivePage from "@/pages/archive/ArchivePage";
import DiaryDetailPage from "@/pages/archive/DiaryDetailPage";
import ReportPage from "@/pages/report/ReportPage";
import ProfilePage from "@/pages/settings/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import SubscriptionPage from "@/pages/settings/SubscriptionPage";
import SupportPage from "@/pages/settings/SupportPage";
import TermsPage from "@/pages/settings/TermsPage";
import VersionPage from "@/pages/settings/VersionPage";
import OnboardingProvider from "@/contexts/OnboardingProvider";
import EmotionPage from "@/pages/diary/EmotionPage";
import CompletePage from "@/pages/diary/CompletePage";
import ModePage from "@/pages/diary/ModePage";
import QuestionRoute from "@/pages/diary/QuestionPage";
import ReviewPage from "@/pages/diary/ReviewPage";
import WritePage from "@/pages/diary/WritePage";
import HomePage from "@/pages/home/HomePage";
import AgePage from "@/pages/onboarding/AgePage";
import DonePage from "@/pages/onboarding/DonePage";
import HelperPage from "@/pages/onboarding/HelperPage";
import IntroPage from "@/pages/onboarding/IntroPage";
import NamePage from "@/pages/onboarding/NamePage";
import SplashPage from "@/pages/onboarding/SplashPage";
import StartPage from "@/pages/onboarding/StartPage";

function App() {
  return (
    <OnboardingProvider>
      <DiaryProvider>
        <Routes>
          <Route element={<MobileLayout />}>
            {/* A 온보딩 (하단 메뉴 없음) */}
            <Route path="/" element={<SplashPage />} />
            <Route path="/start" element={<StartPage />} />
            <Route path="/onboarding/intro" element={<IntroPage />} />
            <Route path="/onboarding/helper" element={<HelperPage />} />
            <Route path="/onboarding/name" element={<NamePage />} />
            <Route path="/onboarding/age" element={<AgePage />} />
            <Route path="/onboarding/done" element={<DonePage />} />

            {/* 하단 메뉴가 보이는 화면: 홈·보관함·리포트 */}
            <Route element={<TabLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/report" element={<ReportPage />} />
            </Route>

            {/* E 일기 상세 (Figma E02: 하단 메뉴 없음, 뒤로가기) */}
            <Route path="/archive/:diaryId" element={<DiaryDetailPage />} />

            {/* F 설정 (하단 메뉴 없음) — F02 계정 정보·F05 로그아웃 제외 */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
            <Route
              path="/settings/subscription"
              element={<SubscriptionPage />}
            />
            <Route path="/settings/terms" element={<TermsPage />} />
            <Route path="/settings/support" element={<SupportPage />} />
            <Route path="/settings/version" element={<VersionPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />

            {/* B 일기 작성 진입 (하단 메뉴 없음) */}
            <Route path="/diary/emotion" element={<EmotionPage />} />
            <Route path="/diary/mode" element={<ModePage />} />

            {/* C·D 일기 작성 플로우 (하단 메뉴 없음) */}
            <Route path="/diary/write" element={<WritePage />} />
            <Route path="/diary/question/:order" element={<QuestionRoute />} />
            <Route path="/diary/review" element={<ReviewPage />} />
            <Route path="/diary/complete" element={<CompletePage />} />
          </Route>
        </Routes>
      </DiaryProvider>
    </OnboardingProvider>
  );
}

export default App;
