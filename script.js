const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const lengthEl = document.getElementById('length');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartButton');
const pauseBtn = document.getElementById('pauseButton');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartButton');
const controlButtons = document.querySelectorAll('.controls button');

const gridSize = 18;
const tileCount = canvas.width / gridSize;
const baseSpeedMs = 150;
const minSpeedMs = 75;
const storageKey = 'snake-high-score';

const directionMap = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let snake = [];
let direction = directionMap.right;
let pendingDirection = directionMap.right;
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameOver = false;
let paused = false;
let loopHandle;
let stepSpeed = baseSpeedMs;
const speedMs = 120;
const storageKey = 'snake-high-score';

let snake;
let direction;
let pendingDirection;
let food;
let score;
let highScore;
let gameOver;
let loopHandle;
let touchStart = null;

function loadHighScore() {
  const saved = Number(localStorage.getItem(storageKey));
  highScore = Number.isFinite(saved) && saved >= 0 ? saved : 0;
  highScoreEl.textContent = String(highScore);
}

function applySpeed() {
  if (loopHandle) {
    clearInterval(loopHandle);
  }

  loopHandle = setInterval(tick, stepSpeed);
}

function placeFood() {
  const freeTiles = [];

  for (let x = 0; x < tileCount; x += 1) {
    for (let y = 0; y < tileCount; y += 1) {
      const occupied = snake.some((part) => part.x === x && part.y === y);
      if (!occupied) {
        freeTiles.push({ x, y });
      }
    }
  }

  if (freeTiles.length === 0) {
    gameOver = true;
    clearInterval(loopHandle);
    messageEl.textContent = 'Perfect run! You filled the board. Restart to play again.';
    return;
  }

  food = freeTiles[Math.floor(Math.random() * freeTiles.length)];
}

function updateStats() {
  scoreEl.textContent = String(score);
  lengthEl.textContent = String(snake.length);
  highScore = Number.isFinite(saved) ? saved : 0;
  highScoreEl.textContent = String(highScore);
}

function placeFood() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    if (!snake.some((part) => part.x === candidate.x && part.y === candidate.y)) {
      food = candidate;
      return;
    }
  }
}

function resetGame() {
  snake = [
    { x: 5, y: 9 },
    { x: 4, y: 9 },
    { x: 3, y: 9 },
  ];
  direction = directionMap.right;
  pendingDirection = directionMap.right;
  score = 0;
  stepSpeed = baseSpeedMs;
  gameOver = false;
  paused = false;
  touchStart = null;
  pauseBtn.textContent = 'Pause';
  messageEl.textContent = '';
  updateStats();

  placeFood();
  applySpeed();
  direction = { x: 1, y: 0 };
  pendingDirection = { ...direction };
  score = 0;
  gameOver = false;
  messageEl.textContent = '';
  scoreEl.textContent = '0';
  placeFood();

  if (loopHandle) {
    clearInterval(loopHandle);
  }

  loopHandle = setInterval(tick, speedMs);
  draw();
}

function updateDirection(next) {
  if (!next || gameOver || paused) return;

  const activeDirection = pendingDirection;
  const reverse = next.x === -activeDirection.x && next.y === -activeDirection.y;

  if (gameOver) return;

  const reverse = next.x === -direction.x && next.y === -direction.y;
  if (!reverse) {
    pendingDirection = next;
  }
}

function endGame(label) {
  gameOver = true;
  clearInterval(loopHandle);
  messageEl.textContent = label;
function gameEnd() {
  gameOver = true;
  clearInterval(loopHandle);
  messageEl.textContent = 'Game over! Tap restart to play again.';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem(storageKey, String(highScore));
    highScoreEl.textContent = String(highScore);
    messageEl.textContent = `New high score: ${highScore}! Tap restart.`;
  }
}

function increaseDifficulty() {
  const nextSpeed = Math.max(minSpeedMs, baseSpeedMs - score * 4);

  if (nextSpeed !== stepSpeed) {
    stepSpeed = nextSpeed;
    applySpeed();
  }
}

function tick() {
  if (gameOver || paused) return;

function tick() {
  direction = pendingDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  if (hitWall) {
    endGame('Game over! You hit the wall. Tap restart.');
    return;
  }

  const willEat = head.x === food.x && head.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((part) => part.x === head.x && part.y === head.y);

  if (hitSelf) {
    endGame('Game over! You ran into yourself. Tap restart.');
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    gameEnd();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 1;
    updateStats();
    increaseDifficulty();
    placeFood();
  } else {
    snake.pop();
    updateStats();
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawGrid() {
  ctx.fillStyle = '#0f1222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const offset = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(canvas.width, offset);
    ctx.stroke();
  }
}

function drawCell(x, y, color) {
function drawCell(x, y, color, radius = 6) {
  const px = x * gridSize;
  const py = y * gridSize;

  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, gridSize - 2, gridSize - 2);
  ctx.beginPath();
  ctx.roundRect(px + 1, py + 1, gridSize - 2, gridSize - 2, radius);
  ctx.fill();
}

function draw() {
  drawGrid();
  drawCell(food.x, food.y, '#ff5d7a');

  snake.forEach((part, index) => {
    const color = index === 0 ? '#93ff8f' : '#38c172';
    drawCell(part.x, part.y, color);
  });

  if (paused && !gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
  }
}

function togglePause() {
  if (gameOver) return;

  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  messageEl.textContent = paused ? 'Game paused.' : '';
  draw();
  drawCell(food.x, food.y, '#ff5d7a', 8);

  snake.forEach((part, index) => {
    const color = index === 0 ? '#93ff8f' : '#38c172';
    drawCell(part.x, part.y, color, 5);
  });
}

function bindEvents() {
  window.addEventListener('keydown', (event) => {
    const keyMap = {
      ArrowUp: directionMap.up,
      ArrowDown: directionMap.down,
      ArrowLeft: directionMap.left,
      ArrowRight: directionMap.right,
      w: directionMap.up,
      W: directionMap.up,
      s: directionMap.down,
      S: directionMap.down,
      a: directionMap.left,
      A: directionMap.left,
      d: directionMap.right,
      D: directionMap.right,
    };

    const next = keyMap[event.key];

    if (event.key === ' ') {
      event.preventDefault();
      togglePause();
      return;
    }

      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    const next = keyMap[event.key];
    if (next) {
      event.preventDefault();
      updateDirection(next);
    }
  });

  controlButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const directionMap = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
      };

      updateDirection(directionMap[button.dataset.direction]);
    });
  });

  canvas.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );

  canvas.addEventListener(
    'touchend',
    (event) => {
      if (!touchStart) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      touchStart = null;

      if (Math.max(absX, absY) < 20) return;

      if (absX > absY) {
        updateDirection(dx > 0 ? directionMap.right : directionMap.left);
      } else {
        updateDirection(dy > 0 ? directionMap.down : directionMap.up);
      }
    },
    { passive: true },
  );

  restartBtn.addEventListener('click', resetGame);
  pauseBtn.addEventListener('click', togglePause);
  canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });

  canvas.addEventListener('touchend', (event) => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < 20) return;

    if (absX > absY) {
      updateDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      updateDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }

    touchStart = null;
  }, { passive: true });

  restartBtn.addEventListener('click', resetGame);
}

loadHighScore();
bindEvents();
resetGame();
