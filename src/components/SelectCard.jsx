// 선택 카드 — 선택: #FFF7C4 배경, 미선택: 흰 배경 + #F0F0F0 테두리
function SelectCard({
  selected = false,
  rounded = "rounded-button",
  className = "",
  children,
  ...props
}) {
  const state = selected
    ? "border-yellow-light bg-yellow-light"
    : "border-border-neutral bg-white";
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex items-center justify-center border text-center text-body font-medium text-ink ${rounded} ${state} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default SelectCard;
