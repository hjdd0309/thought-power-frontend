# 생각의힘 — Frontend

초등 저학년 아이가 감정을 고르고 음성/텍스트로 일기를 쓰면, AI가 질문 3개(감정 탐색 → 이유 탐색 → 관점 확장)를 던져 생각을 확장하도록 돕는 모바일 웹 서비스.

## 작업 범위
- 이 레포(thought-power-frontend) 안에서만 작업한다.
- 상위 폴더(../)의 백엔드 레포와 AI 폴더는 절대 수정·생성·삭제·이동하지 않고, 그 안에서 git 명령도 실행하지 않는다.
- 백엔드/AI 코드는 API 경로·요청/응답 형식·감정 코드 등을 확인하는 참고용으로만 읽는다.
- 백엔드 실제 연결은 프론트·백·AI 담당이 함께 진행하기 전까지 하지 않는다. 그 전까지 API는 src/mocks 기반으로 작업한다.

## 기술 스택
- Vite + React (JavaScript, TypeScript 사용 안 함)
- Tailwind CSS v4 (`@tailwindcss/vite`, `src/index.css`에 `@import "tailwindcss";`)
- react-router-dom, axios
- ESLint + Prettier (prettier-plugin-tailwindcss로 클래스 순서 자동 정렬)
- 합의 없이 새 라이브러리 추가 금지. 필요하면 먼저 팀에 공유

## 실행
npm i
cp .env.example .env
npm run dev

## 환경변수
- VITE_API_BASE_URL: 백엔드 주소
- VITE_USE_MOCK: true면 src/mocks 데이터 사용
- VITE_MOCK_DELAY_MS: mock 응답 지연(ms, 기본 0) — 로딩 화면 테스트용
- VITE_MOCK_FAIL_RATE: mock 실패 확률(0~1, 기본 0) — 에러·다시 시도 화면 테스트용
- .env는 커밋하지 않음. 새 변수 추가 시 .env.example도 같이 수정

## 폴더 구조
src/
  api/         API 호출 함수 (client.js = axios 인스턴스)
  mocks/       mock 데이터
  components/  공통 컴포넌트
  pages/       화면 단위
  hooks/
  assets/
- import는 `@/` 절대경로 사용 (예: `import client from '@/api/client'`)

## 브랜치 규칙
- main: 배포용. 배포할 때만 dev에서 머지
- dev: 개발 통합. 작업은 dev에서 바로 하고 PR 없이 dev에 push
- push 전 필수:
  1. git pull origin dev
  2. npm run dev로 안 깨지는지 확인
- 라우터, 레이아웃, 공통 컴포넌트(src/components) 수정할 땐 팀원에게 미리 말하기

## 배포
- Vercel 자동 배포: main push → Production, dev push → Preview
- 배포는 dev → main 머지로만 (main 직접 커밋 금지)
- vercel.json: SPA라서 모든 경로를 index.html로 rewrite (새로고침 404 방지)
- VITE_ 환경변수는 빌드 시점에 들어가므로 Vercel에서 값을 바꾸면 Redeploy 필요
- 백엔드 연결 시 백엔드 주소도 https여야 함 (https 페이지에서 http API 호출은 브라우저가 차단)
- 배포 전 로컬 확인: npm run build → npm run preview

## 커밋 메시지
- feat: 기능 추가
- fix: 버그 수정
- style: UI·스타일 수정
- refactor: 코드 정리
- chore: 설정·패키지
- 예) feat: 메인 페이지 카드 컴포넌트 추가

## 도메인 상수
- 감정 코드: JOY(기쁨), SADNESS(슬픔), ANGER(화남), FEAR(무서움), SURPRISE(놀람), SHYNESS(부끄러움)
- 질문 순서: 1=EMOTION(감정 탐색), 2=REASON(이유 탐색), 3=PERSPECTIVE(관점 확장)
- 로그인 없음: 서버가 기본 사용자로 고정하므로 인증 헤더 불필요

## Claude 작업 시 지켜야 할 것
- 개발 환경은 Windows PowerShell 5.x. 명령 연결에 && 쓰지 않기
- 커밋/push 전 반드시 git pull 후 npm run dev 확인
- 라우터·레이아웃·공통 컴포넌트를 바꿔야 하면 바로 수정하지 말고 먼저 사용자에게 알리기
- 커밋 메시지는 위 규칙을 따르고 한국어로 작성
- main 브랜치에 직접 커밋하지 않기
- UI는 Figma(MCP)로 가져온 디자인 기준으로 구현. 임의 스타일 만들지 않기
- Figma: https://www.figma.com/design/8lKwKcElbeRgHia4f6DXUh/%F0%9F%9A%86-1%ED%98%B8%EC%84%A0%ED%86%A4?node-id=0-1
