# 생각의힘 — Frontend

## 실행 방법

```
npm i
cp .env.example .env
npm run dev
```

## 배포

- Vercel이 GitHub 레포와 연결되어 자동 배포한다.
  - `main` push → Production 배포
  - `dev` push → Preview 배포
- 배포는 `dev` → `main` 머지로만 한다. `main`에 직접 커밋하지 않는다.
- SPA 라우팅: `vercel.json`이 모든 경로를 `index.html`로 rewrite한다. (`/archive/3` 등에서 새로고침해도 404 없음)
- `VITE_` 환경변수는 **빌드 시점**에 코드에 들어간다. Vercel에서 값을 바꾸면 **Redeploy**해야 반영된다.
- 백엔드 연결 시 백엔드 주소(`VITE_API_BASE_URL`)도 **https**여야 한다. https 페이지에서 http API를 호출하면 브라우저가 차단한다(Mixed Content).
- 배포 전 로컬 확인: `npm run build` → `npm run preview`
