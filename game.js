// Create the canvas

// var canvas = document.createElement("canvas");
// var ctx = canvas.getContext("2d");

var canvas = document.getElementById("game-canvas"),
ctx = canvas.getContext("2d");

// ctx.fillRect(160, 240, 20,20);

// canvas.width = 550;
// canvas.height = 350;

// document.body.appendChild(canvas);
// cont = document.getElementById("container");
// cont.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background_flat.png";

var bgTerrain = new Image();
bgTerrain.onload = function () {
	bgReady = true;
};
bgTerrain.src = "images/terrain.png";



// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/flappy.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/flappy2.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {

	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}

	// check collisions with scenario

	// left
	if (hero.x < 0)
		hero.x = 0;

	// top
	if (hero.y < 0)
		hero.y = 0;

	// bottom
	if (hero.y > canvas.height - bgTerrain.height - heroImage.height)
		hero.y = canvas.height - bgTerrain.height - heroImage.height;

	// right
	if (hero.x > canvas.width - heroImage.width)
		hero.x = canvas.width - heroImage.width;
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
		ctx.drawImage(bgTerrain, 0, canvas.height - bgTerrain.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	// ctx.fillStyle = "yellow";
	ctx.font = "24px flappy-font";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("SCORE " + monstersCaught, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible
