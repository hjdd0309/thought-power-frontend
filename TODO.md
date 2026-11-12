# TODO

> 작업 시작 전 확인하고, 끝난 항목은 `[x]`로 체크한다. 담당·대기 대상은 `(담당: …)` / `(대기: …)`로 표시.

## 다음에 바로 할 일 (프론트)

- [x] (담당: 프론트) 리포트 응답 필드명 DB 기준으로 변경
  - `../thought-power-backend` 스키마의 `emotion_report` 컬럼을 읽고 camelCase로 매핑 (`mostEmotionReason`, `leastEmotionReason`, `parentAdvice` 등)
  - 응답 → 화면 객체 변환 함수를 `src/api` 리포트 함수 안에 하나로 모으기
  - `trend_title`은 고정 문구라 미사용
  - 매핑 안 되는 필드는 임의로 만들지 말 것
- [x] (담당: 프론트) 브라우저에서 직접 전체 플로우 클릭 확인 — 이번 세 커밋: SHAME 통일, 완료 시 한 번 저장, 하루 1개 제한
- [x] (담당: 프론트) Vercel 최신 배포 반영 확인, `/archive/3` 직접 접속·새로고침 시 404 없는지 확인

## 팀 답변 대기

- [x] (대기: BE2 권원민) 리포트 응답 키가 camelCase인지, 변화 추이 해석(`interpretation`)은 어떤 필드로 오는지, `trend_title` 컬럼 제거 또는 null 허용
  - 답변: 리포트 문구는 DB 컬럼 기준 snake_case로 내려옴(`most_emotion_reason`·`least_emotion_reason`·`parent_advice`·`trend_interpretation`). `trend_title`은 DB에서 컬럼 삭제로 확정
- [x] (대기: BE1 이소래) 일기 날짜를 프론트가 보낼지, 서버가 Asia/Seoul 기준으로 정할지
  - 답변: 서버가 KST(Asia/Seoul) 기준으로 저장 날짜를 정하고, 프론트는 응답의 `date`를 사용하기로 합의
- [ ] (대기: 전체) Chrome 음성 인식이 음성을 Google로 보내는 점, 개인정보 문구 반영 여부

## 백엔드 연결 (프론트·백·AI 같이)

- [x] (담당: 프론트) 게스트 사용자 구분용 `X-Client-Id` 헤더 추가 — `src/utils/storage.js` `getClientId()`(localStorage + 메모리 캐시, randomUUID 미지원 브라우저 대체 포함) + `src/api/client.js` 요청 인터셉터. 백엔드 CORS 허용 헤더 등록 확인됨(2026-11-12)

- [x] (담당: 프론트) `src/api` mock → 실제 client 호출로 교체 (`docs/api-frontend.md` "실서버 연결 현황" 기준) — 온보딩·보관함·리포트·설정 전부 `VITE_USE_MOCK=false`일 때 실서버. GET은 실서버로 확인, 쓰기 요청(삭제·온보딩·프로필 수정)은 요청 형태만 확인
- [ ] (담당: 프론트) 브라우저에서 화면별 실서버 확인 — 쓰기 동작(일기 삭제·온보딩 완료·프로필 저장·일기 저장)은 팀 공용 데이터가 바뀌니 팀에 알리고 진행
- [ ] (대기: 백엔드) 달력 응답에 `diaryId` 추가 요청(선택) · `/api/support`의 `fags` 오타 확인
- [ ] (대기: 기획) 구독(`subscription: null`)·고객센터(`fags: []`, `inquiryUrl: null`)는 실데이터가 없음 → 무료 플랜 기본 문구 / 문의 URL 생기면 연결
- [ ] (담당: 프론트) Vercel 환경변수 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=백엔드 https 주소` → Redeploy
- [x] (대기: 백엔드) 백엔드 CORS에 Vercel 도메인 추가 요청 — **해결됨 (2026-11-11)**
  - 처음엔 preflight에 `Access-Control-Allow-*` 헤더가 전혀 없었음(CORS 설정 미적용 + 등록값 끝 슬래시) → 백엔드 수정·재배포
  - 재배포 후 확인: `http://localhost:5173`, `https://thought-power-frontend.vercel.app` 모두 preflight에 `Access-Control-Allow-Origin`(해당 Origin), `Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`, `Allow-Headers: content-type` 응답. 실제 POST 응답에도 `Access-Control-Allow-Origin` 포함
- [x] (담당: 프론트) 질문 생성을 question-flow API로 교체 (`src/api/questionFlow.js`, `useQuestionFlow`) — RETRY·빈 답변·410 재시작, COMPLETE의 `questions`로 저장
- [x] (담당: 프론트) 일기 저장(`saveDiary`)은 `VITE_USE_MOCK=false`일 때 실제 `POST /api/diaries` 호출
- [ ] (담당: 프론트) 실제 API로 질문 흐름 수동 테스트 (음성·텍스트: 시작 → 빈 답변 → RETRY → NEXT → COMPLETE → 저장)
- [ ] (담당: 프론트·백) 저장 실패·하루 1개 에러(`DIARY_ALREADY_EXISTS`) 실제 응답 형식 확인
- [x] (담당: 프론트) 일기 저장(`saveDiary`) 요청에서 `date` 빼기 — 노션 명세상 서버가 Asia/Seoul 기준으로 저장 날짜를 정함. 응답 `201 { diaryId, date, completed }`의 `date`를 사용
- [x] (담당: 프론트) 리포트(`getEmotionReport`)는 mock 부분만 `client.get('/api/reports/emotions', { params: { startDate, endDate } })`로 교체. `mapReportResponse`는 그대로 사용하고, 문구 4개가 실제로 snake_case로 오는지 확인 — 실서버 snake_case 확인 완료
- [ ] (담당: 프론트) E04 최다·최소 카드 문구 확인 — AI-백 연동 전에는 백엔드 기본 문구가 나오고, 연동 후 실제 AI 문장이 나오는지 확인
- [ ] (담당: 프론트) 오류 응답 형식 `{ code, message }` 확인 — 409 `DIARY_ALREADY_EXISTS`, 404 `PROFILE_NOT_FOUND`(아이 프로필 미등록) 처리
  - 확인: 일기 저장·질문 흐름은 `{ code, message }`, `/api/users/me`·`/api/diaries/{id}` 404는 Spring 기본 형식(`{ timestamp, status, error, path }`) → 상태코드로 분기하도록 구현함

## 시연 준비

- [ ] (담당: 프론트) 휴대폰(안드로이드 Chrome) 실기기 점검: 키보드에 입력창·버튼 가림, 하단 버튼과 홈 인디케이터 겹침
- [ ] (담당: 프론트) 실제 목소리로 음성 인식 테스트 (짧게 끊어 말할 때 끊김 여부)
- [ ] (담당: 전체) 시연 시나리오: 감정, 말할 일기 내용, 답변 미리 정하기
- [ ] (담당: 전체) 시연 기기는 iOS Safari 말고 안드로이드나 노트북 Chrome

## 기타

- [ ] (담당: 프론트) 프론트 팀원 GitHub Collaborator 초대 (아이디 받으면 Settings → Collaborators)
- [ ] (대기: 기획) F07 고객센터 항목 클릭 시 이동 화면 미정
- [ ] (담당: 프론트) 프론트 팀원에게 `src/utils`, `src/contexts` 폴더 추가된 것 공유

## 확정된 결정 (참고)

나이 6~10세 / 보호자 유형 아동시설 선생님(`FACILITY_TEACHER`) / 감정 분석 막대 차트 / 변화 추이 제목 고정 문구 / 부끄러움 코드 `SHAME` / 온보딩 완료 시 동의값(agreements, version 1.0)을 함께 저장 / 일기는 완료 시 한 번에 저장, 하루 1개
