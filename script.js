/*----- constants -----*/

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

class SnakePart {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

const snakeParts = [];

const yumSound = new Audio('/sounds/yum.mp3');
const loseSound = new Audio('/sounds/lose.wav');
loseSound.volume = 0.1;

/*----- app's state (letiables) -----*/

let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;

let speed = 3;
let score = 0;
let tailLength = 0;

let headX = 10;
let headY = 10;

let mouseX = Math.floor(Math.random() * tileCount);
let mouseY = Math.floor(Math.random() * tileCount);

let xDirection = 0;
let yDirection = 0;

/*----- cached element references -----*/

const restart = document.getElementById('restart');

document.addEventListener('keydown', keyDown);

/*----- event listeners -----*/

restart.addEventListener('click', startOver);

/*----- functions -----*/

// game loop
function init() {
	changeSnakePosition();
	let result = isGameOver();
	if (result) {
		return;
	}

	clearScreen();

	checkMouseCollision();
	drawMouse();
	drawSnake();
	drawScore();
	setTimeout(init, 1000 / speed);
}

function isGameOver() {
	let gameOver = false;

	if (yDirection === 0 && xDirection === 0) {
		return false;
	}

	//hit walls
	if (headX < 0) {
		gameOver = true;
	} else if (headX >= tileCount) {
		gameOver = true;
	} else if (headY < 0) {
		gameOver = true;
	} else if (headY >= tileCount) {
		gameOver = true;
	}

	// hit snake part
	for (let i = 0; i < snakeParts.length; i++) {
		let part = snakeParts[i];
		if (part.x === headX && part.y === headY) {
			gameOver = true;
			// loseSound.play();
			break;
		}
	}

	if (gameOver) {
		loseSound.play();
		ctx.font = '3rem VT323';

		const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
		gradient.addColorStop('0', 'red');
		gradient.addColorStop('0.5', 'purple');
		gradient.addColorStop('1.0', 'turquoise');
		ctx.fillStyle = gradient;

		ctx.fillText('Game Over!', canvas.width / 3.5, canvas.height / 2);
	}

	return gameOver;
}

function drawScore() {
	ctx.fillStyle = 'white';
	ctx.font = '1.5rem VT323';
	ctx.fillText('Score ' + score, canvas.width - 395, 20);
}

function clearScreen() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
}

function drawSnake() {
	// ctx.fillStyle = 'red';
	// ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.roundRect(headX * tileCount, headY * tileCount, tileSize, tileSize, [10]);
	ctx.fill();

	// ctx.fillStyle = 'orange';
	// for (let i = 0; i < snakeParts.length; i++) {
	// 	let part = snakeParts[i];
	// 	ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
	// }

	ctx.fillStyle = 'orange';
	ctx.beginPath();
	for (let i = 0; i < snakeParts.length; i++) {
		let part = snakeParts[i];
		ctx.roundRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize, [
			10,
		]);
		ctx.fill();
	}

	snakeParts.push(new SnakePart(headX, headY)); //put an item at the end of the list next to the head
	while (snakeParts.length > tailLength) {
		snakeParts.shift(); // remove the furthest item from the snake parts if have more than our tail size
	}
}

function changeSnakePosition() {
	headX = headX + xDirection;
	headY = headY + yDirection;
}

function drawMouse() {
	ctx.fillStyle = 'green';
	ctx.fillRect(mouseX * tileCount, mouseY * tileCount, tileSize, tileSize);
}

function checkMouseCollision() {
	if (mouseX === headX && mouseY === headY) {
		mouseX = Math.floor(Math.random() * tileCount);
		mouseY = Math.floor(Math.random() * tileCount);
		tailLength++;
		score++;
		speed += 0.5;
		yumSound.play();
	}
}

function keyDown(event) {
	// up
	if (event.keyCode == 38) {
		if (yDirection == 1) {
			return;
		}
		yDirection = -1;
		xDirection = 0;
	}

	// down
	if (event.keyCode == 40) {
		if (yDirection == -1) {
			return;
		}
		yDirection = 1;
		xDirection = 0;
	}

	// left
	if (event.keyCode == 37) {
		if (xDirection == 1) {
			return;
		}
		yDirection = 0;
		xDirection = -1;
	}

	// right
	if (event.keyCode == 39) {
		if (xDirection == -1) {
			return;
		}
		yDirection = 0;
		xDirection = 1;
	}
}

// let touchstartX = 0;
// let touchstartY = 0;
// let touchendX = 0;
// let touchendY = 0;

// const gesturedZone = document.getElementById('gesturedZone');

// gesturedZone.addEventListener(
// 	'touchstart',
// 	function (event) {
// 		touchstartX = event.screenX;
// 		touchstartY = event.screenY;
// 	},
// 	false
// );

// gesturedZone.addEventListener(
// 	'touchend',
// 	function (event) {
// 		touchendX = event.screenX;
// 		touchendY = event.screenY;
// 		handleGesture();
// 	},
// 	false
// );

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const gestureZone = document.getElementById('gestureZone');

gestureZone.addEventListener(
	'touchstart',
	function (event) {
		touchstartX = event.changedTouches[0].screenX;
		touchstartY = event.changedTouches[0].screenY;
	},
	false
);

gestureZone.addEventListener(
	'touchend',
	function (event) {
		touchendX = event.changedTouches[0].screenX;
		touchendY = event.changedTouches[0].screenY;
		handleGesture();
	},
	false
);

function handleGesture() {
	//left
	if (touchendX < touchstartX) {
		// if (xDirection == 1) {
		// 	return;
		// }
		yDirection = 0;
		xDirection = -1;
	}
	//right
	if (touchendX > touchstartX) {
		// if (xDirection == -1) {
		// 	return;
		// }
		yDirection = 0;
		xDirection = 1;
	}
	//down
	if (touchendY < touchstartY) {
		// if (yDirection == -1) {
		// 	return;
		// }
		yDirection = 0;
		xDirection = 1;
	}
	//up
	if (touchendY > touchstartY) {
		// if (yDirection == 1) {
		// 	return;
		// }
		yDirection = 0;
		xDirection = -1;
	}
}

function startOver() {
	speed = 3;
	score = 0;
	tailLength = 0;

	headX = 10;
	headY = 10;

	mouseX = Math.floor(Math.random() * tileCount);
	mouseY = Math.floor(Math.random() * tileCount);

	xDirection = 0;
	yDirection = 0;
	gameOver = false;
	init();
}

init();
