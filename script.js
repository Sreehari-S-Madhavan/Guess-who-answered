let questions = [];
let players = [];
let scores = {};
let playerAvatars = {};
let answers = [];
let currentRound = 1;
const MAX_ROUNDS = 5;
let answerAuthors = [];
let currentAnswer = null;
let votes = {};

const emojiList = ['🐱','🐶','🦊','🐵','🐯','🐸','🐼','🐧','🦁','🐻','🐨'];

async function loadQuestions() {
  const response = await fetch("questions.json");
  questions = await response.json();
}

function updateScoreboard() {
  const scoreList = document.getElementById("score-list");
  scoreList.innerHTML = "";
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([name, score]) => {
    const li = document.createElement("li");
    li.textContent = `${playerAvatars[name]} ${name}: ${score} pts`;
    scoreList.appendChild(li);
  });
  document.getElementById("scoreboard").classList.remove("hidden");
}

function showFinalWinner() {
  const maxScore = Math.max(...Object.values(scores));
  const winners = Object.keys(scores).filter(name => scores[name] === maxScore);
  document.getElementById("final-winner").classList.remove("hidden");
  document.getElementById("winner-name").textContent = `🏅 ${winners.map(w => `${playerAvatars[w]} ${w}`).join(', ')} won with ${maxScore} points!`;
}

function loadNextQuestion() {
  if (currentRound > MAX_ROUNDS) {
    document.getElementById("guess-section").classList.add("hidden");
    document.getElementById("answer-form").classList.add("hidden");
    showFinalWinner();
    return;
  }

  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  document.getElementById("question").textContent = randomQ.question;
  document.getElementById("round-count").textContent = currentRound;

  answers = [];
  answerAuthors = [];
  currentAnswer = null;
  votes = {};

  document.getElementById("answer-form").classList.remove("hidden");
  document.getElementById("guess-section").classList.add("hidden");
  document.getElementById("next-round").classList.add("hidden");
  document.getElementById("result").textContent = "";
  document.getElementById("answer").value = "";
  document.getElementById("current-player-turn").textContent = `All players answer.`;
  document.getElementById("vote-options").innerHTML = "";
  document.getElementById("submit-vote").classList.add("hidden");
}

function processVoting() {
  // Calculate votes
  const voteCounts = {};
  Object.values(votes).forEach(selected => {
    selected.forEach(name => {
      voteCounts[name] = (voteCounts[name] || 0) + 1;
    });
  });

  const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
  const majorityThreshold = Math.floor(totalVotes / 2) + 1;
  let correctVotes = 0;

  for (const [voter, selected] of Object.entries(votes)) {
    selected.forEach(name => {
      if (answerAuthors.includes(name)) {
        scores[voter] += 2;
        correctVotes++;
      }
    });
  }

  const correctVoteCount = answerAuthors.reduce((sum, name) => sum + (voteCounts[name] || 0), 0);
  const authorGetsPoints = correctVoteCount < majorityThreshold;
  answerAuthors.forEach(name => {
    if (authorGetsPoints) scores[name] += 3;
  });

  const resultText = `✅ ${correctVotes} correct votes. ${authorGetsPoints ? 'Authors get +3!' : 'Authors got majority, no points!'}`;
  document.getElementById("result").textContent = resultText;
  document.getElementById("next-round").classList.remove("hidden");
  updateScoreboard();
}

function setupVoting() {
  const others = players.filter(p => !answerAuthors.includes(p));
  const voteBox = document.getElementById("vote-options");
  others.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = `${playerAvatars[name]} ${name}`;
    btn.onclick = () => {
      btn.classList.toggle("selected");
    };
    voteBox.appendChild(btn);
  });
  document.getElementById("submit-vote").classList.remove("hidden");
}

function startVotingPhase() {
  document.getElementById("answer-form").classList.add("hidden");
  document.getElementById("guess-section").classList.remove("hidden");

  const allAnswers = answers.map(a => a.answer);
  const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
  document.getElementById("revealed-answer").textContent = randomAnswer;

  // Determine all authors of that answer
  answerAuthors = answers.filter(a => a.answer === randomAnswer).map(a => a.name);
  setupVoting();
}

function submitAnswer(name, text) {
  answers.push({ name, answer: text });
  if (answers.length === players.length) {
    startVotingPhase();
  }
}

// Event listeners

document.getElementById("join-btn").addEventListener("click", () => {
  const name = document.getElementById("lobby-name").value.trim();
  if (!name || players.includes(name)) return;
  players.push(name);
  scores[name] = 0;
  playerAvatars[name] = emojiList[Math.floor(Math.random() * emojiList.length)];
  const li = document.createElement("li");
  li.textContent = `${playerAvatars[name]} ${name}`;
  document.getElementById("player-names").appendChild(li);
  document.getElementById("lobby-name").value = "";
  if (players.length >= 3) document.getElementById("start-game").classList.remove("hidden");
});

document.getElementById("start-game").addEventListener("click", () => {
  document.getElementById("lobby-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  loadNextQuestion();
});

document.getElementById("answer-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("answer").value.trim();
  if (!text) return;
  const name = players[answers.length];
  submitAnswer(name, text);
  document.getElementById("answer").value = "";
});

document.getElementById("submit-vote").addEventListener("click", () => {
  const currentVoter = players.find(p => !answerAuthors.includes(p) && !(p in votes));
  const selectedButtons = Array.from(document.querySelectorAll("#vote-options .selected"));
  const selectedNames = selectedButtons.map(btn => btn.textContent.split(" ")[1]);
  if (!currentVoter || selectedNames.length === 0) return;
  votes[currentVoter] = selectedNames;
  document.getElementById("vote-options").innerHTML = "";
  document.getElementById("submit-vote").classList.add("hidden");
  if (Object.keys(votes).length === players.length - answerAuthors.length) {
    processVoting();
  } else {
    setupVoting();
  }
});

document.getElementById("next-round").addEventListener("click", () => {
  currentRound++;
  loadNextQuestion();
});

loadQuestions();
