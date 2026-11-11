# 프-백 API 명세 초안 (프론트 기준)

> 프론트 `src/api/*.js` 함수 기준으로 정리한 **초안**이다. 백·AI 담당과 확정 전까지 경로·필드는 제안값이다.
> 기준 자료: `docs/spec.md`(기능·AI 연동 명세), 백엔드 레포 `db/mysql-schema.sql`·`domain/entity/*` (2026-11-06 기준, 컨트롤러·DTO는 아직 없음)

---

## ★ 실서버 연결 현황 (2026-11-11, OpenAPI `https://k1min.site/v3/api-docs` + 실서버 GET 확인)

> 아래 표가 실제 서버 기준이다. 이후 섹션(1~6)은 연결 전 초안이라 경로·필드가 다를 수 있으며, 다르면 이 표를 따른다.
> 모든 `src/api/*.js` 함수는 `VITE_USE_MOCK=false`일 때만 실서버를 호출하고, 응답 → 화면 형식 변환은 API 모듈 안에서 한다.

| 프론트 함수           | 실서버 API                                                                                                                                | 응답 → 화면 변환                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `completeOnboarding`  | **POST** `/api/users/me/onboarding` `{ name, age, helperType, agreements:[{type, version, agreed}] }` → `{ userId, onboardingCompleted }` | `guardianType` → `helperType`. 동의값은 약관 3종(`GUARDIAN`·`SERVICE`·`PRIVACY`) 모두 필수, `version`은 `"1.0"`(프론트 상수 `TERMS_VERSION`) |
| `getOnboardingStatus` | **GET** `/api/users/me`                                                                                                                   | 200 → 온보딩 완료, **404 → 미완료**. 스플래시가 이 값으로 `/home`·`/start` 분기 (실패 시 localStorage)                                       |
| `getProfile`          | **GET** `/api/users/me` → `{ userId, name, age, helperType }`                                                                             | `helperType` → `guardianType`                                                                                                                |
| `updateProfile`       | **PATCH** `/api/users/me` `{ name, age, helperType }`                                                                                     | 응답을 `getProfile`과 같은 형식으로                                                                                                          |
| `getSubscription`     | **GET** `/api/subscription` → `{ subscription: null }`                                                                                    | 결제 기능이 없어 null → 무료 플랜 기본 3줄                                                                                                   |
| `getTerms`            | **GET** `/api/terms` → `{ terms:[{ type, title, required }] }`                                                                            | 설정 F06: 약관 제목만 표시(본문 없음). 온보딩 A03: 동의 항목 라벨로 재사용                                                                   |
| `getSupportItems`     | **GET** `/api/support` → `{ fags: [], inquiryUrl: null }`                                                                                 | 두 줄 고정(자주 묻는 질문·문의하기), `inquiryUrl`이 있으면 문의하기를 새 창으로                                                              |
| `getVersion`          | **GET** `/api/app/version` → `{ version, logoUrl }`                                                                                       | 그대로                                                                                                                                       |
| `getMonthlyDiaries`   | **GET** `/api/diaries/calendar?year&month` → `{ year, month, days:[{ date, diaryCount, emotions[] }] }`                                   | `[{ date, emotion }]` — **diaryId 없음**                                                                                                     |
| `getDiariesByDate`    | **GET** `/api/diaries?date=YYYY-MM-DD` → `{ diaries:[{ diaryId, date, emotion, contentPreview }] }`                                       | 배열만. 보관함에서 날짜를 두 번 누르면 이걸로 diaryId를 찾아 상세로 이동                                                                     |
| `getTodayDiary`       | `getDiariesByDate(오늘)`                                                                                                                  | 첫 항목 또는 null (하루 1개 제한 확인, 저장 시 409 `DIARY_ALREADY_EXISTS`로 한 번 더 막힘)                                                   |
| `getDiary`            | **GET** `/api/diaries/{diaryId}` → `{ diaryId, date, emotion, content, questions:[{ order, type, question, answer }] }`                   | `question` → `content`. **404 → null**(빈 안내). 빈 답변은 "답하지 않았어요"                                                                 |
| `deleteDiary`         | **DELETE** `/api/diaries/{diaryId}` → 200                                                                                                 | 삭제 후 `/archive`로 이동하면 달력 다시 조회                                                                                                 |
| `getEmotionReport`    | **GET** `/api/reports/emotions?startDate&endDate`                                                                                         | `mapReportResponse`: snake_case 문구 4종 → camelCase, `days[].diaries` → `days[].emotions`. 0건·AI 실패 시 서버 기본 문구 그대로 표시        |

**실서버 에러 형식**: 일기 저장(`POST /api/diaries`)·질문 흐름은 `{ code, message }`. 그 밖의 404·400(`/api/users/me`, `/api/diaries/{id}` 등)은 Spring 기본 `{ timestamp, status, error, path }`라 **HTTP 상태코드로 분기**한다.

**백엔드에 요청할 것 (명세 부족)**

- `GET /api/diaries/calendar` 날짜 항목에 `diaryId` 추가하면 상세 이동 시 추가 조회가 필요 없음
- `/api/support`의 `fags`는 `faqs` 오타로 보임 (프론트는 아직 미사용)

---

## 0. 공통 규칙

| 항목         | 규칙                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Base URL     | `VITE_API_BASE_URL` (배포 환경은 **https** 필수)                                                                                                             |
| 인증         | 없음. 서버가 기본 사용자(`child_id = 1`)로 고정                                                                                                              |
| Content-Type | `application/json; charset=utf-8`                                                                                                                            |
| 날짜         | `YYYY-MM-DD` 문자열 (예: `"2026-11-06"`). 일기 날짜(`diary_date`)는 서버가 **Asia/Seoul** 기준 오늘로 정한다. 프론트는 보내지 않고 저장 응답의 `date`를 사용 |
| 일시         | ISO 8601 UTC (예: `"2026-11-06T05:12:00Z"`) — 프론트는 현재 일시 필드를 쓰지 않음                                                                            |
| 감정 코드    | `JOY`(기쁨) · `SADNESS`(슬픔) · `ANGER`(화남) · `FEAR`(무서움) · `SURPRISE`(놀람) · `SHAME`(부끄러움) — 확정 (DB 시드와 동일)                                |
| 질문 타입    | `order` 1=`EMOTION`(감정 탐색), 2=`REASON`(이유 탐색), 3=`PERSPECTIVE`(관점 확장) — DB `QuestionStage`, `sequence`와 동일                                    |
| 작성 방식    | `VOICE` · `TEXT` (DB `InputType`). TEXT 본문은 500자 이하                                                                                                    |
| 보호자 유형  | `PARENT` · `SCHOOL_TEACHER` · `FACILITY_TEACHER` · `OTHER` (DB `GuardianType`)                                                                               |
| 필드 표기    | JSON은 camelCase                                                                                                                                             |

### 에러 응답 (제안)

HTTP 상태코드 + 아래 본문. 프론트는 `message`를 그대로 보여주지 않고 화면별 안내 문구 + 다시 시도 버튼을 쓴다(`code`로 분기).

```json
{
  "code": "DIARY_NOT_FOUND",
  "message": "일기를 찾을 수 없습니다."
}
```

| 상태           | code 예시                                                   | 프론트 처리                                        |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| 400            | `INVALID_REQUEST`, `INVALID_DATE_RANGE`, `CONTENT_TOO_LONG` | 입력 화면 유지 + 안내                              |
| 404            | `DIARY_NOT_FOUND`, `PROFILE_NOT_FOUND`                      | 빈 상태 화면(예: E02 빈 날짜 안내)                 |
| 409            | `DIARY_ALREADY_EXISTS` (하루 1개 제약)                      | "오늘은 이미 일기를 썼어요" 안내 + 보관함에서 보기 |
| 500 / 네트워크 | `INTERNAL_ERROR`                                            | 공통 에러 안내 + 다시 시도                         |

질문 요청 응답은 `{ order, type, content }` 이다. AI 실패 시 서버가 기본 질문으로 200 응답해도 되고, 요청 자체가 실패하면 프론트가 같은 기본 질문으로 대체한다.

---

## 1. 온보딩 (A 화면)

### `completeOnboarding` — 온보딩 완료

- **POST** `/api/onboarding` · 화면 **A08** (A03~A07 입력값을 한 번에 저장)

```json
// 요청
{
  "name": "지우",
  "age": 8,
  "guardianType": "PARENT"
}
// 응답 200
{ "name": "지우", "age": 8, "guardianType": "PARENT", "completed": true }
```

- ~~약관 동의값은 화면 표시용, 저장 안 함~~ → **변경**: 실서버는 `agreements`(약관 3종 동의·버전)를 필수로 받는다. 맨 위 "실서버 연결 현황" 참고
- 나이 범위 **6~10세 확정** (DB 제약과 동일). 프론트도 같은 범위만 보낸다

---

## 2. 일기 작성 (B·C·D 화면)

> **저장 방식 확정**: 작성 중 데이터(감정·작성 방식·본문·질문/답변)는 프론트 `DiaryContext`가 들고 있다가 **C13 / D06 완료하기에서 한 번에 저장**한다.
> 단계별 저장(초안 생성·본문 저장·답변 저장)은 없다. 서버 호출은 **질문 흐름**(question-flow, 저장 없음)과 **완료 저장** 두 가지뿐이다. (DB 스키마 "일기 1개 + 질문 3개를 한 트랜잭션으로 저장"과 동일)
>
> - B04~B05 작성 방식 선택, C03 / D01 본문 확인, C06·C09·C12 / D03~D05 답변 확인은 모두 프론트 상태만 바꾸고 다음 화면으로 이동
> - 말로 쓰기 → 글로 쓰기로 바꿔도 별도 요청 없음. 완료 저장 때 **최종 작성 방식**(`inputType`)만 보낸다
> - 완료 저장 실패 시 `DiaryContext`를 그대로 유지하고 C13 전체 확인 화면에서 완료하기를 다시 눌러 재시도한다

### 질문 흐름 (question-flow) — `src/api/questionFlow.js`

> 기존 단건 질문 API(`POST /api/diaries/questions`)는 작성 흐름에서 쓰지 않는다. 같은 작성 과정에서 두 방식을 섞지 않는다.

**① 첫 질문 시작** — **POST** `/api/diaries/question-flows` · 본문 확인(C03 / D01) 직후

```json
// 요청 — content는 사용자가 수정·확인한 일기 본문
{ "emotion": "JOY", "content": "오늘 친구와 놀았다.", "order": 1, "type": "EMOTION", "previousAnswers": [] }
// 응답 200
{
  "flowId": "5a41befd-57e8-4c5c-a93a-0257208e01d8", "action": "QUESTION",
  "questionVersion": 0, "retryCount": 0, "informative": null,
  "question": { "order": 1, "type": "EMOTION", "content": "그때 어떤 기분이 들었나요?", "isFallback": true },
  "questions": []
}
```

**② 답변 제출** — **POST** `/api/diaries/question-flows/{flowId}/answers` · 화면 **C06·C09·C12 확인 / D03~D05 다음으로**

```json
{ "questionVersion": 0, "answer": "" }
```

| action   | 프론트 처리                                                             |
| -------- | ----------------------------------------------------------------------- |
| QUESTION | 첫 질문 표시                                                            |
| RETRY    | 같은 order의 새 질문 표시 (진행률 그대로, 녹음·입력 상태 초기화)        |
| NEXT     | 다음 질문 표시                                                          |
| COMPLETE | `question`은 null. `questions`(3쌍)를 들고 C13 / D06 전체 확인으로 이동 |

- 진행률: `question.order / 3`. 화면은 URL 순서가 아니라 현재 `question` 데이터로 그린다
- `questionVersion`: 매 응답의 최신 값을 다음 제출에 사용 (NEXT에서도 증가)
- 빈 답변 허용: `""` 그대로 전송. 화면에 "생각이 안 나면 비워 둬도 괜찮아요" 안내
- 같은 flowId·version·답변 재전송은 서버가 기존 결과를 돌려준다. 프론트도 처리 중 중복 클릭을 막는다
- **410 `QUESTION_FLOW_EXPIRED`** (서버 재시작 포함): 본문은 유지하고 같은 감정·본문으로 ①부터 다시 시작, "질문을 처음부터 다시 시작할게요" 안내
- 서버 흐름은 되돌릴 수 없어서 질문 화면의 뒤로가기는 본문 작성 화면으로 돌아간다. 본문을 다시 확인하면 흐름을 새로 시작
- 질문 생성 실패 시 서버가 기본 질문(`isFallback: true`)을 내려준다. 프론트 기본 질문(`DEFAULT_QUESTIONS`)은 mock에서만 사용

### `saveDiary` — 일기 완료 저장

- **POST** `/api/diaries` · 화면 **C13 / D06** 완료하기

```json
// 요청 — 전체 한 번에
{
  "emotion": "SADNESS",
  "inputType": "VOICE",
  "content": "오늘 친구랑 놀다가 조금 속상한 일이 있었어요.",
  "questions": [
    { "order": 1, "type": "EMOTION", "content": "그때 어떤 기분이 들었나요?", "answer": "속상했어요." },
    { "order": 2, "type": "REASON", "content": "왜 그런 기분이 들었다고 생각하나요?", "answer": "..." },
    { "order": 3, "type": "PERSPECTIVE", "content": "친구는 그때 어떤 기분이었을까요?", "answer": "..." }
  ]
}
// 응답 201
{ "diaryId": 102, "date": "2026-11-06", "completed": true }
```

- `inputType`: 최종 작성 방식. 말로 쓰다 글로 쓰기로 바꾼 경우 `TEXT`
- `date`: 요청에 보내지 않음. 서버가 Asia/Seoul 기준 오늘로 정해 응답의 `date`(`YYYY-MM-DD`)로 돌려주고, 프론트는 이 값을 사용
- `questions`: 질문 흐름 COMPLETE 응답의 `questions` 그대로 (질문 `content`, 답변 `answer`, 빈 답변 `""` 가능). `flowId`·`questionVersion`은 보내지 않음
- 음성 인식 결과 수정은 클라이언트에서만 하고, 최종 텍스트를 저장 (스키마 주석과 일치)
- 하루 1개 제약(`UNIQUE(child_id, diary_date)`) → 같은 날 두 번째 저장 시 409 `DIARY_ALREADY_EXISTS` → 프론트는 "오늘은 이미 일기를 썼어요" 안내 + 보관함에서 보기 (5. 확정 참고)

---

## 3. 보관함·리포트 (E 화면)

### `getMonthlyDiaries` — 월별 달력

- **GET** `/api/diaries?year=2026&month=11` · 화면 **E01**

```json
// 응답 200
[
  { "diaryId": 12, "date": "2026-11-02", "emotion": "JOY" },
  { "diaryId": 13, "date": "2026-11-03", "emotion": "SADNESS" }
]
```

### `getDiary` — 일기 상세

- **GET** `/api/diaries/{diaryId}` · 화면 **E02**

```json
// 응답 200
{
  "diaryId": 12,
  "date": "2026-11-02",
  "emotion": "JOY",
  "inputType": "VOICE",
  "content": "오늘 친구와 준비물을 나눠 썼어요.",
  "questions": [
    {
      "order": 1,
      "type": "EMOTION",
      "content": "그때 어떤 기분이 들었나요?",
      "answer": "친구와 함께 완성해서 기뻤어요."
    }
  ]
}
// 응답 404 → E02 빈 날짜 안내
```

- 일기가 없는 날짜는 프론트가 API 호출 없이 `/archive/empty?date=YYYY-MM-DD`로 빈 상태를 보여준다
- **차이**: DB 컬럼 `question_text`/`answer_text`/`sequence`/`stage` → 응답은 `content`/`answer`/`order`/`type`으로 매핑 요청

### `deleteDiary` — 일기 삭제

- **DELETE** `/api/diaries/{diaryId}` · 화면 **E02 삭제 확인**
- 응답 `204` (본문 없음). 질문은 `ON DELETE CASCADE`로 함께 삭제

### `getEmotionReport` — 감정 리포트

- **GET** `/api/reports/emotions?startDate=2026-11-01&endDate=2026-11-15` (경로는 `docs/spec.md`에 명시됨) · 화면 **E01 리포트 보기 → E04 / E05**

```json
// 응답 200
{
  "startDate": "2026-11-01",
  "endDate": "2026-11-15",
  "totalDiaryCount": 3,
  "distribution": [
    { "emotion": "JOY", "count": 2, "ratio": 66.67 },
    { "emotion": "SADNESS", "count": 1, "ratio": 33.33 },
    { "emotion": "ANGER", "count": 0, "ratio": 0 },
    { "emotion": "FEAR", "count": 0, "ratio": 0 },
    { "emotion": "SURPRISE", "count": 0, "ratio": 0 },
    { "emotion": "SHAME", "count": 0, "ratio": 0 }
  ],
  "mostFrequentEmotions": ["JOY"],
  "leastFrequentEmotions": ["ANGER", "FEAR", "SURPRISE", "SHAME"],
  "most_emotion_reason": "선택한 기간에는 기쁨을 가장 자주 기록했어요.",
  "least_emotion_reason": "선택한 기간에는 화남·무서움·놀람·부끄러움을 가장 적게 기록했어요.",
  "parent_advice": "아이와 즐거웠던 순간을 이야기해 주세요.",
  "days": [
    { "date": "2026-11-01", "diaries": [{ "diaryId": 12, "emotion": "JOY" }] },
    { "date": "2026-11-02", "diaries": [] }
  ],
  "legend": {
    "JOY": "기쁨",
    "SADNESS": "슬픔",
    "ANGER": "화남",
    "FEAR": "무서움",
    "SURPRISE": "놀람",
    "SHAME": "부끄러움"
  },
  "trend_interpretation": "기쁨과 슬픔을 기록했고, 마지막 기록은 기쁨이었어요."
}
```

- 가장 자주/적게 느낀 감정(E04)은 `mostFrequentEmotions`·`leastFrequentEmotions`로 내려온다 (동률이면 모두, `leastFrequentEmotions`는 0건 감정도 포함, 일기 0건이면 둘 다 `[]`)
- 문구 4개(`most_emotion_reason`·`least_emotion_reason`·`parent_advice`·`trend_interpretation`)는 DB `emotion_reports` 컬럼과 같은 snake_case로 내려온다 (`trend_title`은 확정 — 5. 확정 참고 — 미사용). 프론트는 `src/api/archive.js`의 `mapReportResponse`에서 한 번에 camelCase로 변환
- `legend`는 화면에서 쓰지 않아 변환하지 않는다
- E05 카드 제목은 **프론트 고정 문구 "다양한 마음을 기록했어요"로 확정** — 응답에 `trendTitle` 없음 (5. 확정 참고)

---

## 4. 설정 (F 화면)

### `getProfile` / `updateProfile` — 개인정보

- **GET** `/api/profile` · 화면 **F01, F03**
- **PUT** `/api/profile` · 화면 **F03 저장하기**

```json
// GET 응답 / PUT 요청·응답
{ "name": "지우", "age": 8, "guardianType": "PARENT" }
```

- **차이**: DB에 `age_recorded_at` 있음(나이 기록일) — 응답에 포함할지 확인 필요 3

### `getSubscription` — 구독 관리

- **GET** `/api/subscription` · 화면 **F04**

```json
[
  { "title": "현재 플랜", "value": "무료 플랜" },
  { "title": "결제 상태", "value": "결제 내역 없음" },
  { "title": "다음 결제일 / 결제 수단", "value": "해당 없음" }
]
```

- **차이**: DB에 구독 테이블 없음 → 정적 화면으로 둘지 확인 필요 6

### `getTerms` — 이용약관 (온보딩·설정 공용)

- **GET** `/api/terms` · 화면 **A03, F06**

```json
{
  "title": "서비스 이용약관",
  "notice": "화면 구성용 예시 문구",
  "articles": [{ "title": "제1조 목적", "content": "..." }]
}
```

- **차이**: 스키마 주석 "약관은 프론트에서 표시하며 DB에 저장하지 않는다" vs spec "약관 조회 API 사용" → 확인 필요 6

### `getSupportItems` — 고객센터

- **GET** `/api/support` · 화면 **F07**
- 응답 `[{ "key": "faq", "label": "자주 묻는 질문" }, { "key": "contact", "label": "문의하기" }]`
- 항목을 눌렀을 때 이동할 곳 미정 → 확인 필요 6

### `getVersion` — 버전 정보

- **GET** `/api/version` · 화면 **F08** · 응답 `{ "version": "1.0.0" }`
- 프론트 `package.json` 버전으로 대체 가능 → 확인 필요 6

### (함수 없음) 홈 조회

- spec "홈 조회"(HM-01)가 있으나 B01은 고정 문구라 현재 호출하지 않음. 이름 표시 등이 필요하면 `GET /api/profile` 재사용 제안

---

## 5. 확정

| 항목                                    | 확정 내용                                                                                                                                                                                                                                                           | 반영                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 나이 범위 (구 확인 필요 3)              | **6~10세** (DB `ck_children_2`와 동일)                                                                                                                                                                                                                              | `src/constants/onboarding.js` `AGE_MIN=6`·`AGE_MAX=10` → A07 슬라이더, F03 나이 선택 / `docs/spec.md` ON-07·ST-03 |
| 보호자 유형                             | 학교 선생님 `SCHOOL_TEACHER` · **아동시설 선생님 `FACILITY_TEACHER`** · 부모님 `PARENT` · 기타 `OTHER`                                                                                                                                                              | `docs/spec.md` ON-05·ST-03 ("학원 선생님" 표기 수정)                                                              |
| E04 차트 모양                           | **막대 차트** (Figma 기준, 도넛 아님)                                                                                                                                                                                                                               | `docs/spec.md` RP-04                                                                                              |
| E05 카드 제목 (`trend_title`)           | **프론트 고정 문구** "다양한 마음을 기록했어요". **노션 명세에서 `trend_title` 삭제 대상으로 확정** — 응답에 포함되지 않음                                                                                                                                          | `src/pages/report/ReportPage.jsx` `TREND_CARD_TITLE`                                                              |
| 리포트 문구 필드 (구 확인 필요 4)       | 노션 명세로 필드명 확정 — `mostFrequentEmotions`·`leastFrequentEmotions`(동률 전체·0건 포함), 문구 4개(`most_emotion_reason`·`least_emotion_reason`·`parent_advice`·`trend_interpretation`)는 DB 컬럼과 같은 snake_case. E04 카드 본문에 AI 문구를 쓸지는 아직 미정 | `src/api/archive.js` `mapReportResponse`, `src/mocks/report.js`                                                   |
| 약관 동의 (구 확인 필요 5)              | **화면 표시용, 저장 안 함**. 온보딩 완료 요청에 `agreements`를 보내지 않음 (DB `children`에도 동의 컬럼 없음)                                                                                                                                                       | `src/api/onboarding.js`, `src/pages/onboarding/DonePage.jsx`                                                      |
| 부끄러움 감정 코드 (구 확인 필요 1)     | **`SHAME`** (DB 시드와 동일)                                                                                                                                                                                                                                        | `src/constants/emotions.js`, `src/mocks/*` / `docs/spec.md` 감정 코드 표·AI 연동 예시                             |
| 일기 저장 방식 (구 확인 필요 2)         | 작성 데이터는 `DiaryContext`가 들고 있다가 **완료 시 한 번에 저장** (`POST /api/diaries`). 단계별 저장 없음. AI 질문 요청은 저장 없이 질문만 받음                                                                                                                   | `src/api/diary.js` `getQuestion`·`saveDiary`, `src/pages/diary/*`                                                 |
| 작성 방식 VOICE → TEXT (구 확인 필요 8) | 별도 요청 없이 완료 저장 때 최종 `inputType`만 보냄                                                                                                                                                                                                                 | `src/pages/diary/WritePage.jsx`, `QuestionPage.jsx`                                                               |
| 하루 1개 일기 (구 확인 필요 2)          | 오늘 일기가 있으면 홈 일기 쓰기·하단 + 버튼 진입 시 감정 선택 대신 "오늘은 이미 일기를 썼어요" 안내 + 보관함에서 보기. 오늘 일기 여부는 `GET /api/diaries?year&month` 결과로 확인. 완료 저장 409 `DIARY_ALREADY_EXISTS`도 같은 안내                                 | `src/pages/diary/EmotionPage.jsx`, `AlreadyWritten.jsx`, `ReviewPage.jsx`                                         |

## 6. 확인 필요

번호는 문서 본문의 "확인 필요 N" 참조와 맞추기 위해 그대로 둔다.

| #   | 항목                            | 프론트 현재                | 백엔드/명세                 | 제안                                                                                           |
| --- | ------------------------------- | -------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | ~~부끄러움 감정 코드~~          | —                          | —                           | **확정 (5. 확정 참고)** — `SHAME`으로 통일                                                     |
| 2   | ~~일기 저장 구조 / 하루 1개~~   | —                          | —                           | **확정 (5. 확정 참고)**                                                                        |
| 3   | ~~나이 범위~~                   | —                          | —                           | **확정 (5. 확정 참고)**. 남은 것: 응답에 `ageRecordedAt` 포함 여부                             |
| 4   | ~~리포트 문구 필드~~            | —                          | —                           | **확정 (5. 확정 참고)** — 노션 명세로 필드명 확정. E04 카드 본문에 AI 문구를 쓸지는 아직 미정  |
| 5   | ~~약관 동의 저장~~              | —                          | —                           | **확정 (5. 확정 참고)** — 화면 표시용, 저장 안 함                                              |
| 6   | 약관·구독·고객센터·버전         | API 함수로 mock 조회       | DB 없음, 약관은 프론트 표시 | 정적 데이터로 프론트에 두고 API 제외 검토                                                      |
| 7   | 기본 질문 문구                  | 위 표의 3문장              | AI 담당 "기본 질문 제공"    | 문구 통일                                                                                      |
| 8   | ~~작성 방식 VOICE → TEXT 변경~~ | —                          | —                           | **확정 (5. 확정 참고)** — 별도 요청 없음                                                       |
| 9   | 에러 응답 형식                  | 위 공통 규칙 제안          | 미정                        | `{ code, message }` 합의                                                                       |
| 10  | 음성 인식 외부 전송             | Chrome Web Speech API 사용 | —                           | Chrome은 인식을 위해 음성을 Google 서비스로 보냄. 개인정보 처리방침/보호자 동의 문구 반영 여부 |
