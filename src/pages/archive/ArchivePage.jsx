import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDiariesByDate, getMonthlyDiaries } from "@/api/archive";
import backIcon from "@/assets/icons/back.svg";
import rightIcon from "@/assets/icons/right.svg";
import Button from "@/components/Button";
import EmotionCharacter from "@/components/EmotionCharacter";
import ErrorRetry from "@/components/ErrorRetry";
import { LoadingDots } from "@/components/LoadingState";
import useRequest from "@/hooks/useRequest";
import { getEmotion } from "@/constants/emotions";
import { formatDotDate, toISODate } from "@/utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DOUBLE_TAP_MS = 350;

function buildMonth(year, month) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = Array(first.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(year, month - 1, day)));
  }
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );
}

function PeriodRow({ label, value, placeholder }) {
  return (
    <div className="flex h-6 items-center gap-3.5 text-body-sm font-medium">
      <span className="w-12 text-muted">{label}</span>
      <span className="text-ink">
        {value ? formatDotDate(value) : placeholder}
      </span>
    </div>
  );
}

// E01 보관함 — 월별 달력, 날짜 한 번: 리포트 기간 선택 / 두 번: 일기 조회, 기간 오류 안내
function ArchivePage() {
  const navigate = useNavigate();
  const today = toISODate();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const monthly = useRequest(
    () => getMonthlyDiaries(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );
  const diaries = monthly.data ?? [];
  const [range, setRange] = useState({ start: null, end: null });
  const [error, setError] = useState("");
  const lastTap = useRef({ date: null, at: 0 });

  const diaryByDate = Object.fromEntries(diaries.map((d) => [d.date, d]));
  const weeks = buildMonth(cursor.year, cursor.month);
  const isCurrentMonth =
    `${cursor.year}-${String(cursor.month).padStart(2, "0")}` >=
    today.slice(0, 7);

  const moveMonth = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  // 실서버 달력 응답에는 diaryId가 없어 일기가 있는 날짜면 날짜별 조회로 id를 찾는다
  const openDiary = async (date) => {
    const diary = diaryByDate[date];
    if (!diary) {
      navigate(`/archive/empty?date=${date}`);
      return;
    }
    let { diaryId } = diary;
    if (diaryId == null) {
      try {
        diaryId = (await getDiariesByDate(date))[0]?.diaryId;
      } catch {
        setError("일기를 불러오지 못했어요. 다시 눌러 주세요.");
        return;
      }
    }
    navigate(
      diaryId != null ? `/archive/${diaryId}` : `/archive/empty?date=${date}`,
    );
  };

  const selectForRange = (date) => {
    setError("");
    if (!range.start || range.end) {
      setRange({ start: date, end: null });
    } else if (date < range.start) {
      setError("종료 날짜는 시작 날짜 이후로 선택해주세요.");
    } else {
      setRange({ start: range.start, end: date });
    }
  };

  const handleTap = (date, event) => {
    const now = event.timeStamp;
    const isDouble =
      lastTap.current.date === date && now - lastTap.current.at < DOUBLE_TAP_MS;
    lastTap.current = { date, at: now };
    if (isDouble) openDiary(date);
    else selectForRange(date);
  };

  const inRange = (date) =>
    range.start && date >= range.start && date <= (range.end ?? range.start);

  return (
    <main className="flex flex-col px-5">
      <h1 className="mt-5.75 text-center text-lead font-bold">보관함</h1>

      <div className="mt-10.25 flex items-center justify-between px-4.5">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => moveMonth(-1)}
        >
          <img src={backIcon} alt="" width={20} height={20} />
        </button>
        <p className="relative text-title font-bold">
          {cursor.year}년 {cursor.month}월
          {monthly.loading && (
            <LoadingDots className="absolute top-full left-1/2 mt-1 -translate-x-1/2 scale-75" />
          )}
        </p>
        <button
          type="button"
          aria-label="다음 달"
          disabled={isCurrentMonth}
          onClick={() => moveMonth(1)}
          className="disabled:opacity-30"
        >
          <img src={rightIcon} alt="" width={20} height={20} />
        </button>
      </div>

      <div className="mt-10.75 flex flex-col gap-1">
        <div className="flex h-7 justify-between text-center text-body-sm font-medium text-muted">
          {WEEKDAYS.map((w) => (
            <span key={w} className="w-11.5">
              {w}
            </span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex h-13 justify-between">
            {week.map((date, di) => {
              if (!date) return <span key={di} className="w-11.5" />;
              const day = Number(date.slice(8));
              const future = date > today;
              const emotion = getEmotion(diaryByDate[date]?.emotion);
              const selected = inRange(date);
              return (
                <button
                  key={date}
                  type="button"
                  disabled={future}
                  onClick={(e) => handleTap(date, e)}
                  aria-label={`${cursor.month}월 ${day}일${
                    emotion ? ` ${emotion.label}` : ""
                  }`}
                  aria-pressed={Boolean(selected)}
                  className={`relative flex h-13 w-11.5 flex-col items-center justify-center rounded-[22px] font-medium ${
                    emotion ? "text-label" : "text-body-sm"
                  } ${future ? "text-muted" : "text-ink"} ${
                    selected ? "bg-yellow-light" : ""
                  }`}
                >
                  {day}
                  {/* 일기가 있는 날: 그날 감정 이모지를 작게 */}
                  {emotion && (
                    <EmotionCharacter emotion={emotion.code} size={26} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {monthly.error && (
        <ErrorRetry
          compact
          className="mt-3.5"
          message="일기 기록을 불러오지 못했어요."
          onRetry={monthly.retry}
        />
      )}

      <section className="mt-3.5 flex h-24.75 flex-col justify-center gap-3 rounded-bubble border border-border-neutral bg-white px-5">
        <PeriodRow
          label="시작일"
          value={range.start}
          placeholder="시작 날짜를 선택해주세요"
        />
        <PeriodRow
          label="종료일"
          value={range.end}
          placeholder="종료 날짜를 선택해주세요"
        />
      </section>
      <p
        role={error ? "alert" : undefined}
        className="mt-3.25 text-center text-body-sm font-medium text-yellow"
      >
        {error || "날짜를 두 번 누르면 일기 기록을 볼 수 있어요."}
      </p>

      <Button
        className="mt-8"
        disabled={!range.start || !range.end}
        onClick={() =>
          navigate(`/report?start=${range.start}&end=${range.end}`)
        }
      >
        선택한 기간 리포트 보기
      </Button>
      <div className="h-11" />
    </main>
  );
}

export default ArchivePage;
