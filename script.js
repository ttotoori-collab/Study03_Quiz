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

var round = null;

function startRound(mode, categoryId) {
  round = buildRound(mode, categoryId, getCategory(categoryId).questions);
  showScreen("screen-quiz");
  renderQuestion();
}

/* 문항 하나를 확정한다. choiceIndex 는 숫자 또는 null(시간 초과).
   먼저 확정된 쪽만 반영한다 (PRD §7). */
function commitAnswer(choiceIndex, timedOut) {
  if (round.answered) {
    return;
  }
  round.answered = true;

  var question = round.questions[round.index];
  var correct = !timedOut && choiceIndex === question.answer;
  var outcome = { correct: correct, usedHint: round.usedHint, timedOut: !!timedOut };

  round.results.push({
    questionId: question.id,
    correct: correct,
    usedHint: round.usedHint,
    timedOut: !!timedOut,
    score: scoreAnswer(round.mode, outcome)
  });

  renderFeedback(choiceIndex, correct, !!timedOut);
}

function goNext() {
  /* 확정되지 않은 문항에서는 넘어가지 않는다 — 연타로 문항 두 개를
     건너뛰는 사고를 막는다 (PRD §7). */
  if (!round.answered) {
    return;
  }
  if (round.index >= round.questions.length - 1) {
    renderResult();
    return;
  }
  round.index += 1;
  renderQuestion();
}

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

function renderQuestion() {
  var question = round.questions[round.index];

  round.answered = false;
  round.usedHint = false;

  document.getElementById("status-label").textContent =
    getCategory(round.categoryId).name + " · " + MODES[round.mode].name;
  document.getElementById("quiz-progress").textContent =
    (round.index + 1) + " / " + round.questions.length;
  renderStatusScore();
  document.getElementById("quiz-text").textContent = question.text;

  var list = document.getElementById("choice-list");
  list.textContent = "";
  for (var i = 0; i < question.choices.length; i++) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = question.choices[i];
    button.dataset.choiceIndex = String(i);
    list.appendChild(button);
  }

  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("btn-next").disabled = false;
}

function renderStatusScore() {
  document.getElementById("status-score").textContent = "점수 " + formatScore(totalScore(round));
}

/* 정답 여부 → 한 줄 해설 → 출처 행 → [다음].
   시간 초과도 같은 화면을 띄운다 (PRD §6). */
function renderFeedback(choiceIndex, correct, timedOut) {
  var question = round.questions[round.index];
  var buttons = document.getElementById("choice-list").children;

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }
  markChoice(buttons[question.answer], "is-correct", "정답");
  if (!correct && choiceIndex !== null && choiceIndex !== undefined) {
    markChoice(buttons[choiceIndex], "is-wrong", "오답");
  }
  renderStatusScore();

  var verdict = document.getElementById("feedback-verdict");
  if (correct) {
    verdict.textContent = "정답";
  } else if (timedOut) {
    verdict.textContent = "시간 초과";
  } else {
    verdict.textContent = "오답";
  }
  verdict.className = "verdict " + (correct ? "is-correct" : "is-wrong");

  document.getElementById("feedback-explanation").textContent = question.explanation;

  var source = document.getElementById("feedback-source");
  source.textContent = question.source.name;
  source.href = question.source.url;

  document.getElementById("feedback").classList.remove("hidden");
}

/* 보기 버튼에 정답·오답 표시를 붙인다. 보기 글자는 그대로 두고 표시만 덧붙인다. */
function markChoice(button, className, label) {
  button.classList.add(className);

  var mark = document.createElement("span");
  mark.className = "mark";
  mark.textContent = label;
  button.appendChild(mark);
}

/* 점수, 문항별 정오 목록, 순위표 기록 여부 안내.
   만점은 그 판의 문항 수에서 가져온다 (PRD §6). */
function renderResult() {
  document.getElementById("result-score").textContent =
    formatScore(totalScore(round)) + " / " + round.questions.length;

  var list = document.getElementById("result-list");
  list.textContent = "";
  for (var i = 0; i < round.results.length; i++) {
    var question = round.questions[i];
    var correct = round.results[i].correct;

    var item = document.createElement("li");

    var text = document.createElement("p");
    text.textContent = question.text;

    var detail = document.createElement("p");
    detail.className = "detail";

    var mark = document.createElement("span");
    mark.className = "mark " + (correct ? "is-correct" : "is-wrong");
    mark.textContent = correct ? "맞힘" : "틀림";
    detail.appendChild(mark);

    if (!correct) {
      detail.appendChild(document.createTextNode(" 정답: " + question.choices[question.answer]));
    }

    item.appendChild(text);
    item.appendChild(detail);
    list.appendChild(item);
  }

  var note = document.getElementById("result-note");
  if (MODES[round.mode].leaderboard) {
    note.textContent = "";
    note.classList.add("hidden");
  } else {
    note.textContent = MODES[round.mode].name + " 모드는 순위표에 기록되지 않음";
    note.classList.remove("hidden");
  }

  showScreen("screen-result");
}

function bindEvents() {
  document.getElementById("screen-start").addEventListener("click", function (event) {
    var button = event.target.closest("[data-category-id]");
    if (!button) {
      return;
    }
    startRound("practice", button.dataset.categoryId);
  });

  document.getElementById("choice-list").addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || button.disabled) {
      return;
    }
    commitAnswer(Number(button.dataset.choiceIndex), false);
  });

  document.getElementById("btn-next").addEventListener("click", function () {
    document.getElementById("btn-next").disabled = true;
    goNext();
  });

  document.getElementById("btn-retry-category").addEventListener("click", function () {
    startRound(round.mode, round.categoryId);
  });

  document.getElementById("btn-to-start").addEventListener("click", function () {
    showScreen("screen-start");
  });
}

/* ====================================================================
   6. 초기화
   ==================================================================== */

bindEvents();
showScreen("screen-start");
