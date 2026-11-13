import { getMonthlyDiaries } from "@/api/archive";
import { parseISODate, toISODate } from "@/utils/date";

// 홈 "N일째 일기 쓰는 중 · 이번 달 스티커 N개" — 보관함 달력 조회(getMonthlyDiaries)만으로 계산
// 전체 일기 수를 주는 API가 없어 스티커는 이번 달 일기 수(일기 1개 = 스티커 1개)로 센다
const MAX_MONTHS = 12; // 연속 기록을 거슬러 확인할 최대 개월 수

const dayBefore = (iso) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() - 1);
  return toISODate(d);
};

/**
 * { streak, monthStickers }
 * - streak: 오늘(오늘 아직 안 썼으면 어제)부터 거꾸로 하루도 빠짐없이 쓴 날 수
 * - monthStickers: 이번 달 일기 수
 */
export async function getDiaryStats(today = toISODate()) {
  const dates = new Set();
  // 불러온 달 중 가장 이른 달의 1일 — 연속 기록이 이보다 앞으로 이어지면 이전 달을 더 불러온다
  let loadedFrom = parseISODate(`${today.slice(0, 8)}01`);

  const current = await getMonthlyDiaries(
    loadedFrom.getFullYear(),
    loadedFrom.getMonth() + 1,
  );
  current.forEach((d) => dates.add(d.date));

  let day = dates.has(today) ? today : dayBefore(today);
  let streak = 0;
  for (let months = 1; ; months += 1) {
    while (dates.has(day)) {
      streak += 1;
      day = dayBefore(day);
    }
    if (day >= toISODate(loadedFrom) || months >= MAX_MONTHS) break;
    loadedFrom = new Date(
      loadedFrom.getFullYear(),
      loadedFrom.getMonth() - 1,
      1,
    );
    const prev = await getMonthlyDiaries(
      loadedFrom.getFullYear(),
      loadedFrom.getMonth() + 1,
    );
    prev.forEach((d) => dates.add(d.date));
  }

  return { streak, monthStickers: current.length };
}
