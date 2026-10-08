/* 상식 퀴즈 — 모드 서술자, 순수 함수, 엔진, DOM 처리.
   questions.js 가 먼저 로드되어 QUIZ_DATA 가 있다고 전제한다.
   구역 순서를 섞지 않는다. */

/* ====================================================================
   1. 모드 서술자
   엔진은 모드 이름을 알지 못한다. 아래 스위치만 읽는다.
   ==================================================================== */

var MODES = {
  practice: { name: "연습",   timeLimit: null, hint: false, hintScore: null, leaderboard: false, retryWrong: true  },
  speed:    { name: "스피드", timeLimit: 15,   hint: false, hintScore: null, leaderboard: true,  retryWrong: false },
  hint:     { name: "힌트",   timeLimit: null, hint: true,  hintScore: 0.5,  leaderboard: true,  retryWrong: false }
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

/* 문항 → 지울 보기 인덱스 2개. 정답은 절대 포함하지 않는다. */
function pickHintChoices(question) {
  var wrong = [];
  for (var i = 0; i < question.choices.length; i++) {
    if (i !== question.answer) {
      wrong.push(i);
    }
  }
  return shuffle(wrong).slice(0, 2);
}

/* ── 순위표 영속성 (PRD §4) ─────────────────────────────────────── */

var STORAGE_KEY = "quiz.v1";
var SCORE_LIMIT = 5;
var canPersist = true;

function scoreKey(mode, categoryId) {
  return mode + "|" + categoryId;
}

/* score 내림차순, 동점이면 at 오름차순(먼저 세운 기록이 위), 상위 5건만. */
function rankScores(entries) {
  var sorted = entries.slice().sort(function (a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.at < b.at) {
      return -1;
    }
    if (a.at > b.at) {
      return 1;
    }
    return 0;
  });
  return sorted.slice(0, SCORE_LIMIT);
}

/* 읽기 예외·파싱 실패·version 불일치는 조용히 버리고 빈 순위표를 돌려준다. */
function loadScores() {
  var empty = { version: 1, scores: {} };
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return empty;
    }
    var data = JSON.parse(raw);
    if (!data || data.version !== 1 || !data.scores) {
      return empty;
    }
    return data;
  } catch (error) {
    return empty;
  }
}

/* 쓰기 성공 여부를 돌려준다. 예외를 밖으로 던지지 않는다 — 저장이 안 돼도
   퀴즈는 정상 동작해야 한다 (PRD §4). */
function saveScore(key, entry) {
  var data = loadScores();

  if (!data.scores[key]) {
    data.scores[key] = [];
  }
  data.scores[key].push(entry);
  data.scores[key] = rankScores(data.scores[key]);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    canPersist = false;
    return false;
  }
}

/* 앞뒤 공백을 떼고 12자로 자른다. 비면 익명. */
function normalizeName(raw) {
  var name = String(raw === null || raw === undefined ? "" : raw).trim().slice(0, 12);
  return name === "" ? "익명" : name;
}

/* KST 오프셋을 포함한 ISO 문자열. 예: 2026-10-08T14:22:10+09:00 */
function nowKst() {
  var now = new Date();
  var kst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000);

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  return kst.getFullYear() + "-" + pad(kst.getMonth() + 1) + "-" + pad(kst.getDate())
    + "T" + pad(kst.getHours()) + ":" + pad(kst.getMinutes()) + ":" + pad(kst.getSeconds())
    + "+09:00";
}

/* 라운드 → 틀린 문항의 원본 배열 (복습 라운드의 입력). */
function collectWrong(playedRound) {
  var questions = getCategory(playedRound.categoryId).questions;
  var wrong = [];

  for (var i = 0; i < playedRound.results.length; i++) {
    if (playedRound.results[i].correct) {
      continue;
    }
    for (var q = 0; q < questions.length; q++) {
      if (questions[q].id === playedRound.results[i].questionId) {
        wrong.push(questions[q]);
      }
    }
  }
  return wrong;
}

/* 문항 데이터가 3장의 작성 규칙을 지키는지 검사한다.
   위반 내용을 문자열 배열로 돌려준다. 빈 배열이면 통과다. */
function validateQuestions(data) {
  var problems = [];
  var seenIds = {};
  var total = 0;

  if (!data || !data.categories) {
    return ["QUIZ_DATA 에 categories 가 없다"];
  }
  if (data.categories.length !== 4) {
    problems.push("카테고리가 4개가 아니다: " + data.categories.length + "개");
  }

  for (var c = 0; c < data.categories.length; c++) {
    var category = data.categories[c];
    var questions = category.questions || [];
    total += questions.length;

    if (questions.length !== 10) {
      problems.push(category.id + " 의 문항이 10개가 아니다: " + questions.length + "개");
    }

    for (var q = 0; q < questions.length; q++) {
      var question = questions[q];
      var label = category.id + "/" + (question.id || "(id 없음)");

      if (!question.id) {
        problems.push(label + " 에 id 가 없다");
      } else if (seenIds[question.id]) {
        problems.push("id 가 중복된다: " + question.id);
      } else {
        seenIds[question.id] = true;
      }

      if (!question.text) {
        problems.push(label + " 에 text 가 없다");
      }
      if (!question.explanation) {
        problems.push(label + " 에 explanation 이 없다");
      }

      if (!question.choices || question.choices.length !== 4) {
        problems.push(label + " 의 보기가 4개가 아니다");
      } else {
        for (var a = 0; a < question.choices.length; a++) {
          for (var b = a + 1; b < question.choices.length; b++) {
            if (question.choices[a] === question.choices[b]) {
              problems.push(label + " 의 보기가 서로 같다: " + question.choices[a]);
            }
          }
        }
      }

      if (typeof question.answer !== "number" || question.answer < 0 || question.answer > 3) {
        problems.push(label + " 의 answer 가 0~3 이 아니다: " + question.answer);
      }

      if (!question.source || !question.source.name) {
        problems.push(label + " 에 source.name 이 없다");
      }
      if (!question.source || !question.source.url || question.source.url.indexOf("http") !== 0) {
        problems.push(label + " 의 source.url 이 http 로 시작하지 않는다");
      }
      if (!question.verifiedAt) {
        problems.push(label + " 의 verifiedAt 이 비어 있다");
      }
    }
  }

  if (total !== 40) {
    problems.push("전체 문항이 40개가 아니다: " + total + "개");
  }

  return problems;
}

/* ====================================================================
   3. 라운드 엔진
   ==================================================================== */

var round = null;
var selectedMode = "practice";
var timerId = null;
var deadline = 0;

function startRound(mode, categoryId) {
  stopTimer();
  round = buildRound(mode, categoryId, getCategory(categoryId).questions);
  showScreen("screen-quiz");
  renderQuestion();
}

/* 틀린 문항만 모아 다시 푼다. 점수는 처음 판의 결과로 고정된다 (PRD §6). */
function startReviewRound() {
  var firstScore = round.isReview ? round.firstScore : totalScore(round);
  var wrong = collectWrong(round);

  stopTimer();
  round = buildRound(round.mode, round.categoryId, wrong);
  round.isReview = true;
  round.firstScore = firstScore;

  showScreen("screen-quiz");
  renderQuestion();
}

/* 남은 시간은 틱을 세지 않고 Date.now() 기준으로 계산한다 (PRD §7). */
function startTimer() {
  stopTimer();

  var limit = MODES[round.mode].timeLimit;
  if (limit === null) {
    renderTimerDisplay(null, 0);
    return;
  }

  deadline = Date.now() + limit * 1000;
  tickTimer();
  timerId = setInterval(tickTimer, 100);
}

function tickTimer() {
  var left = deadline - Date.now();
  var limit = MODES[round.mode].timeLimit;

  renderTimerDisplay(Math.max(0, Math.ceil(left / 1000)), Math.max(0, left) / (limit * 1000));

  if (left <= 0) {
    stopTimer();
    commitAnswer(null, true);
  }
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

/* 문항 하나를 확정한다. choiceIndex 는 숫자 또는 null(시간 초과).
   먼저 확정된 쪽만 반영한다 (PRD §7). */
function commitAnswer(choiceIndex, timedOut) {
  if (round.answered) {
    return;
  }
  round.answered = true;
  stopTimer();

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
    stopTimer();
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

/* 시작 화면: 고른 모드와 순위표 기록 여부를 알린다. */
function renderStart() {
  var mode = MODES[selectedMode];
  var note = document.getElementById("start-note");

  if (mode.leaderboard) {
    note.textContent = "";
    note.classList.add("hidden");
  } else {
    note.textContent = mode.name + " 모드 · 순위표에 기록되지 않음";
    note.classList.remove("hidden");
  }
}

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

  var hintButton = document.getElementById("btn-hint");
  if (MODES[round.mode].hint) {
    hintButton.classList.remove("hidden");
    hintButton.disabled = false;
  } else {
    hintButton.classList.add("hidden");
  }

  startTimer();
}

/* 남은 초 숫자와 줄어드는 가로 막대. left 가 null 이면 타이머를 숨긴다. */
function renderTimerDisplay(left, ratio) {
  var label = document.getElementById("status-timer");
  var bar = document.getElementById("timer-bar");

  if (left === null) {
    label.classList.add("hidden");
    bar.classList.add("hidden");
    return;
  }

  label.textContent = left + "초";
  label.classList.remove("hidden");
  if (left <= 5) {
    label.classList.add("urgent");
  } else {
    label.classList.remove("urgent");
  }

  bar.classList.remove("hidden");
  document.getElementById("timer-fill").style.width = (ratio * 100) + "%";
}

/* 오답 보기 2개를 비활성 + 흐림 + 취소선으로 남긴다. DOM 에서 없애지 않는다. */
function applyHint() {
  if (round.answered || round.usedHint) {
    return;
  }

  var picks = pickHintChoices(round.questions[round.index]);
  var buttons = document.getElementById("choice-list").children;

  for (var i = 0; i < picks.length; i++) {
    buttons[picks[i]].disabled = true;
    buttons[picks[i]].classList.add("removed");
  }

  round.usedHint = true;
  document.getElementById("btn-hint").disabled = true;
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
    verdict.textContent = "정답!";
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
  stopTimer();

  /* 복습 라운드는 처음 판의 점수를 그대로 유지하고 남은 오답만 갱신한다. */
  var shownScore = round.isReview ? round.firstScore : totalScore(round);
  var shownTotal = round.isReview
    ? getCategory(round.categoryId).questions.length
    : round.questions.length;

  document.getElementById("result-score").textContent =
    formatScore(shownScore) + " / " + shownTotal;

  var remaining = document.getElementById("result-remaining");
  var wrongCount = collectWrong(round).length;
  if (round.isReview) {
    remaining.textContent = "남은 오답 " + wrongCount + "문항";
    remaining.classList.remove("hidden");
  } else {
    remaining.textContent = "";
    remaining.classList.add("hidden");
  }

  /* 순위표에 기록하는 모드의 첫 판에서만 이름 입력과 저장을 보인다. */
  var saveForm = document.getElementById("save-form");
  if (MODES[round.mode].leaderboard && !round.isReview) {
    document.getElementById("save-name").value = "";
    document.getElementById("btn-save").disabled = false;
    document.getElementById("save-result").textContent = "";
    document.getElementById("save-result").classList.add("hidden");
    saveForm.classList.remove("hidden");
  } else {
    saveForm.classList.add("hidden");
  }

  var retryWrong = document.getElementById("btn-retry-wrong");
  if (MODES[round.mode].retryWrong && wrongCount > 0) {
    retryWrong.classList.remove("hidden");
  } else {
    retryWrong.classList.add("hidden");
  }

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
    note.textContent = "순위표에 기록되지 않음";
    note.classList.remove("hidden");
  }

  showScreen("screen-result");
}

/* 순위표: leaderboard 가 참인 모드 × 카테고리로 표를 그린다.
   모드 목록을 하드코딩하지 않고 MODES 에서 뽑는다. */
function renderBoard() {
  var data = loadScores();
  var container = document.getElementById("board-tables");
  container.textContent = "";

  for (var mode in MODES) {
    if (!MODES[mode].leaderboard) {
      continue;
    }
    for (var c = 0; c < QUIZ_DATA.categories.length; c++) {
      var category = QUIZ_DATA.categories[c];
      container.appendChild(
        buildBoardTable(mode, category, data.scores[scoreKey(mode, category.id)] || [])
      );
    }
  }

  var warning = document.getElementById("board-warning");
  if (canPersist) {
    warning.classList.add("hidden");
  } else {
    warning.classList.remove("hidden");
  }
}

function buildBoardTable(mode, category, entries) {
  var box = document.createElement("section");
  box.className = "board";

  var title = document.createElement("h3");
  title.textContent = MODES[mode].name + " · " + category.name;
  box.appendChild(title);

  var ranked = rankScores(entries);
  if (ranked.length === 0) {
    var empty = document.createElement("p");
    empty.className = "board-empty";
    empty.textContent = "기록 없음";
    box.appendChild(empty);
    return box;
  }

  var table = document.createElement("table");
  var headRow = document.createElement("tr");
  var headings = ["순위", "이름", "점수", "날짜"];
  for (var h = 0; h < headings.length; h++) {
    var th = document.createElement("th");
    th.textContent = headings[h];
    headRow.appendChild(th);
  }
  table.appendChild(headRow);

  for (var i = 0; i < ranked.length; i++) {
    var row = document.createElement("tr");
    /* 이름은 textContent 로만 넣는다 — 입력한 문자가 HTML 로 해석되지 않게 한다. */
    var cells = [
      String(i + 1),
      ranked[i].name,
      formatScore(ranked[i].score),
      ranked[i].at.slice(0, 10) + " " + ranked[i].at.slice(11, 16)
    ];
    for (var k = 0; k < cells.length; k++) {
      var td = document.createElement("td");
      td.textContent = cells[k];
      row.appendChild(td);
    }
    table.appendChild(row);
  }

  box.appendChild(table);
  return box;
}

function showBoard() {
  stopTimer();
  renderBoard();
  showScreen("screen-board");
}

function bindEvents() {
  document.getElementById("screen-mode").addEventListener("click", function (event) {
    var button = event.target.closest("[data-mode]");
    if (!button) {
      return;
    }
    selectedMode = button.dataset.mode;
    renderStart();
    showScreen("screen-start");
  });

  document.getElementById("btn-start-back").addEventListener("click", function () {
    showScreen("screen-mode");
  });

  document.getElementById("btn-board").addEventListener("click", showBoard);
  document.getElementById("btn-board-result").addEventListener("click", showBoard);

  document.getElementById("btn-board-back").addEventListener("click", function () {
    showScreen("screen-mode");
  });

  document.getElementById("btn-hint").addEventListener("click", applyHint);

  document.getElementById("btn-retry-wrong").addEventListener("click", startReviewRound);

  /* 저장은 한 판에 한 번만 된다 (PRD §6). */
  document.getElementById("save-form").addEventListener("submit", function (event) {
    event.preventDefault();

    var button = document.getElementById("btn-save");
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    var name = normalizeName(document.getElementById("save-name").value);
    var saved = saveScore(scoreKey(round.mode, round.categoryId), {
      name: name,
      score: totalScore(round),
      at: nowKst()
    });

    var message = document.getElementById("save-result");
    message.textContent = saved
      ? name + " 으로 저장했습니다"
      : "이 브라우저에서는 기록을 저장할 수 없습니다";
    message.classList.remove("hidden");
  });

  document.getElementById("screen-start").addEventListener("click", function (event) {
    var button = event.target.closest("[data-category-id]");
    if (!button) {
      return;
    }
    startRound(selectedMode, button.dataset.categoryId);
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
    stopTimer();
    showScreen("screen-mode");
  });
}

/* ====================================================================
   6. 초기화
   ==================================================================== */

/* 주소 끝에 ?test 를 붙이면 콘솔에 자체 점검 결과를 찍는다.
   순수 함수와 문항 데이터만 검사하므로 화면을 건드리지 않는다. */
function selfTest() {
  var passed = 0;
  var failed = 0;

  function check(name, run) {
    var result;
    try {
      result = run();
    } catch (error) {
      result = error.message;
    }
    if (result === true) {
      passed += 1;
      console.log("통과: " + name);
    } else {
      failed += 1;
      console.error("실패: " + name + " — " + result);
    }
  }

  var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var sorted = function (list) { return list.slice().sort(function (a, b) { return a - b; }).join(","); };
  var sample = QUIZ_DATA.categories[0].questions[0];
  var category = QUIZ_DATA.categories[0];

  check("shuffle 은 원본 배열을 바꾸지 않는다", function () {
    var before = numbers.join(",");
    shuffle(numbers);
    return numbers.join(",") === before || "원본 배열이 바뀌었다";
  });

  check("shuffle 은 원소를 모두 보존한다", function () {
    return sorted(shuffle(numbers)) === sorted(numbers) || "원소가 달라졌다";
  });

  check("shuffle 은 순서를 실제로 섞는다", function () {
    var seen = {};
    var kinds = 0;
    for (var i = 0; i < 30; i++) {
      var key = shuffle(numbers).join(",");
      if (!seen[key]) {
        seen[key] = true;
        kinds += 1;
      }
    }
    return kinds > 1 || "30번 돌려도 순서가 하나뿐이다";
  });

  check("shuffleChoices 는 정답 문자열을 유지한다", function () {
    var expected = sample.choices[sample.answer];
    for (var i = 0; i < 20; i++) {
      var copy = shuffleChoices(sample);
      if (copy.choices[copy.answer] !== expected) {
        return "정답이 " + copy.choices[copy.answer] + " 로 바뀌었다";
      }
    }
    return true;
  });

  check("shuffleChoices 는 원본 문항을 바꾸지 않는다", function () {
    var beforeChoices = sample.choices.join(",");
    var beforeAnswer = sample.answer;
    shuffleChoices(sample);
    return (sample.choices.join(",") === beforeChoices && sample.answer === beforeAnswer)
      || "원본 문항이 바뀌었다";
  });

  check("buildRound 는 카테고리의 문항을 모두 담는다", function () {
    var built = buildRound("practice", category.id, category.questions);
    return built.questions.length === category.questions.length
      || "문항 수가 " + built.questions.length + " 개다";
  });

  check("buildRound 의 초기 상태가 비어 있다", function () {
    var built = buildRound("practice", category.id, category.questions);
    return (built.index === 0 && built.results.length === 0 && built.answered === false
      && built.usedHint === false && built.isReview === false && built.firstScore === null)
      || "초기 상태가 다르다";
  });

  check("buildRound 사본을 고쳐도 QUIZ_DATA 가 오염되지 않는다", function () {
    var built = buildRound("practice", category.id, category.questions);
    var before = category.questions[0].choices.join(",");
    built.questions[0].choices[0] = "오염";
    built.questions[0].answer = 99;
    return category.questions[0].choices.join(",") === before || "원본 보기가 바뀌었다";
  });

  check("scoreAnswer 는 연습 모드에서 맞히면 1점을 준다", function () {
    var score = scoreAnswer("practice", { correct: true, usedHint: false, timedOut: false });
    return score === 1 || "점수가 " + score + " 다";
  });

  check("scoreAnswer 는 틀리면 0점을 준다", function () {
    var score = scoreAnswer("practice", { correct: false, usedHint: false, timedOut: false });
    return score === 0 || "점수가 " + score + " 다";
  });

  check("scoreAnswer 는 시간 초과를 0점으로 매긴다", function () {
    var score = scoreAnswer("practice", { correct: true, usedHint: false, timedOut: true });
    return score === 0 || "점수가 " + score + " 다";
  });

  check("validateQuestions 로 문항 40개가 작성 규칙을 지킨다", function () {
    var problems = validateQuestions(QUIZ_DATA);
    return problems.length === 0 || problems.join(" / ");
  });

  console.log("자체 점검 결과: 통과 " + passed + ", 실패 " + failed);
}

bindEvents();
renderStart();
showScreen("screen-mode");

if (location.search.indexOf("test") !== -1) {
  selfTest();
}
