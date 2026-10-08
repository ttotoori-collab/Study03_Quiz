/* 상식 퀴즈 — 모드 서술자, 순수 함수, 엔진, DOM 처리.
   questions.js 가 먼저 로드되어 QUIZ_DATA 가 있다고 전제한다.
   구역 순서를 섞지 않는다. */

/* ====================================================================
   1. 모드 서술자
   엔진은 모드 이름을 알지 못한다. 아래 스위치만 읽는다.
   ==================================================================== */

var MODES = {
  practice: { name: "연습", timeLimit: null, hint: false, hintScore: null, leaderboard: false, retryWrong: true }
};

/* ====================================================================
   2. 순수 함수
   DOM 과 타이머를 만지지 않는다.
   ==================================================================== */

function getCategory(categoryId) {
  var list = QUIZ_DATA.categories;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === categoryId) {
      return list[i];
    }
  }
  return null;
}

/* 배열 → 섞인 새 배열 (Fisher-Yates). 입력 배열은 바꾸지 않는다. */
function shuffle(array) {
  var copy = array.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

/* 문항 → choices 와 answer 가 함께 옮겨진 사본.
   QUIZ_DATA 의 원본은 건드리지 않는다 (PRD §3 원본 불변 원칙). */
function shuffleChoices(question) {
  var order = [];
  for (var i = 0; i < question.choices.length; i++) {
    order.push(i);
  }
  order = shuffle(order);

  var choices = [];
  var answer = -1;
  for (var k = 0; k < order.length; k++) {
    choices.push(question.choices[order[k]]);
    if (order[k] === question.answer) {
      answer = k;
    }
  }

  return {
    id: question.id,
    text: question.text,
    choices: choices,
    answer: answer,
    explanation: question.explanation,
    source: { name: question.source.name, url: question.source.url },
    verifiedAt: question.verifiedAt
  };
}

/* 한 판의 상태. 문항 순서와 각 문항의 보기를 모두 섞은 사본을 담는다. */
function buildRound(mode, categoryId, questions) {
  var ordered = shuffle(questions);
  var copies = [];
  for (var i = 0; i < ordered.length; i++) {
    copies.push(shuffleChoices(ordered[i]));
  }

  return {
    mode: mode,
    categoryId: categoryId,
    questions: copies,
    index: 0,
    results: [],
    answered: false,
    usedHint: false,
    isReview: false,
    firstScore: null
  };
}

/* 채점표 (PRD §6). 모드 이름을 보지 않고 MODES 의 값만 읽는다. */
function scoreAnswer(mode, outcome) {
  if (outcome.timedOut) {
    return 0;
  }
  if (!outcome.correct) {
    return 0;
  }
  if (outcome.usedHint && MODES[mode].hintScore !== null) {
    return MODES[mode].hintScore;
  }
  return 1;
}

function totalScore(round) {
  var sum = 0;
  for (var i = 0; i < round.results.length; i++) {
    sum += round.results[i].score;
  }
  return sum;
}

function formatScore(n) {
  return String(n);
}

/* ====================================================================
   3. 라운드 엔진
   ==================================================================== */

/* ====================================================================
   4. 화면 전환
   ==================================================================== */

function showScreen(id) {
  var screens = document.querySelectorAll(".screen");
  for (var i = 0; i < screens.length; i++) {
    if (screens[i].id === id) {
      screens[i].classList.remove("hidden");
    } else {
      screens[i].classList.add("hidden");
    }
  }
}

/* ====================================================================
   5. DOM 렌더링과 이벤트 연결
   ==================================================================== */

/* ====================================================================
   6. 초기화
   ==================================================================== */

showScreen("screen-start");
