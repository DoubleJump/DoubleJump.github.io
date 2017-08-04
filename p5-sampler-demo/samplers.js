var luchaA;
var luchaB;
var sharp_sampler;
var smooth_sampler;

function preload()
{
	smooth_sampler = new p5.Sampler('smooth', 'smooth', 'clamp', 'clamp');
	sharp_sampler = new p5.Sampler('sharp', 'sharp', 'clamp', 'clamp');

	luchaA = loadImage("luchaA.gif");
	luchaB = loadImage("luchaB.gif");
}

function setup(){
  createCanvas(800, 600, WEBGL);
}

function draw(){
 push();
 translate(-200,0,0);
 texture(luchaA, sharp_sampler);
 plane(400);
 pop()

 push();
 translate(200,0,0);
 texture(luchaB);
 plane(400);
 pop();
}