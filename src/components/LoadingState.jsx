import Character from "@/components/Character";

// 생각 중 점 3개 (노란 점이 차례로 튀어 오름)
export function LoadingDots({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-hidden="true"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2.5 animate-bounce rounded-full bg-yellow"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

// 로딩 안내 — 캐릭터가 고개를 갸웃하며 생각하고 점이 차례로 튄다 (250ms 뒤 등장)
function LoadingState({
  message = "불러오고 있어요",
  character = "smile",
  size = 150,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex animate-fade-in-delayed flex-col items-center gap-4 py-8 text-center ${className}`}
    >
      <div className="origin-bottom animate-think">
        <Character name={character} size={size} />
      </div>
      <LoadingDots />
      <p className="text-body-sm font-medium text-muted">{message}</p>
    </div>
  );
}

export default LoadingState;
