import client from "@/api/client";
import { USE_MOCK, mockResponse } from "@/api/mock";
import { EMOTIONS } from "@/constants/emotions";
import {
  DEMO_SEED_ENABLED,
  findSeedDiary,
  getSeedDiaries,
  hideSeedDiary,
  isSeedId,
} from "@/mocks/demoSeed";
import { mockDiaries, removeMockDiary } from "@/mocks/diaries";
import { buildReportText } from "@/mocks/report";
import { parseISODate, toISODate } from "@/utils/date";

// 보관함·리포트(E) API — USE_MOCK=false면 실서버, true면 src/mocks
// 응답 필드는 여기서 화면 형식으로 바꿔 화면 컴포넌트는 그대로 쓴다

// 시연용 시드(VITE_DEMO_SEED=true, 실서버 모드 전용) — src/mocks/demoSeed.js
// 실서버 응답을 받은 "뒤" 화면용 데이터에만 합친다. 서버 요청·에러 처리는 그대로 둔다.
// 시드 코드가 실패하면 실서버 데이터만 돌려준다.
const SEED_ON = DEMO_SEED_ENABLED && !USE_MOCK;

function withSeed(serverData, merge) {
  if (!SEED_ON) return serverData;
  try {
    return merge(serverData);
  } catch (e) {
    console.warn("[demoSeed] 시드 병합 실패 — 실서버 데이터만 표시", e);
    return serverData;
  }
}

const byDateThenId = (a, b) =>
  a.date.localeCompare(b.date) || (a.diaryId ?? 0) - (b.diaryId ?? 0);

/**
 * 보관함 달력 — 해당 월에 일기가 있는 날짜 [{ diaryId?, date, emotion }]
 * 실서버 GET /api/diaries/calendar?year&month → days[{ date, diaryCount, emotions[] }]
 * 달력 응답에는 diaryId가 없어서 실서버에서는 diaryId 없이 돌려준다 → 상세 이동 시 getDiariesByDate로 찾는다
 */
export async function getMonthlyDiaries(year, month) {
  if (!USE_MOCK) {
    const { data } = await client.get("/api/diaries/calendar", {
      params: { year, month },
    });
    const list = (data?.days ?? [])
      .filter((d) => d.diaryCount > 0 || d.emotions?.length)
      .map((d) => ({ date: d.date, emotion: d.emotions?.[0] ?? null }));
    // 실서버 일기가 있는 날짜는 실서버 우선, 시드는 diaryId(음수)를 함께 넘겨 바로 상세로 간다
    return withSeed(list, (real) => {
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      const realDates = new Set(real.map((d) => d.date));
      const seeds = getSeedDiaries()
        .filter((s) => s.date.startsWith(prefix) && !realDates.has(s.date))
        .map(({ diaryId, date, emotion }) => ({ diaryId, date, emotion }));
      return seeds.length ? [...real, ...seeds].sort(byDateThenId) : real;
    });
  }
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const list = mockDiaries
    .filter((d) => d.date.startsWith(prefix))
    .map(({ diaryId, date, emotion }) => ({ diaryId, date, emotion }));
  return mockResponse(list);
}

/**
 * 날짜별 일기 목록 [{ diaryId, date, emotion, contentPreview? }] — 없으면 []
 * 실서버 GET /api/diaries?date=YYYY-MM-DD → { diaries: [...] }
 */
export async function getDiariesByDate(date) {
  const list = await fetchDiariesByDate(date);
  // 실서버에 그 날짜 일기가 있으면 실서버 그대로, 없을 때만 시드
  return withSeed(list, (real) => {
    if (real.length) return real;
    return getSeedDiaries()
      .filter((s) => s.date === date)
      .map(({ diaryId, date: day, emotion, content }) => ({
        diaryId,
        date: day,
        emotion,
        contentPreview: content,
      }));
  });
}

// 날짜별 조회 원본 (시드 없음)
async function fetchDiariesByDate(date) {
  if (!USE_MOCK) {
    const { data } = await client.get("/api/diaries", { params: { date } });
    return data?.diaries ?? [];
  }
  const list = mockDiaries
    .filter((d) => d.date === date)
    .map(({ diaryId, date: day, emotion, content }) => ({
      diaryId,
      date: day,
      emotion,
      contentPreview: content,
    }));
  return mockResponse(list);
}

/** 오늘 쓴 일기 { diaryId, date, emotion } 또는 null — 날짜별 조회로 확인 (하루 1개 제한 확인용, 시드 제외) */
export async function getTodayDiary() {
  const list = await fetchDiariesByDate(toISODate());
  return list[0] ?? null;
}

/**
 * 일기 상세 — { diaryId, date, emotion, content, questions[{ order, type, content, answer }] } 또는 null(없는 일기)
 * 실서버 GET /api/diaries/{diaryId}: 질문 문장이 question 필드로 와서 content로 바꾼다. 404면 null
 */
export async function getDiary(diaryId) {
  // 시드(음수 id)는 서버에 요청하지 않고 고정 데이터로 보여준다
  if (SEED_ON && isSeedId(diaryId)) {
    try {
      const seed = findSeedDiary(diaryId);
      return seed && structuredClone(seed);
    } catch {
      return null;
    }
  }
  if (!USE_MOCK) {
    try {
      const { data } = await client.get(
        `/api/diaries/${encodeURIComponent(diaryId)}`,
      );
      return {
        ...data,
        questions: (data.questions ?? [])
          .map(({ question, content, ...q }) => ({
            ...q,
            content: content ?? question,
            answer: q.answer ?? "",
          }))
          .sort((a, b) => a.order - b.order),
      };
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 400) return null;
      throw e;
    }
  }
  const diary = mockDiaries.find((d) => d.diaryId === Number(diaryId));
  return mockResponse(diary ?? null);
}

/** 일기 삭제 — 실서버 DELETE /api/diaries/{diaryId} (200) */
export async function deleteDiary(diaryId) {
  // 시드(음수 id)는 서버에 요청하지 않고 화면에서만 숨긴다 (새로고침하면 다시 보임)
  if (SEED_ON && isSeedId(diaryId)) {
    hideSeedDiary(diaryId);
    return { diaryId, deleted: true };
  }
  if (!USE_MOCK) {
    await client.delete(`/api/diaries/${encodeURIComponent(diaryId)}`);
    return { diaryId, deleted: true };
  }
  removeMockDiary(diaryId);
  return mockResponse({ diaryId, deleted: true });
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * 원시 응답(days[].diaries + 문구 4개 snake_case) → 화면에서 쓰는 객체(days[].emotions + camelCase 문구)로 변환.
 * 날짜는 새로 만들지 않고 원본 days의 날짜를 그대로 쓴다. legend는 화면에서 안 써서 매핑하지 않는다.
 * mock·실서버 응답 모두 이 함수 하나로 변환한다.
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
    days: (days ?? []).map(({ date, diaries }) => ({
      date,
      emotions: (diaries ?? []).map((d) => d.emotion),
    })),
    mostEmotionReason: most_emotion_reason,
    leastEmotionReason: least_emotion_reason,
    parentAdvice: parent_advice,
    trendInterpretation: trend_interpretation,
  };
}

/**
 * 감정 리포트 — GET /api/reports/emotions?startDate&endDate 응답 형식 (실서버 확인 완료)
 * AI 실패 시 백엔드가 기본 문구를 채워 주므로 받은 문구를 그대로 표시한다
 * { startDate, endDate, totalDiaryCount, distribution[{emotion,count,ratio}],
 *   mostFrequentEmotions[], leastFrequentEmotions[](0건 감정 포함),
 *   most_emotion_reason, least_emotion_reason, parent_advice (snake_case),
 *   days[{date, diaries[{diaryId,emotion}]}](기간 내 모든 날짜),
 *   legend({JOY:"기쁨", ...}), trend_interpretation (snake_case) }
 */
export async function getEmotionReport(startDate, endDate) {
  if (!USE_MOCK) {
    const { data } = await client.get("/api/reports/emotions", {
      params: { startDate, endDate },
    });
    // 기간에 보여줄 시드가 있으면 실서버 일기(days) + 시드로 프론트에서 다시 집계, 없으면 실서버 응답 그대로
    return withSeed(mapReportResponse(data), (serverReport) => {
      const real = (data?.days ?? []).flatMap(({ date, diaries }) =>
        (diaries ?? []).map(({ diaryId, emotion }) => ({
          diaryId,
          date,
          emotion,
        })),
      );
      const realDates = new Set(real.map((d) => d.date));
      const seeds = getSeedDiaries().filter(
        (s) =>
          s.date >= startDate && s.date <= endDate && !realDates.has(s.date),
      );
      if (!seeds.length) return serverReport;
      return mapReportResponse(
        buildReport(startDate, endDate, [...real, ...seeds]),
      );
    });
  }

  const inRange = mockDiaries.filter(
    (d) => d.date >= startDate && d.date <= endDate,
  );
  return mockResponse(
    mapReportResponse(buildReport(startDate, endDate, inRange)),
  );
}

/**
 * 일기 목록 [{ diaryId, date, emotion }] → 리포트 원시 응답 형식(실서버와 같은 필드)
 * 문구는 buildReportText로 집계 결과에서 만든다 (mock · 시드 병합 공용)
 */
function buildReport(startDate, endDate, diaries) {
  const inRange = [...diaries].sort(byDateThenId);
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

  return {
    startDate,
    endDate,
    totalDiaryCount: total,
    distribution,
    mostFrequentEmotions,
    leastFrequentEmotions,
    // 문구는 집계 결과로 만든다 (실서버만 쓸 때는 BE2가 AI 응답을 합쳐서 반환)
    ...buildReportText(
      distribution,
      mostFrequentEmotions,
      leastFrequentEmotions,
      recorded,
    ),
    days,
    legend,
  };
}
