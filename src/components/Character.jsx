import note from "@/assets/characters/note.png";
import sit from "@/assets/characters/sit.png";
import smile from "@/assets/characters/smile.png";
import wave from "@/assets/characters/wave.png";

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
