const pad = (n) => String(n).padStart(2, "0");

/** Date → "2026-10-15" (API 날짜 형식) */
export const toISODate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "2026-10-15" → Date (로컬 자정) */
export const parseISODate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** "2026-10-15" → "2026년 10월 15일" */
export const formatKoreanDate = (iso) => {
  const d = parseISODate(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/** "2026-10-15" → "10월 15일" */
export const formatMonthDay = (iso) => {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/** "2026-10-15" → "2026.10.15" */
export const formatDotDate = (iso) => iso.replaceAll("-", ".");

/** 초 → "00:18" */
export const formatDuration = (seconds) =>
  `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
