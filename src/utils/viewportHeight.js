// iOS Safari는 키보드가 올라와도 100dvh(레이아웃 뷰포트)가 줄지 않아,
// dvh로만 높이를 잡으면 입력창·버튼이 키보드 뒤에 가려질 수 있다.
// visualViewport(키보드를 반영하는 실제 보이는 높이)를 --app-vh 변수에 저장해
// FixedScreen이 이 값을 우선 쓰도록 한다. 지원하지 않는 브라우저는 100dvh로 자동 대체된다.
function setAppHeight() {
  const vv = window.visualViewport;
  const height = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-vh", `${height}px`);
}

if (typeof window !== "undefined") {
  setAppHeight();
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setAppHeight);
    window.visualViewport.addEventListener("scroll", setAppHeight);
  } else {
    window.addEventListener("resize", setAppHeight);
  }
}
