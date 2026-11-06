// 화면 최대 표시 너비의 2배로 리사이즈한 WebP (투명 배경 유지, quality 82)
// wave 520px(A08 260px), 나머지 460px(230px)
import note from "@/assets/characters/note.webp";
import sit from "@/assets/characters/sit.webp";
import smile from "@/assets/characters/smile.webp";
import wave from "@/assets/characters/wave.webp";

const CHARACTERS = { note, sit, smile, wave };

// 캐릭터 이미지 (기본 230×230, note는 230×255)
function Character({ name, size = 230, height, className = "" }) {
  const h = height ?? size;
  return (
    <img
      src={CHARACTERS[name]}
      alt=""
      width={size}
      height={h}
      className={`pointer-events-none mx-auto shrink-0 object-contain ${className}`}
      style={{ width: size, height: h }}
    />
  );
}

export default Character;
