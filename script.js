/*----- constants -----*/

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

class CaterpillarPart {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

const caterpillarParts = [];

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

let leafX = Math.floor(Math.random() * tileCount);
let leafY = Math.floor(Math.random() * tileCount);

let xDirection = 0;
let yDirection = 0;

let startX = 0;
let startY = 0;

/*----- cached element references -----*/

const restart = document.getElementById('restart');

const gestureZone = document.getElementById('gestureZone');

/*----- event listeners -----*/

restart.addEventListener('click', startOver);

document.addEventListener('keydown', keyDown);

gestureZone.addEventListener('touchstart', handleTouchStart, false);
gestureZone.addEventListener('touchend', handleTouchEnd, false);

/*----- functions -----*/

// game loop
function init() {
	changeCaterpillarPosition();
	let result = isGameOver();
	if (result) {
		return;
	}

	clearScreen();

	checkLeafCollision();
	drawLeaf();
	drawCaterpillar();
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

	// hit Caterpillar part
	for (let i = 0; i < caterpillarParts.length; i++) {
		let part = caterpillarParts[i];
		if (part.x === headX && part.y === headY) {
			gameOver = true;
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

function drawCaterpillar() {
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.roundRect(headX * tileCount, headY * tileCount, tileSize, tileSize, [10]);
	ctx.fill();

	ctx.fillStyle = 'orange';
	ctx.beginPath();
	for (let i = 0; i < caterpillarParts.length; i++) {
		let part = caterpillarParts[i];
		ctx.roundRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize, [
			10,
		]);
		ctx.fill();
	}

	caterpillarParts.push(new CaterpillarPart(headX, headY)); //put an item at the end of the list next to the head
	while (caterpillarParts.length > tailLength) {
		caterpillarParts.shift(); // remove the furthest item from the Caterpillar parts if have more than our tail size
	}
}

function changeCaterpillarPosition() {
	headX = headX + xDirection;
	headY = headY + yDirection;
}

function drawLeaf() {
	ctx.fillStyle = 'green';
	ctx.fillRect(leafX * tileCount, leafY * tileCount, tileSize, tileSize);
}

function checkLeafCollision() {
	if (leafX === headX && leafY === headY) {
		leafX = Math.floor(Math.random() * tileCount);
		leafY = Math.floor(Math.random() * tileCount);
		tailLength++;
		score++;
		speed += 0.5;
		yumSound.play();
	}
}

function keyDown(event) {
	// up
	if (event.keyCode == 38) {
		if (caterpillarParts.length > 0 && yDirection == 1) {
			return;
		}
		yDirection = -1;
		xDirection = 0;
	}

	// down
	if (event.keyCode == 40) {
		if (caterpillarParts.length > 0 && yDirection == -1) {
			return;
		}
		yDirection = 1;
		xDirection = 0;
	}

	// left
	if (event.keyCode == 37) {
		if (caterpillarParts.length > 0 && xDirection == 1) {
			return;
		}
		yDirection = 0;
		xDirection = -1;
	}

	// right
	if (event.keyCode == 39) {
		if (caterpillarParts.length > 0 && xDirection == -1) {
			return;
		}
		yDirection = 0;
		xDirection = 1;
	}
}

function handleTouchStart(e) {
	startX = e.changedTouches[0].screenX;
	startY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
	const diffX = e.changedTouches[0].screenX - startX;
	const diffY = e.changedTouches[0].screenY - startY;
	const ratioX = Math.abs(diffX / diffY);
	const ratioY = Math.abs(diffY / diffX);
	const absDiff = Math.abs(ratioX > ratioY ? diffX : diffY);

	// Ignore small movements.
	if (absDiff < 30) {
		return;
	}

	if (ratioX > ratioY) {
		// right
		if (diffX >= 0) {
			if (xDirection == -1) {
				return;
			}
			yDirection = 0;
			xDirection = 1;
		} else {
			// left
			if (xDirection == 1) {
				return;
			}
			yDirection = 0;
			xDirection = -1;
		}
	} else {
		// down
		if (diffY >= 0) {
			if (yDirection == -1) {
				return;
			}
			yDirection = 1;
			xDirection = 0;
		} else {
			// up
			if (yDirection == 1) {
				return;
			}
			yDirection = -1;
			xDirection = 0;
		}
	}
}

function startOver() {
	speed = 3;
	score = 0;
	tailLength = 0;

	headX = 10;
	headY = 10;

	leafX = Math.floor(Math.random() * tileCount);
	leafY = Math.floor(Math.random() * tileCount);

	xDirection = 0;
	yDirection = 0;
	gameOver = false;
	init();
}

init();
