let questions = [];
let currentQuestion = {};
let players = [];
let scores = {};
let answers = [];
let currentRoundAnswer = null;
let currentAnsweringPlayerIndex = 0;
let round = 1;
const MAX_ROUNDS = 5;

// Random emoji avatar for each player
const playerAvatars = {};
const emojiList = ['🐱','🐶','🦊','🐵','🐯','🐸','🐼','🐧','🦁','🐻','🐨'];

async function loadQuestions() {
  const response = await fetch("questions.json");
  questions = await response.json();
}

// Join the lobby
document.getElementById("join-btn").addEventListener("click", () => {
  const nameInput = document.getElementById("lobby-name");
  const name = nameInput.value.trim();
  if (!name || players.includes(name)) return;

  players.push(name);
  scores[name] = 0;
  playerAvatars[name] = emojiList[Math.floor(Math.random() * emojiList.length)];

  const li = document.createElement("li");
  li.textContent = `${playerAvatars[name]} ${name}`;
  document.getElementById("player-names").appendChild(li);

  nameInput.value = "";

  if (players.length >= 3) {
    document.getElementById("start-game").classList.remove("hidden");
  }
});

// Start game
document.getElementById("start-game").addEventListener("click", () => {
  document.getElementById("lobby-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  loadNextQuestion();
});

// Load next question
function loadNextQuestion() {
  if (round > MAX_ROUNDS) {
    endGame();
    return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("round-count").textContent = round;

  answers = [];
  currentRoundAnswer = null;
  currentAnsweringPlayerIndex = 0;

  document.getElementById("answer-form").classList.remove("hidden");
  document.getElementById("guess-section").classList.add("hidden");
  document.getElementById("next-round").classList.add("hidden");
  document.getElementById("final-winner").classList.add("hidden");
  updateCurrentPlayerTurn();
  updateScoreboard();
}

function updateCurrentPlayerTurn() {
  const player = players[currentAnsweringPlayerIndex];
  document.getElementById("current-player-turn").textContent = `✏️ ${playerAvatars[player]} ${player}, it’s your turn to answer.`;
  document.getElementById("answer").placeholder = `Your answer, ${player}`;
}

document.getElementById("answer-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const answerText = document.getElementById("answer").value.trim();
  if (!answerText) return;

  const playerName = players[currentAnsweringPlayerIndex];
  answers.push({ name: playerName, answer: answerText });

  currentAnsweringPlayerIndex++;
  document.getElementById("answer-form").reset();

  if (currentAnsweringPlayerIndex < players.length) {
    updateCurrentPlayerTurn();
  } else {
    startGuessingPhase();
  }
});

function startGuessingPhase() {
  document.getElementById("answer-form").classList.add("hidden");
  document.getElementById("guess-section").classList.remove("hidden");

  const randomIndex = Math.floor(Math.random() * answers.length);
  currentRoundAnswer = answers[randomIndex];
  document.getElementById("revealed-answer").textContent = currentRoundAnswer.answer;

  const shuffled = [...players].sort(() => 0.5 - Math.random());
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  shuffled.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = `${playerAvatars[name]} ${name}`;
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
    result.textContent = `❌ Wrong! It was ${playerAvatars[correctName]} ${correctName}.`;
    result.style.color = "red";
  }

  document.querySelectorAll(".guess-btn").forEach(btn => btn.disabled = true);
  document.getElementById("next-round").classList.remove("hidden");
  updateScoreboard();
}

document.getElementById("next-round").addEventListener("click", () => {
  round++;
  document.getElementById("result").textContent = "";
  loadNextQuestion();
});

function updateScoreboard() {
  const list = document.getElementById("score-list");
  list.innerHTML = "";

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score]) => {
    const li = document.createElement("li");
    li.textContent = `${playerAvatars[name]} ${name}: ${score} pts`;
    list.appendChild(li);
  });

  document.getElementById("scoreboard").classList.remove("hidden");
}

function endGame() {
  document.getElementById("guess-section").classList.add("hidden");
  document.getElementById("answer-form").classList.add("hidden");
  document.getElementById("next-round").classList.add("hidden");

  const maxScore = Math.max(...Object.values(scores));
  const winners = Object.keys(scores).filter(name => scores[name] === maxScore);

  document.getElementById("final-winner").classList.remove("hidden");
  document.getElementById("winner-name").textContent = `🏅 ${winners.map(w => `${playerAvatars[w]} ${w}`).join(', ')} won the game with ${maxScore} points!`;
}

loadQuestions();
