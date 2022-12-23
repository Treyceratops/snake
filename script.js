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

/*----- app's state (variables) -----*/

let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;

let speed = 3.5;
let level = 0;
let tailLength = 0;
let automated = false;

let headX = 10;
let headY = 10;

let appleX = Math.floor(Math.random() * tileCount);
let appleY = Math.floor(Math.random() * tileCount);

let xDirection = 0;
let yDirection = 0;

let backupXDirection = 0;
let backupYDirection = 0;

let startX = 0;
let startY = 0;

let automatic = false;

/*----- cached element references -----*/

const welcomeTxt = document.getElementById('welcome');

const startGameBtn = document.getElementById('start-game');

const heading = document.getElementById('caterpillar');

const instructions = document.getElementById('instructions');

const pauseBtn = document.getElementById('pause');

const restart = document.getElementById('restart');

const autoBtn = document.getElementById('auto');

const gestureZone = document.getElementById('gestureZone');

const metamorphosis = document.getElementById('metamorphosis');

/*----- event listeners -----*/

startGameBtn.addEventListener('click', removeInstructions);
pauseBtn.addEventListener('click', pause);
autoBtn.addEventListener('click', automate);

restart.addEventListener('click', startOver);

document.addEventListener('keydown', keyDown);

gestureZone.addEventListener('touchstart', handleTouchStart, false);
gestureZone.addEventListener('touchend', handleTouchEnd, false);

/*----- functions -----*/

function removeInstructions() {
	instructions.style.display = 'none';
	xDirection = backupXDirection;
	yDirection = backupYDirection;
}

function pause() {
	instructions.style.display = 'block';
	backupXDirection = xDirection;
	backupYDirection = yDirection;
	xDirection = 0;
	yDirection = 0;
	startGameBtn.innerHTML = 'UNPAUSE';
	welcomeTxt.innerHTML = 'GAME PAUSED';
}

// game loop
function init() {
	heading.innerHTML = 'Caterpillar';
	automatic ? automate() : (automatic = false);
	changeCaterpillarPosition();
	let result = isGameOver();
	if (result) {
		return;
	}

	clearScreen();

	checkAppleCollision();
	drawApple();

	drawCaterpillar();
	drawLevel();
	setTimeout(init, 1000 / speed);
	metamorphose();
}

// ways auto-caterpillar is dying:

// - turning around and hitting it's own body if apple appears on same axis it's already on. can't avoid it's own body

// - if yPos = 0, it turns on itself
function automate() {
	// metamorphose(); need to stop movement after metamorphose
	console.log(caterpillarParts);
	automatic = true;
	let xPos = headX - appleX;
	let yPos = headY - appleY;
	console.log(
		`post-Head: x=${headX} y=${headY} post-Apple: x=${appleX} y=${appleY}`
	);

	// avoid walls
	if (headX === 0) {
		xDirection = 0;
	}
	if (headX === tileCount - 1) {
		xDirection = 0;
	}
	if (headY === 0) {
		yDirection = 0;
	}
	if (headY === tileCount - 1) {
		yDirection = 0;
	}

	// if (Math.abs(xPos) < Math.abs(yPos)) {
	// X LOGIC
	if (xPos > 0) {
		if (caterpillarParts.length > 0 && xDirection == 1) {
			console.log('i want to go left, but my fat a$$ is in the way');
			xDirection = 0;
			if (yPos < 0) {
				yDirection = -1;
			} else {
				yDirection = 1;
			}
			return;
		}
		xDirection = -1;
		yDirection = 0;
	}
	if (xPos < 0) {
		if (caterpillarParts.length > 0 && xDirection == -1) {
			console.log('i want to go right, but my fat a$$ is in the way');
			xDirection = 0;
			if (yPos < 0) {
				yDirection = -1;
			} else {
				yDirection = 1;
			}
			return;
		}
		xDirection = 1;
		yDirection = 0;
	}
	if (xPos == 0) {
		if (yPos > 0) {
			if (caterpillarParts.length > 0 && yDirection == 1) {
				console.log('i want to go up, but my fat a$$ is in the way');
				yDirection = 0;
				if (xPos < 0) {
					xDirection = 1;
				} else {
					xDirection = -1;
				}
				return;
			}
			xDirection = 0;
			yDirection = -1;
		}
		if (yPos < 0) {
			if (caterpillarParts.length > 0 && yDirection == -1) {
				console.log('i want to go down, but my fat ass is in the way');
				yDirection = 0;
				if (xPos < 0) {
					xDirection = 1;
				} else {
					xDirection = -1;
				}
				return;
			}
			xDirection = 0;
			yDirection = 1;
		}
	}

	// Body Collision PseudoCode:
	// use caterpillar parts saved to variable as positions ()
	//

	// } else {
	// 	//Y LOGIC
	// 	if (yPos > 0) {
	// 		if (caterpillarParts.length > 0 && yDirection == 1) {
	// 			xDirection = -1;
	// 			yDirection = 0;
	// 			// return;
	// 		}
	// 		xDirection = 0;
	// 		yDirection = -1;
	// 	}
	// 	if (yPos < 0) {
	// 		if (caterpillarParts.length > 0 && yDirection == -1) {
	// 			xDirection = -1;
	// 			yDirection = 0;
	// 			// return;
	// 		}
	// 		xDirection = 0;
	// 		yDirection = 1;
	// 	}
	// 	if (yPos == 0) {
	// 		if (xPos > 0) {
	// 			if (caterpillarParts.length > 0 && xDirection == 1) {
	// 				xDirection = 0;
	// 				yDirection = -1;
	// 				// return;
	// 			}
	// 			xDirection = -1;
	// 			yDirection = 0;
	// 		}
	// 		if (xPos < 0) {
	// 			if (caterpillarParts.length > 0 && xDirection == -1) {
	// 				xDirection = 0;
	// 				yDirection = -1;
	// 				// return;
	// 			}
	// 			xDirection = 1;
	// 			yDirection = 0;
	// 		}
	// 	}
	// }

	// if (xPos == 0) {
	// }
	// let automated = false
	// function automate() {
	// automated = true (for checkAppleCollision)
	//	compare current caterpillarHead x,y coords to current apple x,y coords,
	// based on difference, will *assign* a value for x/y Direction variable.
	//}
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
		console.log(
			`post-Head: x=${headX} y=${headY} post-apple: x=${appleX} y=${appleY} GAME OVERRRRRRRRR`
		);
		// loseSound.play();
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

function drawLevel() {
	ctx.fillStyle = 'white';
	ctx.font = '1.5rem VT323';
	ctx.fillText('Level ' + level, canvas.width - 385, 30);
}

function clearScreen() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
}

function drawCaterpillar() {
	ctx.fillStyle = 'green';
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

function drawApple() {
	ctx.fillStyle = 'red';
	ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

function checkAppleCollision() {
	if (appleX === headX && appleY === headY) {
		appleX = Math.floor(Math.random() * tileCount);
		appleY = Math.floor(Math.random() * tileCount);
		tailLength++;
		level++;
		speed += 0.2;
		yumSound.play();
		// metamorphose();
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
			if (caterpillarParts.length > 0 && xDirection == -1) {
				return;
			}
			yDirection = 0;
			xDirection = 1;
		} else {
			// left
			if (caterpillarParts.length > 0 && xDirection == 1) {
				return;
			}
			yDirection = 0;
			xDirection = -1;
		}
	} else {
		// down
		if (diffY >= 0) {
			if (caterpillarParts.length > 0 && yDirection == -1) {
				return;
			}
			yDirection = 1;
			xDirection = 0;
		} else {
			// up
			if (caterpillarParts.length > 0 && yDirection == 1) {
				return;
			}
			yDirection = -1;
			xDirection = 0;
		}
	}
}

function startOver() {
	// automatic = false;
	speed = 3.5;
	level = 0;
	tailLength = 0;

	headX = 10;
	headY = 10;

	appleX = Math.floor(Math.random() * tileCount);
	appleY = Math.floor(Math.random() * tileCount);

	xDirection = 0;
	yDirection = 0;
	gameOver = false;
	metamorphosis.style.display = 'none';
	canvas.style.display = 'block';
	init();
}

function metamorphose() {
	if (level == 1) {
		canvas.style.display = 'none';
		xDirection = 0;
		yDirection = 0;
		metamorphosis.style.display = 'block';
		heading.innerHTML = 'Butterfly lv 20';
	}
	return;
}

init();
