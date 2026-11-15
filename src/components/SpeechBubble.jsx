import { vspace } from "@/utils/responsiveSpace";

// 말풍선 (332×76, #FFF7C4, radius 20)
// 최소 높이도 보이는 높이가 작을수록 줄어든다(두 줄 텍스트가 잘리지 않는 선까지)
function SpeechBubble({ className = "", style, children }) {
  return (
    <div
      style={{ minHeight: vspace(76, 0.6), ...style }}
      className={`mx-8.75 flex items-center justify-center rounded-bubble bg-yellow-light px-4 text-center text-lead font-medium ${className}`}
    >
      {children}
    </div>
  );
}

export default SpeechBubble;
