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

// 서버가 온보딩 미완료라고 답하면 남아 있던 true 값을 덮어쓴다
export const markNotOnboarded = () => writeStorage(ONBOARDED_KEY, "false");

// 게스트 사용자 구분용 클라이언트 ID — 서버가 이 값으로 기기(브라우저)별 사용자를 구분한다
export const CLIENT_ID_KEY = "thought-power:client-id";

// crypto.getRandomValues도 없는 아주 오래된 브라우저를 위한 최종 대체
function randomUUIDFallback() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateClientId() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    // iOS 15.4 미만 등 randomUUID 미지원 브라우저용 대체 (crypto.getRandomValues는 더 널리 지원됨)
    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
    }
  }
  return randomUUIDFallback();
}

// 페이지 세션 안에서는 localStorage가 막혀 있어도 같은 ID를 쓰기 위한 메모리 캐시
let cachedClientId = null;

export function getClientId() {
  if (cachedClientId) return cachedClientId;

  const stored = readStorage(CLIENT_ID_KEY);
  if (stored) {
    cachedClientId = stored;
    return cachedClientId;
  }

  const generated = generateClientId();
  cachedClientId = generated;
  writeStorage(CLIENT_ID_KEY, generated);
  return cachedClientId;
}
