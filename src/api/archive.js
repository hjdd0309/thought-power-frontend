import { mockResponse } from "@/api/mock";
import { EMOTIONS } from "@/constants/emotions";
import { mockDiaries, removeMockDiary } from "@/mocks/diaries";
import { buildReportText } from "@/mocks/report";
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

/** 오늘 쓴 일기 { diaryId, date, emotion } 또는 null — 월별 목록에서 찾는다 (하루 1개 제한 확인용) */
export async function getTodayDiary() {
  const today = new Date();
  const list = await getMonthlyDiaries(
    today.getFullYear(),
    today.getMonth() + 1,
  );
  return list.find((d) => d.date === toISODate(today)) ?? null;
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
 * 원시 응답(days[].diaries + 문구 4개 snake_case) → 화면에서 쓰는 객체(days[].emotions + camelCase 문구)로 변환.
 * 날짜는 새로 만들지 않고 원본 days의 날짜를 그대로 쓴다. legend는 화면에서 안 써서 매핑하지 않는다.
 * 실제 API 연동 때도 이 함수 하나로 변환한다.
 */
function mapReportResponse(raw) {
  const {
    most_emotion_reason,
    least_emotion_reason,
    parent_advice,
    trend_interpretation,
    days,
    legend: _legend,
    ...rest
  } = raw;

  return {
    ...rest,
    days: days.map(({ date, diaries }) => ({
      date,
      emotions: diaries.map((d) => d.emotion),
    })),
    mostEmotionReason: most_emotion_reason,
    leastEmotionReason: least_emotion_reason,
    parentAdvice: parent_advice,
    trendInterpretation: trend_interpretation,
  };
}

/**
 * 감정 리포트 — GET /api/reports/emotions 응답 형식 (노션 API 명세 기준)
 * { startDate, endDate, totalDiaryCount, distribution[{emotion,count,ratio}],
 *   mostFrequentEmotions[], leastFrequentEmotions[](0건 감정 포함),
 *   most_emotion_reason, least_emotion_reason, parent_advice (snake_case),
 *   days[{date, diaries[{diaryId,emotion}]}](기간 내 모든 날짜),
 *   legend({JOY:"기쁨", ...}), trend_interpretation (snake_case) }
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

  const max = total ? Math.max(...distribution.map((d) => d.count)) : 0;
  const min = total ? Math.min(...distribution.map((d) => d.count)) : 0;
  const mostFrequentEmotions = total
    ? distribution.filter((d) => d.count === max).map((d) => d.emotion)
    : [];
  const leastFrequentEmotions = total
    ? distribution.filter((d) => d.count === min).map((d) => d.emotion)
    : [];

  const days = [];
  for (
    let d = parseISODate(startDate);
    d <= parseISODate(endDate);
    d.setDate(d.getDate() + 1)
  ) {
    const date = toISODate(d);
    days.push({
      date,
      diaries: inRange
        .filter((x) => x.date === date)
        .map(({ diaryId, emotion }) => ({ diaryId, emotion })),
    });
  }

  const recorded = days.flatMap((d) => d.diaries.map((x) => x.emotion));

  const legend = Object.fromEntries(
    EMOTIONS.map(({ code, label }) => [code, label]),
  );

  const raw = {
    startDate,
    endDate,
    totalDiaryCount: total,
    distribution,
    mostFrequentEmotions,
    leastFrequentEmotions,
    // mock: AI 문구를 집계 결과로 만든다 (실서버에서는 BE2가 AI 응답을 합쳐서 반환)
    ...buildReportText(
      distribution,
      mostFrequentEmotions,
      leastFrequentEmotions,
      recorded,
    ),
    days,
    legend,
  };

  return mockResponse(mapReportResponse(raw));
}
