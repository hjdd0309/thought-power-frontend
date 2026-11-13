import { useId } from "react";
import { getEmotion } from "@/constants/emotions";

// 감정 캐릭터 6종 — 홈 캐릭터처럼 둥글고 말랑한 몸통 + 볼터치, 감정마다 모양·표정이 다르다
// 색은 constants/emotions의 감정 색을 그대로 쓰고, 그림자(shade)만 여기서 정한다
// viewBox 0 0 120 120 기준으로 그린 오리지널 SVG
const INK = "#111111";
const BLUSH = "#ff8a6b";

const SHADE = {
  JOY: "#f0b400",
  SADNESS: "#6fbbd8",
  ANGER: "#e0412f",
  FEAR: "#a985c0",
  SURPRISE: "#9fcf4f",
  SHAME: "#f39aa4",
};

// 반짝이는 눈 (검은 타원 + 흰 하이라이트)
function Eye({ cx, cy, rx = 4.5, ry = 5.5 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />
      <circle cx={cx + 1.4} cy={cy - 1.8} r={1.6} fill="#fff" />
    </g>
  );
}

// 동그란 큰 눈 (흰자 + 작은 눈동자) — 무서움·놀람
function WideEye({ cx, cy, r = 8.5, pupil = 4 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy + 1} r={pupil} fill={INK} />
      <circle cx={cx + 1.3} cy={cy - 0.6} r={1.3} fill="#fff" />
    </g>
  );
}

function Blush({ cx, cy, rx = 8, ry = 5, opacity = 0.45 }) {
  return (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={BLUSH} opacity={opacity} />
  );
}

const line = {
  fill: "none",
  stroke: INK,
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// 감정별 몸통 실루엣·장식(extra)·얼굴
const SHAPES = {
  // 기쁨 — 동글동글 몸통 + 머리 위 새싹 컬, 웃는 눈과 활짝 웃는 입
  JOY: {
    body: "M60 18C88 18 104 36 104 62C104 88 86 102 60 102C34 102 16 88 16 62C16 36 32 18 60 18Z",
    extra: (shade) => (
      <path
        d="M58 19C55 9 62 4 68 8"
        fill="none"
        stroke={shade}
        strokeWidth="4"
        strokeLinecap="round"
      />
    ),
    face: (
      <g>
        <path d="M38 60Q45 51 52 60" {...line} />
        <path d="M68 60Q75 51 82 60" {...line} />
        <path d="M47 71Q60 88 73 71Z" fill={INK} strokeLinejoin="round" />
        <path d="M53 78Q60 74 67 78Q60 84 53 78Z" fill="#ff7a7a" />
        <Blush cx={32} cy={72} />
        <Blush cx={88} cy={72} />
      </g>
    ),
  },
  // 슬픔 — 물방울 몸통, 처진 눈썹과 눈물
  SADNESS: {
    body: "M60 10C70 28 104 44 104 68C104 90 86 104 60 104C34 104 16 90 16 68C16 44 50 28 60 10Z",
    face: (
      <g>
        <path d="M37 58L50 54" {...line} />
        <path d="M83 58L70 54" {...line} />
        <Eye cx={45} cy={67} />
        <Eye cx={75} cy={67} />
        <path d="M51 88Q60 80 69 88" {...line} />
        <path
          d="M42 75C40 80 38 83 39 86A3.6 3.6 0 0 0 46 85C46 82 44 79 42 75Z"
          fill="#ffffff"
          stroke="#5aaed0"
          strokeWidth="1.5"
        />
        <Blush cx={31} cy={78} opacity={0.3} />
        <Blush cx={89} cy={78} opacity={0.3} />
      </g>
    ),
  },
  // 화남 — 뿔처럼 솟은 두 귀, 찌푸린 눈썹과 꽉 다문 입, 머리 위 성난 표시
  ANGER: {
    body: "M60 20C90 20 104 36 104 62C104 88 86 102 60 102C34 102 16 88 16 62C16 36 30 20 60 20Z",
    extra: (shade, fill) => (
      <g>
        <path
          d="M28 34L30 12L46 24Z"
          fill={fill}
          stroke={fill}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M92 34L90 12L74 24Z"
          fill={fill}
          stroke={fill}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <g stroke={shade} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M80 36Q84 40 88 36" />
          <path d="M80 44Q84 40 88 44" />
        </g>
      </g>
    ),
    face: (
      <g>
        <path d="M35 51L51 58" {...line} strokeWidth="4" />
        <path d="M85 51L69 58" {...line} strokeWidth="4" />
        <Eye cx={45} cy={65} rx={4.2} ry={4.8} />
        <Eye cx={75} cy={65} rx={4.2} ry={4.8} />
        <rect
          x="47"
          y="76"
          width="26"
          height="10"
          rx="5"
          fill="#fff"
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M56 76.5V85.5M64 76.5V85.5" stroke={INK} strokeWidth="2" />
        <Blush cx={30} cy={76} opacity={0.35} />
        <Blush cx={90} cy={76} opacity={0.35} />
      </g>
    ),
  },
  // 무서움 — 아랫단이 물결치는 몸통(발 없이 둥실), 커다란 눈과 떨리는 입, 식은땀
  FEAR: {
    noFeet: true,
    body: "M60 14C86 14 102 34 102 60V94Q96 104 89 96Q82 104 75 96Q68 104 60 96Q52 104 45 96Q38 104 31 96Q24 104 18 94V60C18 34 34 14 60 14Z",
    extra: () => (
      <path
        d="M95 26C93 31 91 34 92 37A3.4 3.4 0 0 0 98.6 36.4C98.6 33 97 30 95 26Z"
        fill="#cdeefa"
        stroke="#7cc4e0"
        strokeWidth="1.5"
      />
    ),
    face: (
      <g>
        <WideEye cx={45} cy={56} r={9} pupil={3.5} />
        <WideEye cx={75} cy={56} r={9} pupil={3.5} />
        <path d="M45 77q3.75 -4 7.5 0t7.5 0t7.5 0t7.5 0" {...line} />
        <Blush cx={30} cy={70} opacity={0.3} />
        <Blush cx={90} cy={70} opacity={0.3} />
      </g>
    ),
  },
  // 놀람 — 길쭉한 몸통 + 동그란 더듬이, 번쩍 뜬 눈과 동그란 입, 반짝 표시
  SURPRISE: {
    body: "M60 20C86 20 100 42 100 66C100 90 84 104 60 104C36 104 20 90 20 66C20 42 34 20 60 20Z",
    extra: (shade) => (
      <g>
        <path
          d="M60 21V9"
          stroke={shade}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="60" cy="7" r="5.5" fill={shade} />
        <g stroke={INK} strokeWidth="2.5" strokeLinecap="round">
          <path d="M88 20L92 13" />
          <path d="M95 27L102 24" />
          <path d="M32 20L28 13" />
        </g>
      </g>
    ),
    face: (
      <g>
        <path d="M37 45Q45 39 53 45" {...line} />
        <path d="M67 45Q75 39 83 45" {...line} />
        <WideEye cx={45} cy={60} r={8} pupil={4} />
        <WideEye cx={75} cy={60} r={8} pupil={4} />
        <ellipse cx="60" cy="83" rx="6" ry="7.5" fill={INK} />
        <Blush cx={31} cy={74} opacity={0.35} />
        <Blush cx={89} cy={74} opacity={0.35} />
      </g>
    ),
  },
  // 부끄러움 — 하트처럼 살짝 파인 머리, 내리깐 눈과 커다란 볼터치, 입을 가린 작은 손
  SHAME: {
    body: "M60 24C68 12 92 14 100 34C108 54 104 92 60 102C16 92 12 54 20 34C28 14 52 12 60 24Z",
    extra: (shade) => (
      <g>
        <circle cx="50" cy="86" r="6.5" fill={shade} />
        <circle cx="70" cy="86" r="6.5" fill={shade} />
      </g>
    ),
    extraOnTop: true,
    face: (
      <g>
        <path d="M38 60Q45 65 52 60" {...line} />
        <path d="M68 60Q75 65 82 60" {...line} />
        <Blush cx={33} cy={72} rx={10} ry={6.5} opacity={0.6} />
        <Blush cx={87} cy={72} rx={10} ry={6.5} opacity={0.6} />
        <g stroke="#e8606e" strokeWidth="1.6" strokeLinecap="round">
          <path d="M28 74L31 69M33 75L36 70M38 74L40 70" />
          <path d="M82 74L85 69M87 75L90 70M92 74L94 70" />
        </g>
        <path d="M54 78q3 -2.5 6 0t6 0" {...line} strokeWidth="2.5" />
      </g>
    ),
  },
};

/**
 * 감정 캐릭터 (감정 선택·보관함 달력·리포트 범례·일기 그림 칸 공용)
 * @param emotion 감정 코드 (JOY | SADNESS | ANGER | FEAR | SURPRISE | SHAME)
 * @param size 한 변 px (기본 64)
 * @param selected true: 살짝 커지고 통통 튐 / false: 흐리게 / undefined: 기본
 * @param label 있으면 접근성 이름으로 읽어 준다 (없으면 장식용으로 숨김)
 */
function EmotionCharacter({
  emotion,
  size = 64,
  selected,
  label,
  className = "",
}) {
  const uid = useId();
  const e = getEmotion(emotion);
  const shape = SHAPES[emotion];
  if (!e || !shape) return null;

  const fill = e.color;
  const shade = SHADE[emotion];
  const gradId = `ec-grad-${uid}`;
  const state =
    selected === true
      ? "scale-115"
      : selected === false
        ? "opacity-45 saturate-50"
        : "";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center transition duration-300 ${state} ${className}`}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className={`origin-bottom overflow-visible ${
          selected === true ? "motion-safe:animate-hop" : ""
        }`}
      >
        <defs>
          <radialGradient id={gradId} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor={fill} />
            <stop offset="100%" stopColor={shade} />
          </radialGradient>
        </defs>
        {!shape.noFeet && (
          <g fill="#ffffff" stroke="#e6e6e6" strokeWidth="1.5">
            <ellipse cx="43" cy="104" rx="11" ry="7" />
            <ellipse cx="77" cy="104" rx="11" ry="7" />
          </g>
        )}
        {!shape.extraOnTop && shape.extra?.(shade, fill)}
        <path d={shape.body} fill={`url(#${gradId})`} />
        {shape.face}
        {shape.extraOnTop && shape.extra?.(shade, fill)}
      </svg>
    </span>
  );
}

export default EmotionCharacter;
