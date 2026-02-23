const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartButton');
const controlButtons = document.querySelectorAll('.controls button');

const gridSize = 18;
const tileCount = canvas.width / gridSize;
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
  if (gameOver) return;

  const reverse = next.x === -direction.x && next.y === -direction.y;
  if (!reverse) {
    pendingDirection = next;
  }
}

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

function tick() {
  direction = pendingDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    gameEnd();
    return;
  }

  snake.unshift(head);

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

function drawCell(x, y, color, radius = 6) {
  const px = x * gridSize;
  const py = y * gridSize;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(px + 1, py + 1, gridSize - 2, gridSize - 2, radius);
  ctx.fill();
}

function draw() {
  drawGrid();
  drawCell(food.x, food.y, '#ff5d7a', 8);

  snake.forEach((part, index) => {
    const color = index === 0 ? '#93ff8f' : '#38c172';
    drawCell(part.x, part.y, color, 5);
  });
}

function bindEvents() {
  window.addEventListener('keydown', (event) => {
    const keyMap = {
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
