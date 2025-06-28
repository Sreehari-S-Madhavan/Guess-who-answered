let questions = [];
let currentQuestion = {};
let players = [];
let scores = {};
let answers = [];
let currentRoundAnswer = null;

// Load questions from JSON
async function loadQuestions() {
  const response = await fetch("questions.json");
  questions = await response.json();
}

// Player joins lobby
document.getElementById("join-btn").addEventListener("click", () => {
  const nameInput = document.getElementById("lobby-name");
  const name = nameInput.value.trim();
  if (!name || players.includes(name)) return;

  players.push(name);
  scores[name] = 0;

  const li = document.createElement("li");
  li.textContent = name;
  document.getElementById("player-names").appendChild(li);

  nameInput.value = "";

  if (players.length >= 3) {
    document.getElementById("start-game").classList.remove("hidden");
  }
});

// Start the game
document.getElementById("start-game").addEventListener("click", () => {
  document.getElementById("lobby-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  loadNextQuestion();
});

// Load a random question
function loadNextQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  document.getElementById("question").textContent = currentQuestion.question;

  answers = [];
  currentRoundAnswer = null;
  document.getElementById("answer-form").classList.remove("hidden");
  document.getElementById("answer-form").reset();
  document.getElementById("guess-section").classList.add("hidden");
  document.getElementById("next-round").classList.add("hidden");
  document.getElementById("scoreboard").classList.remove("hidden");
  updateScoreboard();
}

// Collect answers from each player
document.getElementById("answer-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const answerText = document.getElementById("answer").value.trim();
  if (!answerText) return;

  // Assign in order
  const answerer = players[answers.length];
  answers.push({ answer: answerText, name: answerer });

  document.getElementById("answer-form").reset();

  if (answers.length >= players.length) {
    startGuessingPhase();
  } else {
    document.getElementById("answer").placeholder = `Waiting for ${players[answers.length]} to answer...`;
  }
});

// Show 1 random answer and guess who
function startGuessingPhase() {
  document.getElementById("answer-form").classList.add("hidden");
  document.getElementById("guess-section").classList.remove("hidden");

  const randomIndex = Math.floor(Math.random() * answers.length);
  currentRoundAnswer = answers[randomIndex];
  document.getElementById("revealed-answer").textContent = currentRoundAnswer.answer;

  const shuffledNames = players.sort(() => 0.5 - Math.random());
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  shuffledNames.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "guess-btn";
    btn.onclick = () => checkAnswer(name, currentRoundAnswer.name);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selectedName, correctName) {
  const result = document.getElementById("result");

  if (selectedName === correctName) {
    result.textContent = "✅ Correct! 🎉";
    result.style.color = "limegreen";
    scores[selectedName]++;
  } else {
    result.textContent = `❌ Wrong! It was ${correctName}.`;
    result.style.color = "red";
  }

  document.querySelectorAll(".guess-btn").forEach(btn => btn.disabled = true);
  document.getElementById("next-round").classList.remove("hidden");
  updateScoreboard();
}

document.getElementById("next-round").addEventListener("click", () => {
  document.getElementById("result").textContent = "";
  loadNextQuestion();
});

function updateScoreboard() {
  const list = document.getElementById("score-list");
  list.innerHTML = "";

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score]) => {
    const li = document.createElement("li");
    li.textContent = `${name}: ${score} pts`;
    list.appendChild(li);
  });
}

loadQuestions();
