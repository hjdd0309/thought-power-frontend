import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getEmotionReport } from "@/api/archive";
import { USE_MOCK } from "@/api/mock";
import ErrorRetry from "@/components/ErrorRetry";
import LoadingState from "@/components/LoadingState";
import TopBar from "@/components/TopBar";
import useRequest from "@/hooks/useRequest";
import { EMOTIONS, getEmotion } from "@/constants/emotions";
import { formatDotDate, toISODate } from "@/utils/date";
import EmotionBarChart from "@/pages/report/EmotionBarChart";
import EmotionTrendChart from "@/pages/report/EmotionTrendChart";

const TABS = [
  { key: "analysis", label: "감정 분석" },
  { key: "trend", label: "변화 추이" },
];

function ReportTabs({ tab, onChange }) {
  return (
    <div className="relative mt-5.75 flex h-12 rounded-2xl bg-border-neutral">
      <span
        className={`absolute inset-y-0 w-47.25 rounded-2xl bg-yellow transition-all ${
          tab === "analysis" ? "left-0" : "left-43.25"
        }`}
      />
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={tab === t.key}
          onClick={() => onChange(t.key)}
          className="relative flex-1 text-body-sm font-medium"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function InsightCard({ title, children, highlight = false }) {
  return (
    <div
      className={`flex min-h-20.5 flex-col justify-center gap-3 rounded-bubble px-6.5 py-3.75 ${
        highlight ? "bg-yellow-light" : "bg-border-neutral"
      }`}
    >
      <p className="text-body font-bold">{title}</p>
      <p className="text-body-sm font-medium text-muted">{children}</p>
    </div>
  );
}

const fmtRatio = (r) => `${Math.round(r * 10) / 10}%`;

// 가장 자주 / 가장 적게 느낀 감정 (기록 1개 이상 중)
function summarize(distribution, total) {
  const recorded = distribution.filter((d) => d.count > 0);
  if (!recorded.length) return null;
  const max = Math.max(...recorded.map((d) => d.count));
  const min = Math.min(...recorded.map((d) => d.count));
  const names = (count) =>
    recorded
      .filter((d) => d.count === count)
      .map((d) => getEmotion(d.emotion).label)
      .join("·");
  const ratioOf = (count) => fmtRatio((count / total) * 100);
  const many = (count) => recorded.filter((d) => d.count === count).length > 1;
  const countText = (count) =>
    `${many(count) ? "각각 " : `전체 ${total}개 중 `}${count}개 (${ratioOf(count)})로 기록됐어요.`;

  // 기록한 감정 수가 모두 같으면 최다·최소를 나누지 않고 카드 하나로
  if (max === min && recorded.length > 1) {
    return {
      most: {
        title: `비슷하게 느낀 감정 - ${names(max)}`,
        text: countText(max),
      },
      least: null,
    };
  }
  return {
    most: {
      title: `가장 자주 느낀 감정 - ${names(max)}`,
      text: countText(max),
    },
    least: {
      title: `가장 적게 느낀 감정 - ${names(min)}`,
      text: countText(min),
    },
  };
}

// E04 감정 분석 / E05 변화 추이 — 리포트 조회 하나로 두 탭을 그린다
function ReportPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const today = toISODate();
  const start = params.get("start") ?? `${today.slice(0, 8)}01`;
  const end = params.get("end") ?? today;
  const [tab, setTab] = useState("analysis");
  const {
    data: report,
    loading,
    error,
    retry,
  } = useRequest(() => getEmotionReport(start, end), [start, end]);

  const total = report?.totalDiaryCount ?? 0;
  const summary = report && summarize(report.distribution, total);

  return (
    <>
      <TopBar title="나의 감정 리포트" onBack={() => navigate("/archive")} />
      <main className="flex flex-col px-5 pb-8">
        <p className="mt-8.25 flex justify-center gap-2 text-body-sm font-medium">
          <span>{formatDotDate(start)}</span>
          <span>–</span>
          <span>{formatDotDate(end)}</span>
        </p>
        <ReportTabs tab={tab} onChange={setTab} />
        <p className="mt-4 min-h-4 text-center text-label font-medium text-muted">
          {report && (
            <>
              {USE_MOCK && "예시 데이터 · "}일기 {total}개
            </>
          )}
        </p>

        {loading && (
          <LoadingState
            className="mt-10"
            character="note"
            message="리포트를 만들고 있어요"
          />
        )}
        {error && (
          <ErrorRetry
            className="mt-10"
            message={"리포트를 불러오지 못했어요."}
            onRetry={retry}
          />
        )}

        {report && tab === "analysis" && (
          <>
            <div className="mt-3">
              <EmotionBarChart distribution={report.distribution} />
            </div>
            <div className="mt-8.75 flex flex-col gap-4">
              {summary ? (
                <>
                  <InsightCard title={summary.most.title}>
                    {summary.most.text}
                  </InsightCard>
                  {summary.least && (
                    <InsightCard title={summary.least.title}>
                      {summary.least.text}
                    </InsightCard>
                  )}
                </>
              ) : (
                <p className="py-5 text-center text-body font-medium">
                  {report.description}
                </p>
              )}
              <InsightCard title="오늘의 한 줄 조언" highlight>
                {report.advice}
              </InsightCard>
            </div>
          </>
        )}

        {report && tab === "trend" && (
          <>
            <div className="mt-7.75">
              <EmotionTrendChart days={report.days} />
            </div>
            <div className="mt-8 flex gap-2">
              {EMOTIONS.map((e) => (
                <div
                  key={e.code}
                  className="flex w-12.75 flex-col items-center gap-1.5"
                >
                  <span
                    className="size-2.5 rounded-[5px]"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="text-legend font-medium text-muted">
                    {e.label}
                  </span>
                </div>
              ))}
            </div>
            {/* TODO: 카드 제목에 해당하는 필드가 API 명세에 없음 (DB에는 trend_title) — 백엔드와 확정 */}
            <section className="mt-8.25 min-h-37.25 rounded-card bg-yellow-light px-6 pt-4 pb-6">
              <p className="text-body font-bold">다양한 마음을 기록했어요</p>
              <p className="mt-3.5 text-body-sm font-medium text-muted">
                {report.interpretation}
              </p>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default ReportPage;
