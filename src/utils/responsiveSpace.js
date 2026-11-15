// Figma 전체 높이(402×874) 비율로 줄어드는 여백값을 만든다.
// 보이는 높이(dvh)가 874px일 때는 원래 px 값과 같고, 더 작은 화면에서는 비례해서 줄어들며
// minRatio 밑으로는 줄지 않는다. Tailwind 클래스는 빌드 시 정적으로 스캔되므로
// 이렇게 계산한 값은 className이 아니라 style(inline)로 적용해야 한다.
const FIGMA_HEIGHT = 874;

export function vspace(px, minRatio = 0.35) {
  const percent = +((px / FIGMA_HEIGHT) * 100).toFixed(3);
  const min = Math.round(px * minRatio);
  return `clamp(${min}px, ${percent}dvh, ${px}px)`;
}
