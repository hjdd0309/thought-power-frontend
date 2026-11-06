import { useState } from "react";
import { useNavigate } from "react-router-dom";
import checkIcon from "@/assets/icons/check.svg";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { AGREEMENT_ITEMS } from "@/constants/onboarding";
import { useOnboarding } from "@/contexts/onboarding";

function AgreeRow({ checked, bold = false, onToggle, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex h-12 w-full items-center gap-3 text-left"
    >
      <span
        className={`relative size-5.5 shrink-0 rounded-full border border-border-neutral ${
          checked ? "bg-yellow" : "bg-white"
        }`}
      >
        {checked && (
          <img
            src={checkIcon}
            alt=""
            width={16}
            height={16}
            className="absolute top-0.5 left-0.5"
          />
        )}
      </span>
      <span
        className={`text-body-sm ${bold ? "font-bold" : "font-medium"} text-ink`}
      >
        {children}
      </span>
    </button>
  );
}

// A02 서비스 시작(배경) + A03/A03C 약관 동의 바텀시트
// 배경에 시작 버튼이 없으므로 진입 시 시트를 자동으로 연다.
function StartPage() {
  const navigate = useNavigate();
  const { agreements, update } = useOnboarding();
  const [checked, setChecked] = useState(agreements);

  const allChecked = AGREEMENT_ITEMS.every(({ key }) => checked[key]);

  const toggle = (key) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleAll = () =>
    setChecked(
      Object.fromEntries(AGREEMENT_ITEMS.map(({ key }) => [key, !allChecked])),
    );

  const handleDone = () => {
    update({ agreements: checked });
    navigate("/onboarding/intro");
  };

  return (
    <main className="flex flex-1 flex-col items-center pt-80.25 text-center">
      <p className="text-body-sm font-medium text-ink">
        질문으로 생각을 키우는 AI 일기 서비스
      </p>
      <h1 className="mt-4.5 font-logo text-[56px] leading-[1.2] text-yellow">
        생각의힘
      </h1>

      {/* 필수 동의라 바깥 영역을 눌러도 닫지 않는다 */}
      <BottomSheet open onClose={() => {}}>
        <div className="flex items-start justify-between pt-1.5">
          <h2 className="text-title font-bold">이용약관</h2>
          <Button
            size="sm"
            disabled={!allChecked}
            onClick={handleDone}
            className="-mt-1.5"
          >
            완료
          </Button>
        </div>
        <div className="mt-6.5 flex flex-col gap-1.5">
          {AGREEMENT_ITEMS.map(({ key, label }) => (
            <AgreeRow
              key={key}
              checked={checked[key]}
              onToggle={() => toggle(key)}
            >
              {label}
            </AgreeRow>
          ))}
          <AgreeRow checked={allChecked} bold onToggle={toggleAll}>
            전체 동의
          </AgreeRow>
        </div>
      </BottomSheet>
    </main>
  );
}

export default StartPage;
