const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameWidth = 1000;
const gameHeight = 500;

canvas.width = gameWidth;
canvas.height = gameHeight;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let player1Y = gameHeight / 2 - paddleHeight / 2;
let player2Y = gameHeight / 2 - paddleHeight / 2;

let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let rallyCount = 0;
let player1Score = 0;
let player2Score = 0;

let isGameRunning = false;
let isVsPC = true;

const levelSelect = document.getElementById("levelSelect");
const opponentLabel = document.getElementById("opponentLabel");
let difficultyLevel = "amateur";

const maxTrackingOffset = {
  amateur: 50,
  intermediate: 25,
  master: 0
};

const aiSpeedMultiplier = {
  amateur: 0.7,
  intermediate: 1,
  master: 2
};

levelSelect.addEventListener("change", () => {
  difficultyLevel = levelSelect.value;
  updateOpponentLabel();
});

function updateOpponentLabel() {
  if (difficultyLevel === "amateur") {
    opponentLabel.textContent = "Amateur Computer";
  } else if (difficultyLevel === "intermediate") {
    opponentLabel.textContent = "Intermediate Computer";
  } else {
    opponentLabel.textContent = "Master Computer";
  }
}

let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") upPressed = true;
  if (e.key === "ArrowDown") downPressed = true;
  if (e.key === "w") wPressed = true;
  if (e.key === "s") sPressed = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") upPressed = false;
  if (e.key === "ArrowDown") downPressed = false;
  if (e.key === "w") wPressed = false;
  if (e.key === "s") sPressed = false;
});

function movePaddles() {
  if (upPressed && player1Y > 0) player1Y -= 8;
  if (downPressed && player1Y < gameHeight - paddleHeight) player1Y += 8;

  if (!isVsPC) {
    if (wPressed && player2Y > 0) player2Y -= 8;
    if (sPressed && player2Y < gameHeight - paddleHeight) player2Y += 8;
  }
}

function moveComputerPaddle() {
  let targetY;
  let currentOffset = rallyCount < 10 ? maxTrackingOffset[difficultyLevel] : Math.max(0, maxTrackingOffset[difficultyLevel] - (rallyCount - 10) * 2);

  if (difficultyLevel === "master") {
    const aiSpeed = 10;

    if (ballY > player2Y + paddleHeight / 2 && player2Y < gameHeight - paddleHeight) {
      player2Y += aiSpeed;
    } else if (ballY < player2Y + paddleHeight / 2 && player2Y > 0) {
      player2Y -= aiSpeed;
    }
  } else {

    targetY = ballY - paddleHeight / 2 + Math.random() * currentOffset - currentOffset / 2;

    if (player2Y + paddleHeight / 2 < targetY && player2Y < gameHeight - paddleHeight) {
      player2Y += 6 * aiSpeedMultiplier[difficultyLevel];
    } else if (player2Y + paddleHeight / 2 > targetY && player2Y > 0) {
      player2Y -= 6 * aiSpeedMultiplier[difficultyLevel];
    }
  }
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY >= gameHeight - ballSize) ballSpeedY *= -1;

  if (ballX <= paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
    ballSpeedX *= -1.1;
    ballSpeedY *= 1.1;
    rallyCount++;
  }

  if (ballX >= gameWidth - paddleWidth - ballSize && ballY > player2Y && ballY < player2Y + paddleHeight) {
    ballSpeedX *= -1.1;
    ballSpeedY *= 1.1;
    rallyCount++;
  }

  if (ballX < 0) {
    player2Score++;
    resetBall();
  }

  if (ballX > gameWidth) {
    player1Score++;
    resetBall();
  }
}

function resetBall() {
  ballX = gameWidth / 2;
  ballY = gameHeight / 2;
  ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() < 0.5 ? 1 : -1);
  rallyCount = 0;
}

function draw() {
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  ctx.fillStyle = "white";
  ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
  ctx.fillRect(gameWidth - paddleWidth, player2Y, paddleWidth, paddleHeight);

  ctx.beginPath();
  ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.font = "20px Arial";
  ctx.fillText(`Human: ${player1Score}`, 20, 30);
  ctx.fillText(`Computer: ${player2Score}`, gameWidth - 130, 30);
}

function gameLoop() {
  if (isGameRunning) {
    movePaddles();

    if (isVsPC) moveComputerPaddle();

    moveBall();
    draw();
  }

  if (player1Score === 10 || player2Score === 10) {

    if (isGameRunning) {
      isGameRunning = false;
      alert(`Game Over! ${player1Score === 10 ? "Human" : opponentLabel.textContent} wins!`);
      resetGame();
    }
  }

  requestAnimationFrame(gameLoop);
}

document.getElementById("startGame").addEventListener("click", () => {
  isVsPC = true;
  levelSelect.style.display = "inline-block";
  player1Score = 0;
  player2Score = 0;
  resetBall();
  isGameRunning = true;
  document.getElementById("startGame").style.display = "none";
  document.getElementById("stopGame").style.display = "inline-block";
  gameLoop();
});

document.getElementById("stopGame").addEventListener("click", () => {
  location.reload();
});

function resetGame() {
  player1Score = 0;
  player2Score = 0;
  resetBall();
  ballSpeedX = 5 * (Math.random() < 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() < 0.5 ? 1 : -1);
  rallyCount = 0;
  isGameRunning = false;
  document.getElementById("startGame").style.display = "inline-block";
  document.getElementById("stopGame").style.display = "none";
  levelSelect.style.display = "none";
}

resetBall();













