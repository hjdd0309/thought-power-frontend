// 화면 최대 표시 너비의 2배로 리사이즈한 WebP (투명 배경 유지, quality 82)
// wave 520px(A08 260px), 나머지 460px(230px)
import note from "@/assets/characters/note.webp";
import sit from "@/assets/characters/sit.webp";
import smile from "@/assets/characters/smile.webp";
import wave from "@/assets/characters/wave.webp";

const CHARACTERS = { note, sit, smile, wave };

// Figma 전체 높이(402×874) 비율로 줄어들고, 작은 화면에서도 원래 크기의 55% 밑으로는 줄지 않는다.
// 402×874에서는 지정한 size·height와 동일하게 보인다.
const FIGMA_HEIGHT = 874;
const MIN_RATIO = 0.55;

// 캐릭터 이미지 (기본 230×230, note는 230×255)
function Character({ name, size = 230, height, className = "", style = {} }) {
  const h = height ?? size;
  const w = size;
  const percent = +((h / FIGMA_HEIGHT) * 100).toFixed(3);
  const ratio = +(w / h).toFixed(4);
  const minH = Math.round(h * MIN_RATIO);
  const minW = Math.round(w * MIN_RATIO);

  return (
    <img
      src={CHARACTERS[name]}
      alt=""
      width={w}
      height={h}
      className={`pointer-events-none mx-auto shrink-0 object-contain ${className}`}
      style={{
        ...style,
        height: `clamp(${minH}px, ${percent}dvh, ${h}px)`,
        width: `clamp(${minW}px, calc(${percent}dvh * ${ratio}), ${w}px)`,
      }}
    />
  );
}

export default Character;
