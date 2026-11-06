// 입력 필드 (362×58, radius 14, 가운데 정렬)
function TextField({ className = "", ...props }) {
  return (
    <input
      className={`h-14.5 w-full rounded-button border border-border-neutral bg-white px-5.5 text-center text-body font-medium text-ink outline-none placeholder:text-ink focus:border-yellow ${className}`}
      {...props}
    />
  );
}

export default TextField;
