// 색종이 터지는 연출 — 가운데에서 사방으로 퍼졌다가 떨어진다 (CSS 애니메이션만 사용)
// 조각 위치·색·회전은 매번 같은 값이 나오도록 인덱스로 계산한다
const COLORS = [
  "var(--color-emotion-joy)",
  "var(--color-emotion-sadness)",
  "var(--color-emotion-anger)",
  "var(--color-emotion-fear)",
  "var(--color-emotion-surprise)",
  "var(--color-emotion-shame)",
];

const PIECES = Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.3;
  const distance = 90 + ((i * 37) % 70);
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance * 0.8 - 40),
    rotate: ((i * 73) % 360) + 360,
    delay: (i % 6) * 40,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
  };
});

function Confetti({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-visible motion-reduce:hidden ${className}`}
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`absolute top-1/3 left-1/2 animate-confetti ${
            p.round ? "size-2.5 rounded-full" : "h-3.5 w-2 rounded-[2px]"
          }`}
          style={{
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            "--rot": `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
