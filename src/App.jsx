import { Route, Routes } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import TabLayout from "@/components/layout/TabLayout";
import DiaryProvider from "@/contexts/DiaryProvider";
import OnboardingProvider from "@/contexts/OnboardingProvider";
import EmotionPage from "@/pages/diary/EmotionPage";
import ModePage from "@/pages/diary/ModePage";
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
            </Route>

            {/* B 일기 작성 진입 (하단 메뉴 없음) */}
            <Route path="/diary/emotion" element={<EmotionPage />} />
            <Route path="/diary/mode" element={<ModePage />} />
          </Route>
        </Routes>
      </DiaryProvider>
    </OnboardingProvider>
  );
}

export default App;
