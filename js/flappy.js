/*===============================
=            GLOBALS            =
===============================*/

// kind of works to stop h1 text highlight
document.onselectstart = function() { return false; };
document.onmousedown = function() { return false; };

var spacePressed = false;
window.onload = initAudio;
var context;
var bufferLoader;
var bufferLoader_dfx;
var score = 0;
var gameOver = false;
var played = false;
var collision_previous = false;
var started = false;
var scoreSent = false;
var name;
var top_scores = [];
var max_scores = 10;
var button_down = false;
var drawHorLines = false;
var beginning = true;
var beginning_length = 250;
var beginning_length_acum = 0;
var firstSound = false;

// really bad programming here! ;)
var button_img = document.getElementById('button-img');
var button_img_down = document.getElementById('button-img-down');

sounds = [
	'sounds/note2n.mp3',
	'sounds/note1n.mp3',
	'sounds/note3n.mp3'

];

back_sounds = [
	'sounds/amb1.mp3',
	'sounds/back2.mp3'

];

sounds_dfx = [
	'sounds/coin.mp3',
	'sounds/explosion.wav',
	'sounds/power_up.wav',
	'sounds/power_down.wav'
];

img_background = "images/background_flat.png";
img_terrain    = "images/terrain.png";
img_flappy     = "images/flappy2.png";

// button_img = document.getElementById('button-img');

var terrain_height = 50;
var isound = Math.floor((Math.random() * sounds.length));
var background_speed = 0.5;
var scroll_speed = 3;
var gravity = 3;
var jump_modifier = 0.25*gravity;

/*============================
=            MAIN            =
============================*/

var game = new Game();

document.addEventListener('keydown', function (e) {
	if (e.keyCode == 32) {
		if (!started) started = true;
		if (!gameOver) { spacePressed = true; ijump = 0; }
	}
}, false);

document.addEventListener('touchend', function (e) {
		if (!started) started = true;
		if (!gameOver) spacePressed = true;
}, false);


function init() {
	if (game.init()) {
		initAudio();
		game.start();
	}

	getTopScores();

	// increase scroll speed every second
	setInterval(function() {
		// console.log("in function");
		if (started && !beginning & !gameOver) {
			scroll_speed += 0.1;
			// console.log(scroll_speed);
		}
	}, 1000);

	var canvas = document.getElementById('ui');
	var context = canvas.getContext('2d');
	canvas.addEventListener('mousemove', function(evt) {
		var pos = getMousePos(canvas, evt);
		if (gameOver)
		{
			if (pos.x >= game.uiCanvas.width/2 - button_img.width/2 &&
				pos.x <= game.uiCanvas.width/2 + button_img.width/2 &&
				pos.y >= game.uiCanvas.height/2 + 50 &&
				pos.y <= game.uiCanvas.height/2 + 50 + button_img.height)
			{
				button_down = true;
			}
			else {
				button_down = false;
			}
		}
	}, false);

}

/*=============================
=            AUDIO            =
=============================*/

function initAudio() {

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	bufferLoader_dfx = new BufferLoader(context, sounds_dfx, finishedLoading);
	bufferLoader = new BufferLoader(context, sounds, finishedLoading);
	bufferLoader_back = new BufferLoader(context, back_sounds, finishedLoading);

	bufferLoader.load();
	bufferLoader_dfx.load();
	bufferLoader_back.load();
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

function playDFX(type) {
	if (type == "coin")
		pos = 0;
	else if (type == "explosion")
		pos = 1;
	else if (type == "power_up")
		pos = 2;
	else if (type == "power_down")
		pos = 3;
	var source = context.createBufferSource();
	source.buffer = bufferLoader_dfx.bufferList[pos];
	source.connect(context.destination);
	source.start(0);
}


function playBackSound(bufferPos) {
	var source = context.createBufferSource();
	source.buffer = bufferLoader_back.bufferList[bufferPos];
	source.connect(context.destination);
	source.start(0);
}

function soundTimer() {

	// cue sound
	if (started && !beginning && game.line.x == game.line.canvasWidth) {
		isound = Math.floor((Math.random() * sounds.length));
		console.log("sound: " + isound);
		playSound(isound);
	
	}

	// game over sound
	if (gameOver) {
		if (!played) {
			playDFX('power_down');
			played = true;
		}
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

	this.draw = function() {

		// Pan background
		this.x -= background_speed;

		// this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);

		this.context.drawImage(imageRepository.background, this.x, this.y);
		this.context.drawImage(imageRepository.background, this.x + this.canvasWidth, this.y);

		if (this.x <= -this.canvasWidth) {
			this.x = 0;
		}
	};

}

function Ground() {

	this.draw = function() {

		this.x -= scroll_speed;

		if (!started) {
			// draw tap image
			tap_img = document.getElementById('tap-img');
			// console.log(tap_img);
			this.context.drawImage(tap_img, 270, 150);
		}

		if (started && beginning) {

			if (beginning_length_acum >= beginning_length) {
				beginning = false;
				playSound(isound);
				playBackSound(0);
			}

			beginning_length_acum += scroll_speed;
			// console.log(beginning_length_acum);
		}

		this.context.drawImage(imageRepository.terrain, this.x, this.y);
		this.context.drawImage(imageRepository.terrain, this.x + this.canvasWidth, this.y);

		if (this.x <= -this.canvasWidth){
			this.x = 0;
		}
	};
}

function Bird() {

	this.gravity = gravity;
	isJumping = false;
	jump = [5, 10, 15, 25, 15, 10].map(function(x) { return x * jump_modifier; });
	ijump = 0;

	this.draw = function() {

		// this.context.globalAlpha = 0.1;

		// x and y position of bird image, is the top left corner
		// debug lines for x and y position of Flappy

		// draw y line
		// this.context.beginPath();
		// this.context.lineWidth = "0.5";
		// this.context.strokeStyle = "black";
		// this.context.moveTo(this.x, 0);
		// this.context.lineTo(this.x, this.canvasHeight);
		// this.context.stroke();

		// draw x line
		// this.context.beginPath();
		// this.context.lineWidth = "0.5";
		// this.context.strokeStyle = "black";
		// this.context.moveTo(0, this.y);
		// this.context.lineTo(this.canvasWidth, this.y);
		// this.context.stroke();

		if (started) {
			this.y += this.gravity;
		}
		this.context.clearRect(0,0,this.canvasHeight,this.canvasWidth);
		this.context.clearRect(this.x, this.y - this.gravity, this.width, this.height);
		this.context.drawImage(imageRepository.bird, this.x, this.y);

		// check collision with terrain
		if (this.y >= this.canvasHeight - terrain_height - game.bird.height) {
			this.y = this.canvasHeight - terrain_height - game.bird.height;
			gameOver = true;
			isJumping = false;
			if (!scoreSent) {
				scoreSent = true;
				setTimeout(function() { sendScore(); }, 500);
			}
		}

		// limit max height above screen
		if (this.y <= -30) {
			this.y = -30;
		}

		if (spacePressed) {

			this.context.clearRect(this.x, this.y+jump[ijump-1], this.width, this.height);
			this.context.drawImage(imageRepository.bird, this.x, this.y);
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

		game.uiContext.clearRect(0, 0, game.uiCanvas.width, game.uiCanvas.height);

		game.uiContext.fillStyle = "white";
		game.uiContext.font = "60px flappy-font";
		game.uiContext.textAlign = "center";
		game.uiContext.textBaseline = "top";
		game.uiContext.shadowColor = "black";
		game.uiContext.shadowOffsetX = 3;
		game.uiContext.shadowOffsetY = 3;
		game.uiContext.fillText(score, 300, 32);

		if (gameOver) {
			game.uiContext.clearRect(0, 0, game.uiCanvas.width, game.uiCanvas.height);
			game.uiContext.fillStyle = "orange";
			game.uiContext.font = "60px flappy-font";
			game.uiContext.textAlign = "center";
			game.uiContext.textBaseline = "top";
			game.uiContext.shadowColor = "white";
			game.uiContext.shadowOffsetX = 2;
			game.uiContext.shadowOffsetY = 2;
			game.uiContext.fillText("Game Over", 300, 130);
			// gameOver = false;
			// game.background.speed = 0;
			// game.line.speed = 0;
			// game.terrain.speed = 0;
			// game.bird.speed = 0;
			scroll_speed = 0;
			background_speed = 0;

			game.uiContext.fillStyle = "white";
			game.uiContext.font = "60px flappy-font";
			game.uiContext.textAlign = "center";
			game.uiContext.textBaseline = "top";
			game.uiContext.shadowColor = "black";
			game.uiContext.shadowOffsetX = 1;
			game.uiContext.shadowOffsetY = 1;
			game.uiContext.fillText(score, 300, 32);

			if (!button_down) {
				button_img = document.getElementById('button-img');
				game.uiContext.shadowOffsetX = 1;
				game.uiContext.shadowOffsetY = 1;
				game.uiContext.drawImage(button_img, game.uiCanvas.width/2 - button_img.width/2, game.uiCanvas.height/2 + 50);
			}
			else {
				// game.uiContext.shadowColor = "black";
				game.uiContext.shadowOffsetX = 0;
				game.uiContext.shadowOffsetY = 0;
				game.uiContext.drawImage(button_img, game.uiCanvas.width/2 - button_img.width/2, game.uiCanvas.height/2 + 50);
				// game.uiContext.drawImage(button_img_down, game.uiCanvas.width/2 - button_img_down.width/2, game.uiCanvas.height/2 + 50);
			}
		}

		if (!started) {

			game.uiContext.clearRect(0, 0, game.uiCanvas.width, game.uiCanvas.height);

			// format text propreties
			game.uiContext.fillStyle = "rgb(100, 221, 44)";
			game.uiContext.font = "60px flappy-font";
			game.uiContext.textAlign = "center";
			game.uiContext.textBaseline = "top";
			// game.uiContext.fillStyle = "orange";

			// shadow
			game.uiContext.shadowColor = "white";
			game.uiContext.shadowOffsetX = 2;
			game.uiContext.shadowOffsetY = 2;
			// game.uiContext.shadowBlur = 1;

			// draw text finally
			game.uiContext.fillText("Get Ready!", 300, 32);
		}

	};
}


function Line() {

	this.pipe_width = 50;
	this.width = 3;

	this.draw = function() {

		if (started) {

			if (beginning) {
				return;
			}
			this.x -= scroll_speed;

			delta_y = this.canvasHeight - terrain_height;
			pipe_height = delta_y / sounds.length;
			this.pipeY0 = delta_y - (isound * pipe_height);
			this.pipeY1 = (this.pipeY0 - pipe_height);
			this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

			if (drawHorLines) {

				this.context.fillStyle = 'green';
				this.context.fillRect(this.x-this.pipe_width/2,0,this.pipe_width,this.pipeY1);
				this.context.fillRect(this.x-this.pipe_width/2,this.pipeY0,this.pipe_width,delta_y-this.pipeY0);
			}
			else{

				this.context.beginPath();
				this.context.setLineDash([10]);
				this.context.lineWidth = "2";
				this.context.strokeStyle = "green";
				this.context.moveTo(this.x - this.pipe_width/2, 0);
				this.context.lineTo(this.x - this.pipe_width/2, this.canvasHeight - terrain_height);
				this.context.stroke();

				this.context.beginPath();
				this.context.setLineDash([10]);
				this.context.lineWidth = "2";
				this.context.strokeStyle = "green";
				this.context.moveTo(this.x + this.pipe_width/2, 0);
				this.context.lineTo(this.x + this.pipe_width/2, this.canvasHeight - terrain_height);
				this.context.stroke();
			}
		}

		if (this.x <= -this.pipe_width) {
			this.x = this.canvasWidth;
		}

	};
}


function detectCollision() {

	// draw pipe rectangles when bird passes first x of pipe
	if (game.bird.x >= game.line.x - game.line.pipe_width/2) {
		drawHorLines = true;
	}

	// stop drawing pipes when pipe goes to the x = 0
	if (game.line.x + game.line.pipe_width/2 <= 0) {
		drawHorLines = false;
	}

	xcollision = false;
	// checking X colision with pipe
	if (game.bird.x + game.bird.width >= game.line.x - game.line.pipe_width/2 - game.line.width  &&
		game.bird.x <= game.line.x + game.line.pipe_width/2 + game.line.width) {
		xcollision = true;
	}

	// checking X and Y collision with pipes
	if (game.bird.x + game.bird.width > game.line.x - game.line.pipe_width/2 && game.bird.y < game.line.pipeY1 && game.bird.x < game.line.x+game.line.pipe_width ||
		game.bird.x + game.bird.width + game.line.width > game.line.x - game.line.pipe_width/2 && game.bird.y > game.line.pipeY0 && game.bird.x < game.line.x+game.line.pipe_width)
	{
		gameOver = true;
		isJumping = false;
		drawHorLines = true;
		game.bird.speed = 0;
		// playDFX('explosion');
		// collision = true;
	}

	// if bird is going out of a pipe, and hasn't died, update score
	if (!xcollision && collision_previous) {
		score += 1;
		// playDFX('coin');
		// drawHorLines = true;
	}

	collision_previous = xcollision;
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
			if (!started) started = true;
			if (!gameOver) { spacePressed = true; ijump = 0; }
			if (gameOver && button_down) { reset(); }
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
			this.terrain.init(0, this.bgCanvas.height - terrain_height);

			this.bird = new Bird();
			this.bird.init(200, this.bgCanvas.height/2, imageRepository.bird.width, imageRepository.bird.height);

			this.line = new Line();
			this.line.init(this.lineCanvas.width, 0, 3, this.lineCanvas.height - terrain_height);

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

function sendScore() {

	if (score == 0) {
		return;
	}

	if (top_scores.length < max_scores || score > top_scores[top_scores.length-1]) {
		name = prompt("You made it to the high score list. What's your name?");
		console.log(name);
	}

	if (name == "null" || name == "") {
		return;
	}

	if (name != null) {
		$.ajax({
			type: "POST",
			url: "php/put_score.php",
			data: {
				name: name,
				score: score,
				date: getCurrentDate()
			}
		})
		.done(function(msg) {
			// console.log(msg);
			setTimeout(function() { getTopScores(); }, 500);
			name = null;
		});
	}
}

function getTopScores() {
	$.ajax({
		type: "GET",
		url: "php/get_top_scores.php",
		data: {}
	})
	.done(function(msg) {
		top_scores = [];
		lines = msg.split("<br>");
		lines.pop(); // since the last element always empty because of the trailing <br> tag
		// console.log(lines.length);
		if (lines.length != 0) {
			var ul = document.createElement('ul');
			for (i = 0; i < lines.length; i++) {
				elems = lines[i].split(" | ");
				dname = elems[0];
				dscore = elems[1];
				date = elems[2];
				item = document.createElement('li');
				textstr = "<span class=\"rank\">" + (i+1) + ".</span>";
				textstr += " <span class=\"name\">" + dname + "</span>";
				textstr += " <span class=\"score\">(" + dscore + ")</span>";
				textstr += " <span class=\"date\">" + date + "</span>";
				item.innerHTML = textstr;
				ul.appendChild(item);
				top_scores.push(parseInt(dscore));
			}
			// console.log(top_scores);
			scores_div = document.getElementById('scores');
			scores_div.innerHTML = "";
			scores_div.appendChild(ul);
		}
		else {
			scores_div = document.getElementById('scores');
			scores_div.innerHTML = "<i>No highscores yet...</i>";
		}
	});
}

function getCurrentDate() {

	var now     = new Date();
	var dd      = now.getDate();
	var mm      = now.getMonth() + 1; //January is 0!
	var yyyy    = now.getFullYear();
	var hours   = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();

	if( dd < 10) {
	    dd = '0' + dd;
	}

	if( mm < 10) {
	    mm = '0' + mm;
	}

	if( hours < 10) {
	    hours = '0' + hours;
	}

	if( minutes < 10) {
	    minutes = '0' + minutes;
	}

	if( seconds < 10) {
	    seconds = '0' + seconds;
	}

	// date = mm + '/' + dd + '/' + yyyy + ' ' + hours + ':' + minutes + ':' + seconds;
	date = mm + '/' + dd + '/' + yyyy + ' ' + hours + ':' + minutes;
	return date;
}


function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function reset() {
	console.log("resetting...");
	location.reload();
	// gameOver = false;
	// started = false;
	// game.bird.y = 100;
	// game.line.x = 0;
	// game.line.draw();
	// game.bird.draw();
	// animate();
}
