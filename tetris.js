const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
  let rowCount = 1;
  for (let y = arena.length - 1; y > 0; --y) {
    if (arena[y].every(v => v !== 0)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;

      player.score += rowCount * 10;
      rowCount *= 2;
    }
  }
}

function collide(arena, player) {
  return player.matrix.some((row, y) => {
    return row.some((value, x) => {
      return (
        value !== 0 &&
        (arena[y + player.pos.y] &&
          arena[y + player.pos.y][x + player.pos.x]) !== 0
      );
    });
  });
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T':
      return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    case 'O':
      return [[2, 2], [2, 2]];
    case 'L':
      return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    case 'J':
      return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    case 'I':
      return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    case 'S':
      return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    case 'Z':
      return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    default:
      return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
  }
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOSTZ';
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  // Store players X position before rotation.
  const pos = player.pos.x;
  // Assign an offset to use for later.
  let offset = 1;
  // Perform the actual matrix rotation.
  rotate(player.matrix, dir);

  // If there is a collision immediately afer rotate, the rotation was illegal.
  // But we allow rotation if the piece can fit when moved out from wall.
  while (collide(arena, player)) {
    player.pos.x += offset;
    // Produces 1, -2, 3, -4, 5 etc.
    offset = -(offset + (offset > 0 ? 1 : -1));
    // If we have tried to offset more than the piece width, we deem the rotation unsuccessful
    if (offset > player.matrix[0].length) {
      // Reset rotation
      rotate(player.matrix, -dir);
      // Reset position
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
};

document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    // Left Arrow
    case 37:
      playerMove(-1);
      break;
    // Right Arrow
    case 39:
      playerMove(1);
      break;
    // Down Arrow
    case 40:
      playerDrop();
      break;
    // Q
    case 81:
      playerRotate(-1);
      break;
    // W
    case 87:
      playerRotate(1);
      break;
    default:
      break;
  }
});

playerReset();
updateScore();
update();
