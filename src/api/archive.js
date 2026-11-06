import { mockResponse } from "@/api/mock";
import { EMOTIONS } from "@/constants/emotions";
import { mockDiaries, removeMockDiary } from "@/mocks/diaries";
import { EMPTY_REPORT_TEXT, MOCK_REPORT_TEXT } from "@/mocks/report";
import { parseISODate, toISODate } from "@/utils/date";

// TODO: 백엔드 연결 시 프-백 API 명세 확정 후 각 함수를 client 호출로 교체

/** 보관함 달력 — 해당 월의 일기 목록 [{ diaryId, date, emotion }] */
export async function getMonthlyDiaries(year, month) {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const list = mockDiaries
    .filter((d) => d.date.startsWith(prefix))
    .map(({ diaryId, date, emotion }) => ({ diaryId, date, emotion }));
  return mockResponse(list);
}

/** 일기 상세 */
export async function getDiary(diaryId) {
  const diary = mockDiaries.find((d) => d.diaryId === Number(diaryId));
  return mockResponse(diary ?? null);
}

/** 일기 삭제 */
export async function deleteDiary(diaryId) {
  removeMockDiary(diaryId);
  return mockResponse({ diaryId, deleted: true });
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * 감정 리포트 — GET /api/reports/emotions 응답 형식 (docs/spec.md BE2 ↔ AI 리포트 연동)
 * { startDate, endDate, totalDiaryCount, distribution[{emotion,count,ratio}],
 *   days[{date,emotions[]}], description, advice, interpretation }
 */
export async function getEmotionReport(startDate, endDate) {
  const inRange = mockDiaries
    .filter((d) => d.date >= startDate && d.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.diaryId - b.diaryId);
  const total = inRange.length;

  const distribution = EMOTIONS.map(({ code }) => {
    const count = inRange.filter((d) => d.emotion === code).length;
    return {
      emotion: code,
      count,
      ratio: total ? round2((count / total) * 100) : 0,
    };
  });

  const days = [];
  for (
    let d = parseISODate(startDate);
    d <= parseISODate(endDate);
    d.setDate(d.getDate() + 1)
  ) {
    const date = toISODate(d);
    days.push({
      date,
      emotions: inRange.filter((x) => x.date === date).map((x) => x.emotion),
    });
  }

  return mockResponse({
    startDate,
    endDate,
    totalDiaryCount: total,
    distribution,
    days,
    ...(total ? MOCK_REPORT_TEXT : EMPTY_REPORT_TEXT),
  });
}
