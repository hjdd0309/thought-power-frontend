const VARIANTS = {
  primary: "bg-yellow",
  secondary: "border border-border-neutral bg-white",
};

const SIZES = {
  lg: "h-14 w-full px-5.5", // 버튼/다음으로 (362×56)
  md: "h-12 min-w-0 flex-1", // 대화상자 버튼 (132×48, 두 개가 나란히)
  sm: "h-8.5 w-16 px-3", // 버튼 · 짧은 너비 (64×34)
};

// 비활성: #F0F0F0 배경 (B02 다음으로, A03 완료)
function Button({
  variant = "primary",
  size = "lg",
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const color = disabled ? "bg-border-neutral" : VARIANTS[variant];
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex items-center justify-center rounded-button text-body font-medium text-ink ${SIZES[size]} ${color} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
