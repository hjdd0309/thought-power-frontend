import { Route, Routes } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import OnboardingProvider from "@/contexts/OnboardingProvider";
import HomePage from "@/pages/HomePage.jsx";
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
      <Routes>
        <Route element={<MobileLayout />}>
          {/* A 온보딩 */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/onboarding/intro" element={<IntroPage />} />
          <Route path="/onboarding/helper" element={<HelperPage />} />
          <Route path="/onboarding/name" element={<NamePage />} />
          <Route path="/onboarding/age" element={<AgePage />} />
          <Route path="/onboarding/done" element={<DonePage />} />

          {/* B 홈 */}
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Routes>
    </OnboardingProvider>
  );
}

export default App;
