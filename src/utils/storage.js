// localStorage 안전 래퍼 — 시크릿 모드·저장소 차단 등에서 예외가 나도 앱이 멈추지 않게 한다

// 온보딩 완료 여부. 초기화하려면 브라우저 개발자도구에서 이 키를 삭제한다.
export const ONBOARDED_KEY = "thought-power:onboarded";

export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장 실패 시 다음 방문에 온보딩이 다시 보일 뿐이므로 무시
  }
}

export const isOnboarded = () => readStorage(ONBOARDED_KEY) === "true";

export const markOnboarded = () => writeStorage(ONBOARDED_KEY, "true");
