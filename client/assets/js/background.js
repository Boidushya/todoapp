// init
var maxX = document.body.clientWidth;
var maxY = document.body.clientHeight;
var halfX = maxX / 2;
var halfY = maxY / 2;
var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = maxX;
canvas.height = maxY;
var context = canvas.getContext("2d");
var dotCount = 200;
var dots = [];
// create dots
for (var i = 0; i < dotCount; i++) {
	dots.push(new dot());
}

// dots animation
function render() {
	context.fillStyle = "#101010";
	context.fillRect(0, 0, maxX, maxY);
	for (var i = 0; i < dotCount; i++) {
		dots[i].draw();
		dots[i].move();
	}
	requestAnimationFrame(render);
}

// dots class
// @constructor
function dot() {

	this.rad_x = 2 * Math.random() * halfX + 1;
	this.rad_y = 1.2 * Math.random() * halfY + 1;
	this.alpha = Math.random() * 360 + 1;
	this.speed = Math.random() * 100 < 50 ? 1 : -1;
	this.speed *= 0.3;
	this.size = Math.random() * 1 + 1;
	this.color = Math.floor(Math.random() * 256);

}

// drawing dot
dot.prototype.draw = function () {

	// calc polar coord to decart
	var dx = halfX + this.rad_x * Math.cos(this.alpha / 180 * Math.PI);
	var dy = halfY + this.rad_y * Math.sin(this.alpha / 180 * Math.PI);
	// set color
	context.fillStyle = "rgb(" + this.color + "," + this.color + "," + this.color + ")";
	// draw dot
	context.fillRect(dx, dy, this.size, this.size);

};

// calc new position in polar coord
dot.prototype.move = function () {

	this.alpha += this.speed;
	// change color
	if (Math.random() * 100 < 50) {
		this.color += 1;
	} else {
		this.color -= 1;
	}

};

// start animation
render();