/*===============================
=            GLOBALS            =
===============================*/

// kind of works to stop h1 text highlight
document.onselectstart = function() { return false; }
document.onmousedown = function() { return false; }


var spacePressed = false;
window.onload = initAudio;
var context;
var bufferLoader;
var score = 0;

sounds = [
	'sounds/note1.mp3',
	'sounds/note2.mp3',
	'sounds/note3.mp3'
];

img_background = "images/background_flat.png";
img_terrain    = "images/terrain.png";
img_flappy     = "images/flappy2.png";

background_speed = 0.5;
terrain_speed = 3;

/*============================
=            MAIN            =
============================*/

var game = new Game();

document.addEventListener('keydown', function (e) {
	if (e.keyCode == 32) {
		console.log(e.keyCode);
		spacePressed=true;
	}
}, false);

function init() {
	if (game.init())
		initAudio();
		game.start();
}

/*=============================
=            AUDIO            =
=============================*/

function initAudio() {

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	bufferLoader = new BufferLoader(context, sounds, finishedLoading);

	bufferLoader.load();
}

function finishedLoading(bufferList) {
	return;
}

function playSound(bufferPos) {
	var source = context.createBufferSource();
	source.buffer = bufferLoader.bufferList[bufferPos];
	source.connect(context.destination);
	source.start(0);
}

function soundTimer() {
	if (game.line.x == game.line.canvasWidth) {
		sound = Math.floor((Math.random() * 3));
		console.log("sound: " + sound);
		playSound(sound);
	}
}

/*==============================
=            IMAGES            =
==============================*/

var imageRepository = new function() {

	this.empty = null;
	this.background = new Image();
	this.terrain = new Image();
	this.bird = new Image();
	var numImages = 3;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;

		// potential place for load ing screen
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	};
	this.terrain.onload = function() {
		imageLoaded();
	};
	this.bird.onload = function() {
		imageLoaded();
	};

	// Set images src
	this.background.src = img_background;
	this.terrain.src = img_terrain;
	this.bird.src = img_flappy;

}();

function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
	};

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
}

function Background() {

	// scrolling speed
	this.speed = background_speed;

	this.draw = function() {

		// Pan background
		this.x -= this.speed;

		// this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);

		this.context.drawImage(imageRepository.background, this.x, this.y);
		this.context.drawImage(imageRepository.background, this.x+this.canvasWidth, this.y);

		if (this.x <= -this.canvasWidth) {
			this.x = 0;
		}
	};

}

function Ground() {

	this.speed = terrain_speed;

	this.draw = function() {
		this.x -= this.speed;
		this.context.drawImage(imageRepository.terrain, this.x, this.y);
		this.context.drawImage(imageRepository.terrain, this.x+this.canvasWidth, this.y);

		if (this.x <= -this.canvasWidth){
			this.x = 0;
		}
	};
}

function Bird() {

	this.speed = 3;
	isJumping = false;
	jump = [5, 10, 15, 20, 15, 10, 5, 3, 2, 1, 0];
	ijump = 0;

	this.draw = function() {

		this.y += this.speed;
		this.context.clearRect(this.x, this.y-this.speed, this.width, this.height);
		this.context.drawImage(imageRepository.bird,this.x,this.y);

		// check collision with terrain
		if (this.y >= this.canvasHeight - 56) {
			this.y = this.canvasHeight - 56;
			this.y = 200;
			gameOver();
		}

		if (spacePressed) {

			this.context.clearRect(this.x, this.y+jump[ijump-1], this.width, this.height);
			this.context.drawImage(imageRepository.bird,this.x,this.y);
			isJumping = true;

			if (ijump == jump.length) {
				isJumping = false;
				spacePressed = false;
				ijump = 0;
				return;
			}

			if (isJumping) {
				this.y -= jump[ijump];
				ijump += 1;
			}
		}
	};
}

function UI() {

	speed = 0.5;

	this.draw = function() {

		// game.uiContext.clearRect(0, game.uiCanvas.width, 0, game.uiCanvas.height);
		game.uiContext.clearRect(0, 0, game.uiCanvas.width, game.uiCanvas.height);
		game.uiContext.fillStyle = "white";
		game.uiContext.font = "60px flappy-font";
		game.uiContext.textAlign = "center";
		game.uiContext.textBaseline = "top";
		// game.uiContext.boxShadow = "10px 10px 5px #888888";
		game.uiContext.fillText(score, 300, 32);

	};
}


function Line() {

	this.speed = 3;

	this.draw = function() {
		this.x -= this.speed;
		this.context.globalAlpha=0.5;
		this.context.clearRect(this.x,this.y,6,this.canvasHeight);

		this.context.beginPath();
		this.context.setLineDash([10]);
		this.context.lineWidth="3";
		this.context.strokeStyle="green";
		this.context.moveTo(this.x,0);
		this.context.lineTo(this.x,this.canvasHeight-30);
		this.context.stroke();

		if (this.x <= -this.context.lineWidth/2){
			// console.log(this.x);
			this.x = this.canvasWidth;
		}

		// display score
		// this.context.fillStyle = "rgb(250, 250, 250)";
		// this.context.fillStyle = "yellow";
		// this.context.font = "24px flappy-font";
		// this.context.textAlign = "left";
		// this.context.textBaseline = "top";
		// this.context.fillText("SCORE " + score, 32, 32);
	};
}


function detectCollision() {
	collision = false;
	if (game.bird.x < game.line.x + game.line.width  && game.bird.x + game.bird.width  > game.line.x &&
		game.bird.y < game.line.y + game.line.height && game.bird.y + game.bird.height > game.line.y) {
		// console.log("BOOM");
		collision = true;
		score += 1;
	}
	return collision;
}

Background.prototype = new Drawable();
Ground.prototype = new Drawable();
Bird.prototype = new Drawable();
Line.prototype = new Drawable();
UI.prototype = new Drawable();

function Game() {

	this.init = function() {

		this.bgCanvas = document.getElementById('background');
		this.birdCanvas = document.getElementById('bird');
		this.lineCanvas = document.getElementById('line');
		this.uiCanvas = document.getElementById('ui');

		// the click event is only detected on the line canvas
		// since it's the top most one
		this.uiCanvas.addEventListener('click', function(e) {
   			spacePressed = true;
		}, false);

		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {

			this.bgContext = this.bgCanvas.getContext('2d');
			this.birdContext = this.birdCanvas.getContext('2d');
			this.lineContext = this.lineCanvas.getContext('2d');
			this.uiContext = this.uiCanvas.getContext('2d');

			// this.birdContext.globalAlpha=0.5;

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ground.prototype.context = this.bgContext;
			Ground.prototype.canvasWidth = this.bgCanvas.width;
			Ground.prototype.canvasHeight = this.bgCanvas.height;

			Bird.prototype.context = this.birdContext;
			Bird.prototype.canvasHeight = this.birdCanvas.height;
			Bird.prototype.canvasWidth = this.birdCanvas.width;

			Line.prototype.context = this.lineContext;
			Line.prototype.canvasHeight = this.lineCanvas.height;
			Line.prototype.canvasWidth = this.lineCanvas.width;

			UI.prototype.context = this.uiContext;
			UI.prototype.canvasHeight = this.uiCanvas.height;
			UI.prototype.canvasWidth = this.uiCanvas.width;

			this.background = new Background();
			this.background.init(0, 0);

			this.terrain = new Ground();
			this.terrain.init(0, this.bgCanvas.height - 30);

			this.bird = new Bird();
			this.bird.init(100,100,imageRepository.bird.width,imageRepository.bird.height);

			this.line = new Line();
			this.line.init(this.lineCanvas.width,0,3,this.lineCanvas.height-30);

			this.ui = new UI();

			return true;
		}

		else {
			return false;
		}
	};

	// Start the animation loop
	this.start = function() {
		animate();
	};
}

function animate() {
	requestAnimFrame( animate );
	game.background.draw();
	game.terrain.draw();
	game.line.draw();
	game.bird.draw();
	game.ui.draw();
	detectCollision();
	soundTimer();
	// game.line.init(game.line.width,0);
}

function gameOver() {
	alert("Game Over!");
}

window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
		};
})();

