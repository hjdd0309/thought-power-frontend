import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "@/api/settings";
import profileChevron from "@/assets/icons/profile-chevron.svg";
import profileIcon from "@/assets/icons/profile.svg";
import SettingRow from "@/components/SettingRow";
import TopBar from "@/components/TopBar";
import { getGuardianLabel } from "@/constants/onboarding";

const MENU = [
  { to: "/settings/subscription", label: "구독 관리" },
  { to: "/settings/terms", label: "이용약관" },
  { to: "/settings/support", label: "고객센터" },
  { to: "/settings/version", label: "버전 정보" },
];

// F01 설정 — 프로필(개인정보 관리)·구독 관리·이용약관·고객센터·버전 정보
// 계정 정보(F02)·로그아웃(F05)은 로그인 제외 조건으로 구현 제외
function SettingsPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let ignore = false;
    getProfile().then((p) => {
      if (!ignore) setProfile(p);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <TopBar title="설정" />
      <main className="flex flex-col px-5 pb-10">
        <p className="mt-10 text-body-sm font-medium text-muted">프로필</p>
        <Link
          to="/settings/profile"
          className="mt-4.75 flex h-25 items-center justify-between rounded-bubble bg-border-neutral p-5"
        >
          <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-yellow">
            <img src={profileIcon} alt="" width={28} height={28} />
          </span>
          <span className="flex w-54.5 flex-col gap-2">
            <span className="text-lead font-bold text-ink">
              {profile ? `${profile.name}, ${profile.age}세` : ""}
            </span>
            <span className="text-body-sm font-medium text-muted">
              보호자 유형: {profile && getGuardianLabel(profile.guardianType)}
            </span>
          </span>
          <img src={profileChevron} alt="" width={16} height={20} />
        </Link>

        <ul className="mt-4.75 border-t border-border-neutral">
          {MENU.map((m) => (
            <li key={m.to} className="border-b border-border-neutral">
              <SettingRow to={m.to}>{m.label}</SettingRow>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default SettingsPage;
