# 프-백 API 명세 초안 (프론트 기준)

> 프론트 `src/api/*.js` 함수 기준으로 정리한 **초안**이다. 백·AI 담당과 확정 전까지 경로·필드는 제안값이다.
> 기준 자료: `docs/spec.md`(기능·AI 연동 명세), 백엔드 레포 `db/mysql-schema.sql`·`domain/entity/*` (2026-11-06 기준, 컨트롤러·DTO는 아직 없음)

---

## 0. 공통 규칙

| 항목         | 규칙                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL     | `VITE_API_BASE_URL` (배포 환경은 **https** 필수)                                                                                      |
| 인증         | 없음. 서버가 기본 사용자(`child_id = 1`)로 고정                                                                                       |
| Content-Type | `application/json; charset=utf-8`                                                                                                     |
| 날짜         | `YYYY-MM-DD` 문자열 (예: `"2026-11-06"`). 일기 날짜(`diary_date`)는 서버가 **Asia/Seoul** 기준으로 정한다                             |
| 일시         | ISO 8601 UTC (예: `"2026-11-06T05:12:00Z"`) — 프론트는 현재 일시 필드를 쓰지 않음                                                     |
| 감정 코드    | `JOY`(기쁨) · `SADNESS`(슬픔) · `ANGER`(화남) · `FEAR`(무서움) · `SURPRISE`(놀람) · `SHYNESS`(부끄러움) ⚠️ DB는 `SHAME` — 확인 필요 1 |
| 질문 타입    | `order` 1=`EMOTION`(감정 탐색), 2=`REASON`(이유 탐색), 3=`PERSPECTIVE`(관점 확장) — DB `QuestionStage`, `sequence`와 동일             |
| 작성 방식    | `VOICE` · `TEXT` (DB `InputType`). TEXT 본문은 500자 이하                                                                             |
| 보호자 유형  | `PARENT` · `SCHOOL_TEACHER` · `FACILITY_TEACHER` · `OTHER` (DB `GuardianType`)                                                        |
| 필드 표기    | JSON은 camelCase                                                                                                                      |

### 에러 응답 (제안)

HTTP 상태코드 + 아래 본문. 프론트는 `message`를 그대로 보여주지 않고 화면별 안내 문구 + 다시 시도 버튼을 쓴다(`code`로 분기).

```json
{
  "code": "DIARY_NOT_FOUND",
  "message": "일기를 찾을 수 없습니다."
}
```

| 상태           | code 예시                                                   | 프론트 처리                           |
| -------------- | ----------------------------------------------------------- | ------------------------------------- |
| 400            | `INVALID_REQUEST`, `INVALID_DATE_RANGE`, `CONTENT_TOO_LONG` | 입력 화면 유지 + 안내                 |
| 404            | `DIARY_NOT_FOUND`, `PROFILE_NOT_FOUND`                      | 빈 상태 화면(예: E02 빈 날짜 안내)    |
| 409            | `DIARY_ALREADY_EXISTS` (하루 1개 제약)                      | 안내 후 보관함으로 이동 — 확인 필요 2 |
| 500 / 네트워크 | `INTERNAL_ERROR`                                            | 공통 에러 안내 + 다시 시도            |

질문 생성은 AI 실패 시에도 **200 + 기본 질문 + `isFallback: true`** 로 응답한다(`docs/spec.md`: BE1이 `isFallback` 설정). 프론트도 요청 자체가 실패하면 같은 기본 질문으로 대체한다.

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

- 약관 동의값은 **화면 표시용, 저장 안 함** (확정 — 5. 확정 참고). 요청에 `agreements`를 보내지 않는다. 필수 동의 전에는 A03 완료 버튼이 비활성이라 프론트에서만 막는다
- 나이 범위 **6~10세 확정** (DB 제약과 동일). 프론트도 같은 범위만 보낸다

---

## 2. 일기 작성 (B·C·D 화면)

> ⚠️ **구조 차이 (확인 필요 2)**: 스키마 주석은 "일기 1개 + 질문 3개를 **한 트랜잭션**으로 저장, 일기 UPDATE 엔드포인트 없음"이다.
> 반면 `docs/spec.md`는 "선택한 감정·작성 방식으로 **초안 생성** → 본문 저장 → 질문 생성 → 답변 저장 → 작성 완료"로 단계별 저장을 말한다.
> 프론트는 현재 단계별 함수로 나뉘어 있지만, 일기 작성 데이터를 `DiaryContext`에 모두 들고 있으므로 **A안(최종 1회 저장)** 으로도 바로 바꿀 수 있다.
>
> - **A안 (스키마 기준, 프론트 추천)**: 질문 생성만 매번 호출(저장 X), 완료하기에서 전체를 한 번에 저장
> - **B안 (spec 기준)**: 초안 테이블/상태 컬럼 추가 후 단계별 저장

### `createDiaryDraft` — 초안 생성 (B안에서만)

- **POST** `/api/diaries/drafts` · 화면 **B04~B05** (작성 방식 선택 시)

```json
// 요청
{ "emotion": "SADNESS", "inputType": "VOICE" }
// 응답 201
{ "diaryId": 101, "emotion": "SADNESS", "inputType": "VOICE" }
```

- **차이**: DB에 초안 개념 없음. A안이면 이 API는 없어지고 프론트는 `diaryId` 없이 진행

### `saveDiaryContent` — 본문 저장 (B안에서만)

- **PUT** `/api/diaries/drafts/{diaryId}/content` · 화면 **C03 / D01**

```json
// 요청
{ "content": "오늘 친구랑 놀다가 조금 속상한 일이 있었어요." }
// 응답 200
{ "diaryId": 101, "content": "오늘 친구랑 놀다가 조금 속상한 일이 있었어요." }
```

### `getQuestion` — AI 질문 생성

- **POST** `/api/diaries/questions` (A안, 저장 없음) 또는 **POST** `/api/diaries/drafts/{diaryId}/questions` (B안)
- 화면 **C04 / C07 / C10 / D03 / D04 / D05** 진입 시

```json
// 요청 — docs/spec.md "BE1 → AI 요청"과 같은 형식
{
  "emotion": "SADNESS",
  "content": "오늘 친구랑 놀다가 조금 속상한 일이 있었어요.",
  "order": 2,
  "type": "REASON",
  "previousAnswers": [
    { "order": 1, "type": "EMOTION", "question": "그때 어떤 기분이 들었나요?", "answer": "속상했어요." }
  ]
}
// 응답 200
{ "order": 2, "type": "REASON", "content": "왜 그런 기분이 들었다고 생각하나요?", "isFallback": false }
```

- 프론트 처리: 대기 중 로딩 연출, 실패 시 아래 기본 질문으로 대체하고 진행

| order | type        | 기본 질문 (프론트 `src/mocks/questions.js`) |
| ----- | ----------- | ------------------------------------------- |
| 1     | EMOTION     | 그때 어떤 기분이 들었나요?                  |
| 2     | REASON      | 왜 그런 기분이 들었다고 생각하나요?         |
| 3     | PERSPECTIVE | 친구는 그때 어떤 기분이었을까요?            |

- **차이**: spec의 `questionId`는 B안에서만 의미 있음. 기본 질문 문구는 AI 담당 기본 질문과 맞춰야 함 → 확인 필요 7

### `saveAnswer` — 답변 저장 (B안에서만)

- **PUT** `/api/diaries/drafts/{diaryId}/questions/{order}/answer` · 화면 **C06 / C09 / C12 / D03~D05**

```json
// 요청
{ "answer": "내 장난감을 말없이 가져가서 속상했어요." }
// 응답 200
{ "diaryId": 101, "order": 1, "answer": "내 장난감을 말없이 가져가서 속상했어요." }
```

### `completeDiary` — 작성 완료

- **POST** `/api/diaries` (A안) 또는 **POST** `/api/diaries/drafts/{diaryId}/complete` (B안) · 화면 **C13 / D06** 완료하기

```json
// 요청 (A안 — 전체 한 번에)
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

- 음성 인식 결과 수정은 클라이언트에서만 하고, 최종 텍스트를 `inputType: "VOICE"`로 저장 (스키마 주석과 일치)
- **차이**: 하루 1개 제약(`UNIQUE(child_id, diary_date)`) → 같은 날 두 번째 작성 시 409. 프론트 mock은 하루 여러 개 허용 → 확인 필요 2

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
    { "emotion": "SHYNESS", "count": 0, "ratio": 0 }
  ],
  "days": [
    { "date": "2026-11-01", "emotions": ["JOY"] },
    { "date": "2026-11-02", "emotions": [] }
  ],
  "description": "선택한 기간에는 기쁨을 가장 자주 기록했어요.",
  "advice": "아이와 즐거웠던 순간을 이야기해 주세요.",
  "interpretation": "기쁨과 슬픔을 기록했고, 마지막 기록은 기쁨이었어요."
}
```

- 가장 자주/적게 느낀 감정(E04)은 프론트가 `distribution`으로 계산해서 표시
- **차이**: DB `emotion_reports` 컬럼은 `most_emotion_reason`·`least_emotion_reason`·`parent_advice`·`trend_title`·`trend_interpretation` (spec 응답은 `description`·`advice`·`interpretation`) → 확인 필요 4
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

| 항목                          | 확정 내용                                                                                                                                                                       | 반영                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 나이 범위 (구 확인 필요 3)    | **6~10세** (DB `ck_children_2`와 동일)                                                                                                                                          | `src/constants/onboarding.js` `AGE_MIN=6`·`AGE_MAX=10` → A07 슬라이더, F03 나이 선택 / `docs/spec.md` ON-07·ST-03 |
| 보호자 유형                   | 학교 선생님 `SCHOOL_TEACHER` · **아동시설 선생님 `FACILITY_TEACHER`** · 부모님 `PARENT` · 기타 `OTHER`                                                                          | `docs/spec.md` ON-05·ST-03 ("학원 선생님" 표기 수정)                                                              |
| E04 차트 모양                 | **막대 차트** (Figma 기준, 도넛 아님)                                                                                                                                           | `docs/spec.md` RP-04                                                                                              |
| E05 카드 제목 (`trend_title`) | **프론트 고정 문구** "다양한 마음을 기록했어요". API 응답에 `trendTitle` 없음. **백엔드 컬럼 제거 또는 null 허용 요청함** (DB `trend_title`은 현재 `NOT NULL` + 빈 문자열 금지) | `src/pages/report/ReportPage.jsx` `TREND_CARD_TITLE`                                                              |
| 약관 동의 (구 확인 필요 5)    | **화면 표시용, 저장 안 함**. 온보딩 완료 요청에 `agreements`를 보내지 않음 (DB `children`에도 동의 컬럼 없음)                                                                   | `src/api/onboarding.js`, `src/pages/onboarding/DonePage.jsx`                                                      |

## 6. 확인 필요

번호는 문서 본문의 "확인 필요 N" 참조와 맞추기 위해 그대로 둔다.

| #   | 항목                        | 프론트 현재                             | 백엔드/명세                                                                                    | 제안                                                                                                   |
| --- | --------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | 부끄러움 감정 코드          | `SHYNESS`                               | DB 시드 `SHAME`, spec `SHYNESS`                                                                | 한쪽으로 통일 (spec 기준이면 DB 시드 수정)                                                             |
| 2   | 일기 저장 구조 / 하루 1개   | 단계별 함수 + 하루 여러 개              | DB: 1회 트랜잭션 저장, `UNIQUE(child_id, diary_date)` / spec: 초안·단계별 저장, days에 여러 개 | A안(최종 1회 저장) 추천. 하루 1개면 홈에서 "오늘 이미 작성" 처리 필요                                  |
| 3   | ~~나이 범위~~               | —                                       | —                                                                                              | **확정 (5. 확정 참고)**. 남은 것: 응답에 `ageRecordedAt` 포함 여부                                     |
| 4   | 리포트 문구 필드            | `description`·`advice`·`interpretation` | DB `most/least_emotion_reason`·`parent_advice`·`trend_interpretation`                          | 응답 필드명 매핑 확정. E04 최다/최소 감정 설명을 AI 문구로 쓸지. (`trend_title`은 확정 — 5. 확정 참고) |
| 5   | ~~약관 동의 저장~~          | —                                       | —                                                                                              | **확정 (5. 확정 참고)** — 화면 표시용, 저장 안 함                                                      |
| 6   | 약관·구독·고객센터·버전     | API 함수로 mock 조회                    | DB 없음, 약관은 프론트 표시                                                                    | 정적 데이터로 프론트에 두고 API 제외 검토                                                              |
| 7   | 기본 질문 문구              | 위 표의 3문장                           | AI 담당 "기본 질문 제공"                                                                       | 문구 통일                                                                                              |
| 8   | 작성 방식 VOICE → TEXT 변경 | 프론트 상태만 변경                      | B안이면 변경 API 필요, A안이면 최종 저장 시 `inputType`만 보내면 됨                            | A안이면 별도 API 불필요                                                                                |
| 9   | 에러 응답 형식              | 위 공통 규칙 제안                       | 미정                                                                                           | `{ code, message }` 합의                                                                               |
| 10  | 음성 인식 외부 전송         | Chrome Web Speech API 사용              | —                                                                                              | Chrome은 인식을 위해 음성을 Google 서비스로 보냄. 개인정보 처리방침/보호자 동의 문구 반영 여부         |
