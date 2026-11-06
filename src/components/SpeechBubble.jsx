// 말풍선 (332×76, #FFF7C4, radius 20)
function SpeechBubble({ className = "", children }) {
  return (
    <div
      className={`mx-8.75 flex min-h-19 items-center justify-center rounded-bubble bg-yellow-light px-4 text-center text-lead font-medium ${className}`}
    >
      {children}
    </div>
  );
}

export default SpeechBubble;
