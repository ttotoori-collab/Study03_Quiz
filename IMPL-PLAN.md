# 상식 퀴즈 웹 앱 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**목표:** 카테고리 1개 10문항을 한 판으로 푸는 4지선다 퀴즈 웹 앱을, 답을 고른 즉시 정답·해설·출처가 나오는 형태로 만든다.

**구조:** `index.html`에 화면 5개를 모두 두고 한 번에 하나만 보인다. `script.js`는 모드 서술자(`MODES`) → 순수 함수 → 라운드 엔진 → 화면 전환 → DOM 렌더링 → 초기화 순서의 6구역이고, 엔진은 모드 이름을 모른 채 `MODES`의 스위치 5개만 읽는다. 채점·섞기·정렬 규칙은 DOM과 타이머를 만지지 않는 순수 함수에 모은다.

**기술 스택:** HTML / CSS / 바닐라 JS. 의존성·프레임워크·빌드 없음. 일반 `<script>` 태그 로드, 전역 변수 연결, `localStorage`.

**Spec:** `PRD.md` — 이 계획은 PRD에서만 근거를 가져온다. 실행자는 PRD와 이 문서를 함께 읽는다.

## 전역 제약

모든 작업의 요구사항에 아래가 암묵적으로 포함된다. 값은 PRD에서 그대로 옮긴 것이다.

- 파일은 정확히 4개다: `index.html`, `style.css`, `questions.js`, `script.js`. 더하지 않는다 (PRD §2)
- **자동 테스트 파일을 두지 않는다** (PRD §1, §7). 그래서 이 계획의 검증 단계는 테스트 실행이 아니라 **브라우저 수동 확인**이다. 자동 회귀 테스트가 전혀 없다는 대가는 PRD §7에 적혀 있다
- ES 모듈을 쓰지 않는다. `questions.js`를 `script.js`보다 먼저 로드하고, 파일 간 연결은 전역 변수로 한다 (PRD §2)
- `questions.js`는 전역 변수 `QUIZ_DATA` 하나만 노출한다 (PRD §2)
- **`QUIZ_DATA`를 절대 변형하지 않는다.** 섞기는 사본을 만들어 돌려준다 (PRD §3)
- **엔진에 `if (mode === "speed")` 같은 모드 이름 분기를 쓰지 않는다.** `MODES`의 `timeLimit` / `hint` / `hintScore` / `leaderboard` / `retryWrong`만 읽는다 (PRD §5)
- **한 판의 문항 수를 `10`으로 박아두지 않는다.** 만점은 `round.questions.length`에서 가져온다 (PRD §6, §7)
- `script.js`의 구역 순서를 섞지 않는다: ①`MODES` ②순수 함수 ③라운드 엔진 ④화면 전환 ⑤DOM 렌더링·이벤트 ⑥초기화 (PRD §5)
- 사용자가 입력한 문자는 `textContent`로만 화면에 넣는다. `innerHTML`에 넣지 않는다 (PRD §4)
- `localStorage` 키는 `quiz.v1`이고, 모든 읽기·쓰기를 `try`/`catch`로 감싼다 (PRD §4)
- 기록의 `at`은 KST 오프셋을 포함한 ISO 문자열이다 (예: `2026-10-08T14:22:10+09:00`)
- **`index.html`을 더블클릭해서(`file://`) 동작해야 한다.** 로컬 서버로만 확인하고 끝내지 않는다 (PRD §7)
- 이 디렉터리는 아직 git 저장소가 아니다. 각 작업 끝의 커밋 단계는 `git init` 이후에만 의미가 있다

## 검토 초점

PRD가 요구하지만 어느 작업의 기능 확인에도 자연히 걸리지 않는, 사람을 가장 먼저 물 입력·상황 5개다. 각 줄의 확인 항목은 해당 작업에 심어 두었다.

1. **숨은 탭에서 돌아온 뒤의 남은 시간** — 다른 창을 띄워 두었다 돌아오면 15초가 늘어나 있거나 음수가 찍히면 안 된다. 틱을 세지 말고 `Date.now()` 기준으로 계산한다 → 작업 2.2
2. **시간 초과와 보기 클릭이 같은 순간에 들어옴** — 먼저 확정된 쪽만 반영되어야 하고, 점수가 두 번 더해지면 안 된다 → 작업 2.2
3. **이름 칸에 HTML을 넣음** (`<img src=x onerror=alert(1)>`) — 순위표에 글자 그대로 보여야 하고 실행되면 안 된다 → 작업 3.2
4. **사생활 보호 창** — `localStorage` 접근 자체가 예외를 던져도 퀴즈는 끝까지 정상 동작하고, 안내는 순위표 화면에만 떠야 한다 → 작업 3.1
5. **카테고리에 문항이 10개가 아님** (집필 중 9문항) — 진행 표시와 만점이 실제 문항 수를 따라야 하고, 앱이 멈추면 안 된다 → 작업 1.3

## 단계 게이트

**단계가 끝나면 멈추고 승인을 받는다.** 순서: 1단계 ▸ 문항 규칙 ▸ 2단계 ▸ 3단계. 다음 단계를 미리 시작하지 않는다.

## 파일 구조

| 파일 | 책임 | 단계별 변화 |
|---|---|---|
| `index.html` | 화면 5개의 골격, 스크립트 로드 순서 | 1단계: 시작·퀴즈·결과 3화면 / 2단계: 모드 선택 화면 추가 / 3단계: 순위표 화면 추가 |
| `style.css` | 모든 스타일. 화면 전환(`.hidden`), 정오 색, 비활성 보기, 타이머 막대, 순위표 표 | 단계마다 해당 UI 추가 |
| `questions.js` | 문항 데이터. `QUIZ_DATA` 하나만 노출 | 1단계: 샘플 8문항 / 문항 규칙 단계: 40문항 |
| `script.js` | 6구역(위 전역 제약) | 단계마다 구역 안에 추가. 구역 순서는 고정 |

---

## 1단계 — 연습 모드와 점수

**만들 것**

- 파일 4개 생성. `MODES`에 `practice` **한 줄만**
- 화면 3개: 시작(카테고리 선택) → 퀴즈 → 결과
- 문항 순서와 보기 순서 섞기(사본), 보기를 고른 즉시 채점, 정답 여부 → 한 줄 해설 → 출처 행 → [다음]
- 결과 화면: 점수, 문항별 정오 목록, "순위표에 기록되지 않음" 표시
- `questions.js`에 PRD §3의 샘플 8문항(카테고리당 2문항, `verifiedAt: null`)

**이 단계에 없는 것:** 모드 선택 화면, 스피드·힌트 모드, 틀린 문제 다시 풀기, 순위표, `localStorage` 접근.

**완료 기준**

1. `index.html`을 더블클릭해 열면 콘솔 오류 없이 시작 화면이 나온다
2. 카테고리 4개 중 무엇을 골라도 그 카테고리의 문항을 전부 풀고 결과까지 간다
3. 보기를 고르면 즉시 보기 4개가 잠기고 정답 여부·해설·출처가 나온다
4. 점수가 `맞힌 수 / 문항 수`와 일치하고, 만점이 코드에 박힌 `10`이 아니라 문항 수에서 나온다
5. 한 판을 두 번 돌리면 문항 순서와 보기 위치가 달라진다
6. `QUIZ_DATA`가 변형되지 않는다 (판을 여러 번 돌려도 원본 `answer`가 그대로)

**브라우저에서 직접 확인할 항목**

- [ ] `index.html` 더블클릭(`file://`)으로 열림. 주소창이 `file:///`로 시작하는 것을 확인
- [ ] 한국사를 골라 2문항을 끝까지 풀고 결과 화면 도달
- [ ] 보기를 고른 뒤 다른 보기를 눌러 본다 → 아무 반응 없음 (연타 가드)
- [ ] 일부러 1문항 맞히고 1문항 틀린다 → 결과 점수가 `1 / 2`, 정오 목록이 맞게 표시
- [ ] 해설 아래에 출처 이름이 작게 있고, 출처 링크를 눌러 새 탭에서 열림
- [ ] 같은 카테고리를 다시 시작 → 보기 순서가 지난 판과 다름 (몇 번 반복해 확인)
- [ ] 콘솔에서 `QUIZ_DATA.categories[0].questions[0].answer`가 원래 값 그대로인지 확인
- [ ] 콘솔에서 `QUIZ_DATA.categories[2].questions.pop()`으로 문항 하나를 뺀 뒤 과학을 다시 시작 → 진행 표시가 `1 / 1`, 만점도 1로 나오고 앱이 멈추지 않음 (검토 초점 5. 확인 후 새로고침)

### 작업 1.1: 파일 4개 골격과 화면 전환

**파일**
- 생성: `index.html`, `style.css`, `questions.js`, `script.js`

**인터페이스**
- 제공: 전역 `QUIZ_DATA` (PRD §3 스키마), `showScreen(id)` — `id`는 `"screen-start" | "screen-quiz" | "screen-result"` (2·3단계에서 `"screen-mode"`, `"screen-board"` 추가)
- 제공: `MODES.practice` = `{ name: "연습", timeLimit: null, hint: false, hintScore: null, leaderboard: false, retryWrong: true }`
- 제공: `getCategory(categoryId)` → `QUIZ_DATA.categories`에서 `id`가 일치하는 객체

- [ ] **1단계: `questions.js`에 `QUIZ_DATA` 작성**

PRD §3의 스키마와 샘플 8문항을 그대로 옮긴다. `version: 1`, 카테고리 4개는 `korean-history`/`world-geography`/`science`/`arts-culture`, 각 2문항, `verifiedAt`은 모두 `null`.

- [ ] **2단계: `index.html` 작성**

`<section id="screen-start">`, `#screen-quiz`, `#screen-result` 세 개와 `questions.js` → `script.js` 순서의 `<script>` 태그. 시작 화면에는 카테고리 버튼 4개를 `data-category-id` 속성과 함께 둔다.

- [ ] **3단계: `script.js`에 6구역 주석과 `showScreen(id)` 구현**

`showScreen`은 화면 섹션 전체에 `.hidden`을 붙이고 `id`인 것만 떼는 방식. 구역 주석 6개를 먼저 써 두고 이후 작업이 해당 구역에만 코드를 넣는다.

- [ ] **4단계: `style.css`에 `.hidden { display: none; }`과 기본 레이아웃**

- [ ] **5단계: 브라우저 확인**

`index.html` 더블클릭 → 시작 화면만 보인다. 콘솔에 오류 없음. 콘솔에서 `showScreen("screen-quiz")`를 실행하면 퀴즈 화면으로 바뀐다.

- [ ] **6단계: 커밋** — `chore: 파일 4개 골격과 화면 전환`

### 작업 1.2: 순수 함수 구역

**파일**
- 수정: `script.js` (구역 ② 순수 함수)

**인터페이스**
- 소비: 작업 1.1의 `MODES`, `QUIZ_DATA`
- 제공:
  - `shuffle(array)` → 섞인 **새** 배열 (Fisher-Yates). 입력 배열을 바꾸지 않는다
  - `shuffleChoices(question)` → 문항 사본. `choices`와 `answer`가 **함께** 옮겨져 정답 문자열이 유지된다
  - `buildRound(mode, categoryId, questions)` → `{ mode, categoryId, questions, index: 0, results: [], answered: false, usedHint: false, isReview: false, firstScore: null }`. `questions`는 문항 순서와 각 문항의 보기를 모두 섞은 사본
  - `scoreAnswer(mode, outcome)` → 숫자. `outcome`은 `{ correct, usedHint, timedOut }`
  - `totalScore(round)` → `round.results`의 `score` 합계
  - `formatScore(n)` → 문자열. `7.5` → `"7.5"`, `8` → `"8"`

- [ ] **1단계: `shuffle`, `shuffleChoices`, `buildRound` 구현**

`shuffleChoices`는 보기 인덱스 배열을 섞고 새 `choices`를 만든 뒤, 원래 `answer` 위치가 옮겨 간 자리를 새 `answer`로 삼는다. 원본 문항 객체를 수정하지 않는다.

- [ ] **2단계: `scoreAnswer(mode, outcome)` 구현 — PRD §6 채점표 그대로**

`timedOut`이 참이면 0점(오답 처리). `correct`가 거짓이면 0점(힌트를 썼든 안 썼든 감점 없음). 맞혔고 `usedHint`가 참이며 `MODES[mode].hintScore`가 `null`이 아니면 `hintScore`. 그 밖에 맞히면 1점. **모드 이름을 보지 않고 `MODES[mode]`의 값만 읽는다.**

- [ ] **3단계: `totalScore`, `formatScore` 구현**

- [ ] **4단계: 브라우저 콘솔 확인**

`file://`로 열어 둔 페이지의 콘솔에서:

```js
scoreAnswer("practice", {correct:true,  usedHint:false, timedOut:false})  // 1
scoreAnswer("practice", {correct:false, usedHint:false, timedOut:false})  // 0
formatScore(7.5)  // "7.5"
formatScore(8)    // "8"
var q = QUIZ_DATA.categories[0].questions[0];
var s = shuffleChoices(q);
s.choices[s.answer] === q.choices[q.answer]  // true
q.choices[q.answer]  // 원본 정답 문자열 그대로
```

- [ ] **5단계: 커밋** — `feat: 섞기와 채점 순수 함수`

### 작업 1.3: 퀴즈 진행 엔진과 문항 렌더링

**파일**
- 수정: `script.js` (구역 ③ 엔진, ⑤ DOM), `index.html` (퀴즈 화면 내부), `style.css`

**인터페이스**
- 소비: 작업 1.2의 `buildRound`, `scoreAnswer`
- 제공:
  - `startRound(mode, categoryId)` — `buildRound`로 전역 `round`를 만들고 `showScreen("screen-quiz")` 후 `renderQuestion()`
  - `renderQuestion()` — `round.questions[round.index]`를 그린다. 진행 표시는 `(round.index + 1) + " / " + round.questions.length`
  - `commitAnswer(choiceIndex, timedOut)` — 문항 하나를 확정한다. `choiceIndex`는 숫자 또는 `null`(시간 초과). `round.answered`가 참이면 **즉시 반환**
  - `goNext()` — 다음 문항 또는 결과 화면

- [ ] **1단계: `index.html` 퀴즈 화면 내부 요소 추가**

진행 표시, 문항 본문, 보기 버튼 4개를 담을 컨테이너, 피드백 영역(정답 여부 / 한 줄 해설 / 출처 행), [다음] 버튼.

- [ ] **2단계: `renderQuestion()` 구현**

문항 본문과 보기 4개를 그리고 피드백 영역과 [다음]을 숨긴다. `round.answered = false`, `round.usedHint = false`로 되돌린다. 보기 텍스트는 `textContent`로 넣는다.

- [ ] **3단계: `commitAnswer(choiceIndex, timedOut)` 구현**

맨 앞에서 `round.answered` 가드 → 참이면 반환. 거짓이면 즉시 `true`로 바꾼다. 보기 버튼 4개를 모두 비활성한다. `scoreAnswer`를 불러 `round.results`에 `{ questionId, correct, usedHint, timedOut, score }`를 push 한다. 정답 보기와 (틀렸을 때) 고른 보기를 색으로 구분하고, 한 줄 해설과 `source.name` 출처 행(`source.url`로 가는 새 탭 링크)을 띄우고 [다음]을 보인다. 시간 초과(`timedOut`)도 **같은 화면**을 띄운다.

- [ ] **4단계: `goNext()` 구현과 [다음] 연타 가드**

[다음]을 누르면 즉시 버튼을 비활성한다. `round.index`가 마지막이면 `renderResult()`, 아니면 `index`를 올리고 `renderQuestion()`.

- [ ] **5단계: 시작 화면 카테고리 버튼에 `startRound("practice", id)` 연결**

- [ ] **6단계: 브라우저 확인**

- 카테고리를 골라 문항을 풀고 해설·출처가 나오는지
- 보기를 고른 뒤 다른 보기를 눌러도 반응 없는지
- [다음]을 빠르게 두 번 눌러 문항이 두 개 넘어가지 않는지
- **검토 초점 5.** 콘솔에서 `QUIZ_DATA.categories[2].questions.pop()` 후 과학을 시작 → 진행 표시가 `1 / 1`로 나오고 끝까지 진행되는지 (확인 후 새로고침)

- [ ] **7단계: 커밋** — `feat: 퀴즈 진행 엔진과 즉시 채점`

### 작업 1.4: 결과 화면

**파일**
- 수정: `script.js` (구역 ⑤), `index.html` (결과 화면 내부), `style.css`

**인터페이스**
- 소비: `totalScore`, `formatScore`, `round`
- 제공: `renderResult()` — 점수는 `formatScore(totalScore(round)) + " / " + round.questions.length`. 버튼 [같은 카테고리 다시] / [카테고리 선택으로]

- [ ] **1단계: `index.html` 결과 화면 내부 추가** — 점수 표시, 문항별 정오 목록 컨테이너, 안내 문구 자리, 버튼 2개

- [ ] **2단계: `renderResult()` 구현**

점수, 문항별 정오 목록(문항 본문 + 맞힘/틀림), 그리고 `MODES[round.mode].leaderboard`가 거짓이면 **"순위표에 기록되지 않음"**을 표시한다. 모드 이름으로 분기하지 않는다.

- [ ] **3단계: 버튼 연결** — [같은 카테고리 다시]는 `startRound(round.mode, round.categoryId)`, [카테고리 선택으로]는 `showScreen("screen-start")`

- [ ] **4단계: 브라우저 확인** — 위 "1단계 브라우저에서 직접 확인할 항목" 전부를 한 번 밟는다

- [ ] **5단계: 커밋** — `feat: 결과 화면과 점수 표시`

> **게이트: 여기서 멈추고 승인을 받는다.**

---

## 문항 규칙 — 40문항 집필과 출처 확인

1단계 승인 후, 2단계 전에 한다.

**만들 것**

- `questions.js`를 카테고리당 10문항, 총 40문항으로 채운다
- 문항마다 **웹에서 실제 페이지를 열어 사실을 확인**하고 `source.name`, `source.url`(그 사실이 적힌 **구체 페이지**), `verifiedAt`(`YYYY-MM-DD`)을 채운다. 기관 대표 주소로 두지 않는다
- PRD §3 세 규칙을 지킨다: ①정답이 하나뿐 — 오답 3개가 확실히 거짓인지 문항마다 확인 ②해설에 확인한 출처 명시 ③최상급 표현("가장/최초/최대/최소")에는 기준과 시점을 `text` 안에 적는다
- 집필을 마치면 **일회성 검사 스크립트**를 스크래치패드에서 한 번 돌려 위반 목록을 보고한다. **스크립트를 프로젝트에 남기지 않는다**(파일 4개 제약)

**완료 기준**

1. 카테고리 4개, 각 정확히 10문항, 문항 `id` 40개가 전부 다름
2. `choices`가 4개이고 서로 다름, `answer`가 0~3
3. `explanation`이 비어 있지 않음
4. `source.name`과 `source.url`이 둘 다 있고 `url`이 `http`로 시작
5. **`verifiedAt`이 `null`인 문항이 하나도 없음**
6. `text`에 최상급 표현이 있으면 같은 문항에 4자리 연도나 "기준"이 함께 있음
7. 검사 스크립트가 위반 0건을 보고하고, 스크립트 파일이 프로젝트에 남지 않음

- [ ] **1단계: 카테고리별 10문항 집필** — 사실을 확인한 구체 페이지 주소와 확인 날짜를 문항마다 채운다
- [ ] **2단계: 검사 스크립트를 스크래치패드에 작성해 실행** — 위 완료 기준 1~6을 검사하고 위반 문항의 `id`와 위반 항목을 출력
- [ ] **3단계: 위반 수정 후 재실행** — 위반 0건 확인
- [ ] **4단계: 스크립트 삭제** — 프로젝트 디렉터리에 파일 4개만 남은 것을 확인
- [ ] **5단계: 커밋** — `feat: 문항 40개 집필과 출처 확인`

**브라우저에서 직접 확인할 항목** (사람이 하는 최종 검수 — PRD §7)

- [ ] 카테고리 4개를 각각 한 판씩 끝까지 풀어 본다 (40문항 전부 눈으로 본다)
- [ ] 문항마다 출처 링크를 눌러 **페이지가 살아 있고** 정답이 그 페이지에서 실제로 확인되는지
- [ ] 오답 보기 3개가 확실히 거짓인지 — 참이 될 수 있는 보기가 섞이지 않았는지
- [ ] 해설이 한 줄인지, 화면에서 두 줄 이상으로 넘치지 않는지
- [ ] 최상급 표현 문항에 기준과 시점이 문항 본문에 적혀 있는지
- [ ] 진행 표시가 각 카테고리에서 `1 / 10` … `10 / 10`인지

> **게이트: 여기서 멈추고 승인을 받는다.**

---

## 2단계 — 스피드·힌트 모드, 모드 선택, 다시 풀기

**만들 것**

- `MODES`에 `speed`, `hint` 두 줄 추가
- 모드 선택 화면(화면 흐름의 첫 화면). 시작 화면에 고른 모드 이름 표시, 연습 모드면 "순위표에 기록되지 않음"
- 스피드: 문항당 15초 카운트다운(남은 초 숫자 + 줄어드는 가로 막대), 초과 시 오답 확정, 해설 중 정지, [다음]에 리셋
- 힌트: [힌트] 버튼(문항당 1회), 오답 2개를 비활성+흐림+취소선으로 지우기, 힌트 쓰고 맞히면 0.5점
- 연습 모드 결과 화면의 [틀린 문제 다시 풀기] — 다 맞힐 때까지 반복

**완료 기준**

1. 채점표(PRD §6) 칸 8개가 모두 표값과 일치한다 — 연습 2칸, 스피드 3칸, 힌트 3칸, 그리고 "힌트 쓰고 틀림"도 0점
2. 스피드 모드에서 15초를 방치하면 오답으로 확정되고 해설이 나온다
3. 타이머가 겹치지 않는다 — 문항을 여러 개 연속 진행한 뒤에도 남은 초가 한 칸씩 떨어진다
4. 힌트로 지워지는 2개가 **항상 오답**이다
5. 연습 모드에서 틀린 문항만 다시 풀 수 있고, 복습으로 점수가 오르지 않는다
6. 엔진에 모드 이름 분기가 없다 (`grep`으로 `=== "speed"`, `=== "hint"`, `=== "practice"`가 엔진 구역에 없음을 확인)

**브라우저에서 직접 확인할 항목**

채점표 8칸
- [ ] 연습: 맞힘 1점 / 틀림 0점
- [ ] 스피드: 맞힘 1점 / 틀림 0점 / **15초 방치 0점**
- [ ] 힌트: 맞힘 1점 / **힌트 쓰고 맞힘 0.5점** / 틀림 0점
- [ ] 힌트를 쓰고 **틀렸을** 때 0점이고 감점이 없는지

타이머
- [ ] 15초 방치 → 자동 오답 처리되고 정답·해설이 나오는지
- [ ] 해설이 떠 있는 동안 남은 초가 멈춰 있는지
- [ ] [다음]을 누르면 15초부터 다시 세는지
- [ ] 문항 5개를 연속으로 진행한 뒤 남은 초가 **한 칸씩** 떨어지는지 (겹친 타이머)
- [ ] **다른 창을 띄워 10초쯤 가린 뒤 돌아왔을 때** 남은 초가 늘어나 있지 않고, 음수가 찍히지 않는지 (검토 초점 1.)
- [ ] 남은 초가 1초쯤일 때 보기를 눌러 본다 → 점수가 한 번만 반영되고 결과 목록에 중복 항목이 없는지 (검토 초점 2.)
- [ ] 퀴즈 도중 [모드 선택으로] 빠져나간 뒤 1분쯤 기다렸다 새 판을 시작 → 남은 초가 정상인지 (타이머 정리)

힌트
- [ ] 여러 문항에서 [힌트]를 눌러 지워진 2개가 **모두 오답**인지, 정답이 지워지는 일이 한 번도 없는지
- [ ] 지워진 보기가 화면에서 사라지지 않고 흐림+취소선으로 남아 레이아웃이 튀지 않는지
- [ ] 지워진 보기를 눌러도 반응이 없는지
- [ ] [힌트]를 두 번 눌러도 한 번만 동작하는지

다시 풀기
- [ ] 연습 모드에서 일부러 3개 틀린다 → 결과 화면 맨 위에 [틀린 문제 다시 풀기]가 나오는지
- [ ] 복습에서 또 틀린다 → 버튼이 **또** 나오는지
- [ ] 다 맞힌다 → 버튼이 사라지는지
- [ ] 복습 결과 화면의 점수가 **처음 판 점수 그대로**이고 `남은 오답` 수만 갱신되는지
- [ ] 복습 라운드에 타이머와 [힌트]가 없는지
- [ ] 복습에서 문항·보기 순서가 다시 섞이는지
- [ ] 스피드·힌트 모드 결과 화면에는 이 버튼이 **나오지 않는지**

모드 선택
- [ ] 모드 선택 → 시작 화면에 고른 모드 이름이 보이는지
- [ ] **연습 모드를 고르면 시작 화면 상단에 "순위표에 기록되지 않음"이 보이는지**

### 작업 2.1: `MODES` 확장과 모드 선택 화면

**파일**
- 수정: `index.html` (`#screen-mode` 추가), `script.js` (구역 ①, ④, ⑤), `style.css`

**인터페이스**
- 제공: `MODES.speed` = `{ name: "스피드", timeLimit: 15, hint: false, hintScore: null, leaderboard: true, retryWrong: false }`
- 제공: `MODES.hint` = `{ name: "힌트", timeLimit: null, hint: true, hintScore: 0.5, leaderboard: true, retryWrong: false }`
- 제공: `selectedMode` (전역, 기본 `null`) — 시작 화면에 들어설 때 정해져 있다. `renderStart()`가 이 값을 읽는다

- [ ] **1단계: `MODES`에 두 줄 추가** — 위 값 그대로
- [ ] **2단계: `#screen-mode` 추가** — 연습/스피드/힌트 버튼 3개에 각각 한 줄 설명(제한 시간·힌트·배점)과 [순위표] 버튼 자리. 초기화에서 첫 화면을 `screen-mode`로 바꾼다
- [ ] **3단계: `renderStart()` 구현** — 고른 모드 이름 표시, `MODES[selectedMode].leaderboard`가 거짓이면 "순위표에 기록되지 않음"을 상단에 표시
- [ ] **4단계: 시작 화면 카테고리 버튼 핸들러를 `startRound(selectedMode, id)`로 바꾼다** — 작업 1.3에서 `"practice"`로 박아 둔 자리다
- [ ] **5단계: 결과 화면에 [모드 선택으로] 버튼 추가** — 누를 때 타이머를 정리한다
- [ ] **6단계: 브라우저 확인** — 모드 3개를 각각 골라 시작 화면의 모드 이름과 연습 모드 안내 문구 확인, 그리고 고른 모드로 판이 시작되는지
- [ ] **7단계: 커밋** — `feat: 모드 서술자 확장과 모드 선택 화면`

### 작업 2.2: 스피드 모드 타이머

**파일**
- 수정: `script.js` (구역 ③ 엔진, ⑤ DOM), `index.html` (퀴즈 화면의 남은 초·막대), `style.css`

**인터페이스**
- 소비: `MODES[round.mode].timeLimit`, `commitAnswer(choiceIndex, timedOut)`
- 제공:
  - `startTimer()` — `MODES[round.mode].timeLimit`이 `null`이면 아무것도 하지 않고 타이머 UI를 숨긴다. 아니면 `deadline = Date.now() + timeLimit * 1000`을 두고 `setInterval`로 갱신한다
  - `stopTimer()` — `clearInterval`하고 `timerId = null`. **여러 번 불러도 안전해야 한다**
  - 전역 `timerId`, `deadline`

- [ ] **1단계: `index.html`·`style.css`에 남은 초 숫자와 가로 막대 추가** — `timeLimit`이 없는 모드에서는 숨긴다
- [ ] **2단계: `startTimer()` / `stopTimer()` 구현**

남은 시간은 **틱을 세지 않고** `deadline - Date.now()`로 계산한다(숨은 탭에서 `setInterval`이 느려져도 늘어나지 않게). 화면에는 음수가 아닌 값만 표시한다. 0 이하가 되면 `stopTimer()` 후 `commitAnswer(null, true)`.

- [ ] **3단계: 타이머 정리 지점 4곳 연결**

`startTimer()`는 호출 맨 앞에서 `stopTimer()`를 먼저 부른다. 그리고 ①`commitAnswer` 안(문항 확정), ②결과 화면으로 갈 때, ③[모드 선택으로]/[카테고리 선택으로] 빠져나갈 때, ④새 판 시작 시 각각 `stopTimer()`를 부른다.

- [ ] **4단계: `renderQuestion()` 끝에서 `startTimer()` 호출**

- [ ] **5단계: 브라우저 확인** — 위 "타이머" 확인 항목 7개 전부. 특히 숨은 탭 복귀(검토 초점 1.)와 1초 남기고 클릭(검토 초점 2.)

- [ ] **6단계: 커밋** — `feat: 스피드 모드 타이머`

### 작업 2.3: 힌트 모드

**파일**
- 수정: `script.js` (구역 ② 순수 함수, ③, ⑤), `index.html` ([힌트] 버튼), `style.css` (지워진 보기 스타일)

**인터페이스**
- 소비: `MODES[round.mode].hint`, `MODES[round.mode].hintScore`, `round.usedHint`
- 제공:
  - `pickHintChoices(question)` → 지울 보기 인덱스 **2개** 배열. `question.answer`를 **절대 포함하지 않는다**
  - `applyHint()` — `pickHintChoices`가 돌려준 보기 2개를 비활성화하고 `.eliminated` 클래스를 붙이고, `round.usedHint = true`, [힌트] 버튼을 비활성한다

- [ ] **1단계: `pickHintChoices(question)` 구현** — 오답 인덱스 3개를 모아 `shuffle`로 섞고 앞 2개를 돌려준다
- [ ] **2단계: `.eliminated` 스타일** — 흐림 + 취소선. DOM에서 없애지 않는다(레이아웃이 튀지 않게)
- [ ] **3단계: [힌트] 버튼과 `applyHint()` 연결** — 버튼은 `MODES[round.mode].hint`가 참일 때만 보인다
- [ ] **4단계: 지워진 보기 클릭 차단 확인** — `commitAnswer`가 비활성 보기에서는 호출되지 않는 것을 확인
- [ ] **5단계: `commitAnswer`에 `round.usedHint` 전달 확인** — `scoreAnswer`가 0.5점을 돌려주는지 (작업 1.2에서 이미 구현됨, 배선만 확인)
- [ ] **6단계: 브라우저 확인**

- 힌트 모드로 한 판을 풀며 **문항마다** [힌트]를 눌러 지워진 2개가 모두 오답인지 확인
- 힌트 쓰고 맞힘 → 0.5점, 힌트 쓰고 틀림 → 0점이고 감점 없음
- [힌트] 두 번 클릭, 지워진 보기 클릭

- [ ] **7단계: 커밋** — `feat: 힌트 모드`

### 작업 2.4: 틀린 문제 다시 풀기

**파일**
- 수정: `script.js` (구역 ②, ③, ⑤), `index.html` (결과 화면 버튼), `style.css`

**인터페이스**
- 소비: `MODES[round.mode].retryWrong`, `buildRound`, `round.results`
- 제공:
  - `collectWrong(round)` → `round.results`에서 `correct`가 거짓인 항목의 **원본 문항** 배열 (`QUIZ_DATA`에서 `questionId`로 찾는다)
  - `startReviewRound()` — `collectWrong(round)`로 새 라운드를 만든다. `isReview: true`, `firstScore`는 **처음 판의 점수**(현재 라운드가 이미 복습이면 그 값을 그대로 물려받는다). `timeLimit`과 `hint`가 없는 연습 방식으로 푼다

- [ ] **1단계: `collectWrong(round)` 구현**
- [ ] **2단계: `startReviewRound()` 구현** — 문항 순서와 보기 순서를 **다시 섞는다**(`buildRound`가 이미 한다). `firstScore = round.isReview ? round.firstScore : totalScore(round)`
- [ ] **3단계: `renderResult()`에 복습 분기 추가**

`MODES[round.mode].retryWrong`이 참이고 `collectWrong(round).length > 0`이면 [틀린 문제 다시 풀기]를 **맨 위에** 보인다. `round.isReview`가 참이면 점수 표시에 `firstScore`를 쓰고(복습으로 점수가 오르지 않는다) `남은 오답 N문항`을 함께 보인다.

- [ ] **4단계: 복습 라운드에서 타이머·힌트가 뜨지 않는 것 확인** — 복습은 연습 모드 라운드이므로 `MODES.practice`의 스위치가 그대로 적용된다
- [ ] **5단계: 브라우저 확인** — 위 "다시 풀기" 확인 항목 7개 전부
- [ ] **6단계: 커밋** — `feat: 틀린 문제 다시 풀기`

> **게이트: 여기서 멈추고 승인을 받는다.**

---

## 3단계 — 점수 저장과 순위표

**만들 것**

- `localStorage` 키 `quiz.v1` 읽기·쓰기와 실패 처리
- 결과 화면의 이름 입력과 [순위표에 저장] — **스피드·힌트 모드만**, **한 판에 한 번만**
- 순위표 화면: 표 8개(모드 2 × 카테고리 4), 각 상위 5건에 순위·이름·점수·날짜, 빈 표는 "기록 없음", 저장 불가 환경이면 안내 문구

**완료 기준**

1. 스피드·힌트 모드 점수가 `모드|카테고리` 키로 저장되고 브라우저를 완전히 닫았다 열어도 남아 있다
2. **연습 모드는 아무것도 쓰지 않는다** — `practice|...` 키가 생기지 않는다
3. 정렬이 `score` 내림차순, 동점이면 `at` 오름차순(먼저 세운 기록이 위), 상위 5건만 남는다
4. 이름은 앞뒤 공백을 떼고 12자로 자르고, 비면 `익명`
5. 읽기·파싱 실패와 `version` 불일치는 조용히 버리고 빈 순위표로 시작한다
6. 쓰기 실패 시 **퀴즈는 정상 동작하고** 순위표 화면에만 안내가 뜬다
7. [순위표에 저장]을 누르면 비활성되어 같은 점수를 두 번 넣을 수 없다

**브라우저에서 직접 확인할 항목**

- [ ] 스피드 모드로 한 판 풀고 이름을 넣어 저장 → 순위표에 들어가는지
- [ ] [순위표에 저장]을 두 번 눌러 보기 → 두 번째는 비활성이고 기록이 하나만 들어가는지
- [ ] 저장하지 않고 [모드 선택으로] 나갔다가 → 그 판이 기록되지 않는지
- [ ] **연습 모드로 한 판 풀고** 결과 화면에 이름 입력이 **없는지**, 콘솔에서 `localStorage.getItem("quiz.v1")`에 `practice|`가 **없는지**
- [ ] 표 8개가 모드 × 카테고리로 맞게 갈리는지 (스피드/한국사에 넣은 기록이 힌트/한국사 표에 안 보이는지)
- [ ] 같은 점수를 두 번 넣어 **먼저 세운 기록이 위**인지
- [ ] 같은 표에 6건을 넣어 **가장 낮은 1건이 밀려나는지**
- [ ] 이름을 비우고 저장 → `익명`으로 들어가는지
- [ ] 13자 이상 이름 → 12자로 잘리는지
- [ ] **이름에 `<img src=x onerror=alert(1)>`를 넣어 저장** → 순위표에 글자 그대로 보이고 경고창이 뜨지 않는지 (검토 초점 3.)
- [ ] 콘솔에서 `localStorage.setItem("quiz.v1", "{깨진")` 후 새로고침 → 빈 순위표로 시작하고 앱이 정상인지
- [ ] 콘솔에서 `localStorage.setItem("quiz.v1", JSON.stringify({version:2,scores:{}}))` 후 새로고침 → 조용히 버리고 빈 순위표인지
- [ ] **사생활 보호 창(시크릿 모드)에서** 한 판을 끝까지 풀 수 있고, 순위표 화면에 "이 브라우저에서는 기록을 저장할 수 없습니다"가 뜨는지 (검토 초점 4.)
- [ ] 브라우저를 **완전히 닫았다** 다시 열어도 기록이 남아 있는지
- [ ] 빈 표에 "기록 없음"이 보이는지
- [ ] 마지막으로 `index.html` 더블클릭(`file://`)에서 위 전부가 동작하는지

### 작업 3.1: 영속성 함수

**파일**
- 수정: `script.js` (구역 ② 순수 함수 영역 끝)

**인터페이스**
- 제공:
  - `scoreKey(mode, categoryId)` → `"speed|korean-history"` 꼴 문자열
  - `loadScores()` → 항상 `{ version: 1, scores: {} }` 모양의 객체. 읽기 예외·파싱 실패·`version !== 1`이면 조용히 버리고 빈 객체를 돌려준다
  - `rankScores(entries)` → `score` 내림차순, 동점이면 `at` 오름차순으로 정렬한 뒤 **상위 5건**만 남긴 새 배열
  - `saveScore(key, entry)` → `true`/`false` (쓰기 성공 여부). `entry`는 `{ name, score, at }`
  - 전역 `canPersist` (기본 `true`) — `saveScore`가 `false`를 돌려주면 `false`로 둔다

- [ ] **1단계: `scoreKey`, `rankScores` 구현** — 상한 5는 상수 한 곳에 둔다
- [ ] **2단계: `loadScores()` 구현** — `try`/`catch` 안에서 읽고 파싱한다. 실패·버전 불일치는 예외를 밖으로 내보내지 않는다
- [ ] **3단계: `saveScore(key, entry)` 구현** — `loadScores()` → 해당 키 배열에 push → `rankScores` → `try`/`catch`로 쓰기. 예외면 `canPersist = false`로 두고 `false` 반환. **예외를 밖으로 던지지 않는다**
- [ ] **4단계: 브라우저 콘솔 확인**

```js
rankScores([{name:"a",score:7,at:"2026-10-08T13:00:00+09:00"},
            {name:"b",score:7,at:"2026-10-08T12:00:00+09:00"},
            {name:"c",score:9,at:"2026-10-08T14:00:00+09:00"}])
// c(9) → b(7, 먼저) → a(7)
localStorage.setItem("quiz.v1", "{깨진");  loadScores()  // {version:1, scores:{}}
```

- [ ] **5단계: 사생활 보호 창에서 확인** (검토 초점 4.)

시크릿 창에서 `index.html`을 열고 콘솔에서 `loadScores()`와 `saveScore("speed|science", {name:"t", score:1, at:"2026-10-08T14:00:00+09:00"})`를 부른다. **예외가 콘솔로 새어 나오지 않고** `saveScore`가 `false`를 돌려주며 `canPersist`가 `false`가 되는지, 그 뒤에도 한 판을 끝까지 풀 수 있는지 확인한다.

- [ ] **6단계: 커밋** — `feat: 순위표 영속성 함수`

### 작업 3.2: 결과 화면의 이름 입력과 저장

**파일**
- 수정: `script.js` (구역 ②, ⑤), `index.html` (결과 화면), `style.css`

**인터페이스**
- 소비: `MODES[round.mode].leaderboard`, `saveScore`, `scoreKey`, `totalScore`
- 제공:
  - `normalizeName(raw)` → 앞뒤 공백을 떼고 12자로 자른다. 결과가 빈 문자열이면 `"익명"`
  - `nowKst()` → KST 오프셋을 포함한 ISO 문자열 (`2026-10-08T14:22:10+09:00`)

- [ ] **1단계: `index.html` 결과 화면에 이름 입력과 [순위표에 저장] 버튼 추가** (`maxlength` 외에 코드에서도 자른다)
- [ ] **2단계: `normalizeName`, `nowKst` 구현**
- [ ] **3단계: `renderResult()`에 저장 영역 분기 추가** — `MODES[round.mode].leaderboard`가 참이고 `round.isReview`가 거짓일 때만 보인다. 모드 이름으로 분기하지 않는다
- [ ] **4단계: [순위표에 저장] 핸들러 구현** — 누르는 즉시 버튼을 비활성한다. `saveScore(scoreKey(round.mode, round.categoryId), { name: normalizeName(입력값), score: totalScore(round), at: nowKst() })`. 저장된 이름은 `textContent`로만 표시한다
- [ ] **5단계: 브라우저 확인** — 두 번 클릭, 빈 이름, 13자 이름, 그리고 **`<img src=x onerror=alert(1)>` 이름**(검토 초점 3.), 연습 모드에서 저장 영역이 없는지
- [ ] **6단계: 커밋** — `feat: 결과 화면 점수 저장`

### 작업 3.3: 순위표 화면

**파일**
- 수정: `script.js` (구역 ⑤), `index.html` (`#screen-board`), `style.css`

**인터페이스**
- 소비: `loadScores`, `rankScores`, `formatScore`, `canPersist`, `MODES`, `QUIZ_DATA`
- 제공: `renderBoard()` — `leaderboard`가 참인 모드 × 카테고리 4개로 표를 그린다. 표 제목은 `MODES[mode].name`과 카테고리 `name`. 표가 비면 "기록 없음". `canPersist`가 거짓이면 화면 상단에 **"이 브라우저에서는 기록을 저장할 수 없습니다"**

- [ ] **1단계: `#screen-board`와 [뒤로] 버튼 추가**
- [ ] **2단계: `renderBoard()` 구현** — 표 목록을 `MODES`에서 `leaderboard`가 참인 모드만 뽑아 만든다(하드코딩한 `["speed","hint"]`가 아니다). 각 행은 순위·이름·점수(`formatScore`)·날짜(KST)
- [ ] **3단계: 모드 선택 화면과 결과 화면의 [순위표] 버튼 연결** — 들어갈 때마다 `renderBoard()`를 다시 부른다
- [ ] **4단계: 저장 불가 안내 연결** — `canPersist`가 거짓일 때만 표시
- [ ] **5단계: 브라우저 확인** — 위 "3단계 브라우저에서 직접 확인할 항목" 전부. 시크릿 모드와 `file://` 확인을 빠뜨리지 않는다
- [ ] **6단계: 커밋** — `feat: 순위표 화면`

> **게이트: 여기서 멈추고 승인을 받는다.**

---

## 최종 확인

- [ ] 프로젝트 디렉터리에 `index.html`, `style.css`, `questions.js`, `script.js` 4개와 문서(`PRD.md`, `IMPL-PLAN.md`)만 있다
- [ ] PRD §1 성공 기준 8개를 하나씩 짚어 확인한다
- [ ] PRD §7 수동 체크리스트 전체를 `file://`에서 한 번 밟는다
