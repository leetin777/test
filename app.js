const STORAGE_KEY = "englishAppProgress";

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return { known: {}, unknown: {}, quizCorrect: 0, quizTotal: 0 };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

let progress = loadProgress();

// ---------- Tabs ----------
const tabBtns = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "progress") renderProgress();
    if (btn.dataset.tab === "quiz") newQuizQuestion();
  });
});

// ---------- Flashcards ----------
let cardIndex = 0;
const flashcard = document.getElementById("flashcard");
const cardFront = document.getElementById("cardFront");
const cardBack = document.getElementById("cardBack");
const cardCounter = document.getElementById("cardCounter");

function renderCard() {
  const word = WORDS[cardIndex];
  cardFront.textContent = word.en;
  cardBack.textContent = word.ko;
  flashcard.classList.remove("flipped");
  cardCounter.textContent = `${cardIndex + 1} / ${WORDS.length}`;
}

flashcard.addEventListener("click", () => flashcard.classList.toggle("flipped"));
document.getElementById("flipBtn").addEventListener("click", () => flashcard.classList.toggle("flipped"));

document.getElementById("prevBtn").addEventListener("click", () => {
  cardIndex = (cardIndex - 1 + WORDS.length) % WORDS.length;
  renderCard();
});
document.getElementById("nextBtn").addEventListener("click", () => {
  cardIndex = (cardIndex + 1) % WORDS.length;
  renderCard();
});

document.getElementById("knowBtn").addEventListener("click", () => {
  const w = WORDS[cardIndex].en;
  progress.known[w] = true;
  delete progress.unknown[w];
  saveProgress();
  document.getElementById("nextBtn").click();
});
document.getElementById("dontKnowBtn").addEventListener("click", () => {
  const w = WORDS[cardIndex].en;
  progress.unknown[w] = true;
  delete progress.known[w];
  saveProgress();
  document.getElementById("nextBtn").click();
});

renderCard();

// ---------- Quiz ----------
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const quizNextBtn = document.getElementById("quizNextBtn");
const quizScore = document.getElementById("quizScore");

let currentQuizWord = null;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function newQuizQuestion() {
  quizFeedback.textContent = "";
  quizNextBtn.style.display = "none";
  currentQuizWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  quizQuestion.textContent = `"${currentQuizWord.en}"의 뜻은?`;

  const distractors = shuffle(WORDS.filter((w) => w.en !== currentQuizWord.en)).slice(0, 3);
  const options = shuffle([currentQuizWord, ...distractors]);

  quizOptions.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt.ko;
    btn.addEventListener("click", () => checkAnswer(btn, opt));
    quizOptions.appendChild(btn);
  });
  renderQuizScore();
}

function checkAnswer(btn, opt) {
  const buttons = quizOptions.querySelectorAll("button");
  buttons.forEach((b) => (b.disabled = true));

  progress.quizTotal += 1;
  if (opt.en === currentQuizWord.en) {
    btn.classList.add("correct");
    quizFeedback.textContent = "정답입니다! 🎉";
    progress.quizCorrect += 1;
  } else {
    btn.classList.add("wrong");
    quizFeedback.textContent = `오답! 정답은 "${currentQuizWord.ko}" 입니다.`;
    buttons.forEach((b) => {
      if (b.textContent === currentQuizWord.ko) b.classList.add("correct");
    });
  }
  saveProgress();
  renderQuizScore();
  quizNextBtn.style.display = "block";
}

function renderQuizScore() {
  quizScore.textContent = `점수: ${progress.quizCorrect} / ${progress.quizTotal}`;
}

quizNextBtn.addEventListener("click", newQuizQuestion);

// ---------- Progress ----------
function renderProgress() {
  document.getElementById("knownCount").textContent = Object.keys(progress.known).length;
  document.getElementById("unknownCount").textContent = Object.keys(progress.unknown).length;
  document.getElementById("quizCorrect").textContent = progress.quizCorrect;
  document.getElementById("quizTotal").textContent = progress.quizTotal;
}

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("학습 진도를 초기화하시겠습니까?")) {
    progress = { known: {}, unknown: {}, quizCorrect: 0, quizTotal: 0 };
    saveProgress();
    renderProgress();
    renderQuizScore();
  }
});

renderProgress();
