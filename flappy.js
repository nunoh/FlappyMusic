var game = new Game();

spacePressed=false;
gravity=2;

document.addEventListener('keydown', function (e) {
    if (e.keyCode == 32) {
		console.log(e.keyCode);
		spacePressed=true;
    }
}, false);

function init() {
	if(game.init())
		game.start();
}

var imageRepository = new function() {

	this.empty = null;
	this.background = new Image();
	this.terrain = new Image();
	this.bird = new Image();
	var numImages = 3;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;

		//potential place for loading screen
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
	this.background.src = "images/background_flat.png";
	this.terrain.src="images/terrain.png";
	this.bird.src="images/flappy2.png";

}();


function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.height=height;
		this.width=width;
	};

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
}

function Background() {
	this.speed = 0.5; //scrolling speed

	this.draw = function() {
		// Pan background
		this.x -= this.speed;
		// this.context.clearRect(0,0,this.canvasWidth,this.canvasHeight);

		this.context.drawImage(imageRepository.background, this.x, this.y);
		this.context.drawImage(imageRepository.background, this.x+this.canvasWidth, this.y);

		if (this.x <= -this.canvasWidth){
			this.x = 0;
		}
	};

}

function Ground(){
	this.speed = 3;
	this.draw = function() {
		this.x -= this.speed;
		this.context.drawImage(imageRepository.terrain, this.x, this.y);
		this.context.drawImage(imageRepository.terrain, this.x+this.canvasWidth, this.y);
		
		if (this.x <= -this.canvasWidth){
			this.x = 0;
		}
	};
}

function Bird(){
	this.speed=3;
	isJumping = false;
	jump = [5, 10, 15, 20, 15, 10, 5, 3, 2, 1, 0];
	ijump = 0;

	this.draw = function() {
		this.y+=this.speed;
		this.context.clearRect(this.x, this.y-this.speed, this.width, this.height);
		this.context.drawImage(imageRepository.bird,this.x,this.y);

		if (this.y>=this.canvasHeight-50){ //this should be less hardcoded
			this.y=this.canvasHeight-50;}
		if (this.y<=0){
			this.y=0;
		}
		
		if (spacePressed) {
			this.context.clearRect(this.x, this.y+jump[ijump-1], this.width, this.height);
			this.context.drawImage(imageRepository.bird,this.x,this.y);
			isJumping = true;

			if (ijump == jump.length) {
				isJumping = false;
				spacePressed = false;
				ijump=0;
				return;
			}
			if (isJumping) {
				this.y -= jump[ijump];
				ijump += 1;
			}
		}
	};
}


function Line(){
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

		if (this.x <= 0){
			console.log(this.x);
			this.x = this.canvasWidth;
		}
	};
}


function detectCollision(){
	collision=false;
	if (game.bird.x < game.line.x + game.line.width  && game.bird.x + game.bird.width  > game.line.x &&
		game.bird.y < game.line.y + game.line.height && game.bird.y + game.bird.height > game.line.y) {
		console.log("BOOM");
		collision=true;
	}
return collision;
}


Background.prototype = new Drawable();
Ground.prototype=new Drawable();
Bird.prototype=new Drawable();
Line.prototype=new Drawable();

function Game() {
	this.init = function() {
		this.bgCanvas = document.getElementById('background');
		this.birdCanvas=document.getElementById('bird');
		this.lineCanvas=document.getElementById('line');

		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.birdContext=this.birdCanvas.getContext('2d');
			this.lineContext=this.lineCanvas.getContext('2d');
			// this.birdContext.globalAlpha=0.5;

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ground.prototype.context = this.bgContext;
			Ground.prototype.canvasWidth=this.bgCanvas.width;
			Ground.prototype.canvasHeight=this.bgCanvas.height;

			Bird.prototype.context=this.birdContext;
			Bird.prototype.canvasHeight=this.birdCanvas.height;
			Bird.prototype.canvasWidth=this.birdCanvas.width;

			Line.prototype.context=this.lineContext;
			Line.prototype.canvasHeight=this.lineCanvas.height;
			Line.prototype.canvasWidth=this.lineCanvas.width;


			this.background = new Background();
			this.background.init(0,0);

			this.terrain = new Ground();
			this.terrain.init(0,this.bgCanvas.height-30);

			this.bird=new Bird();
			this.bird.init(100,100,imageRepository.bird.width,imageRepository.bird.height);

			this.line=new Line();
			this.line.init(this.lineCanvas.width,0,3,this.lineCanvas.height-30);

			return true;
		} else {
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
	detectCollision();
	// game.line.init(game.line.width,0);

}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();