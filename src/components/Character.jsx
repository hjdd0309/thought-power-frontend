import sit from "@/assets/characters/sit.png";
import smile from "@/assets/characters/smile.png";
import wave from "@/assets/characters/wave.png";

const CHARACTERS = { sit, smile, wave };

// 캐릭터 이미지 (기본 230×230)
function Character({ name, size = 230, className = "" }) {
  return (
    <img
      src={CHARACTERS[name]}
      alt=""
      width={size}
      height={size}
      className={`pointer-events-none mx-auto shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default Character;
