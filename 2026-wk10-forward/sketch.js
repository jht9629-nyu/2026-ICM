// https://editor.p5js.org/jht9629-nyu/sketches/m0U-ZzkKe
// https://editor.p5js.org/qw2689/sketches/u00ERqL9D
// 2026-wk10-forward
// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/q2IDNkUws-A

var mic;

function setup() {
  createCanvas(400, 400);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(0, 255, 0);
  fill(255);
  ellipse(250, 100, 80, 80);
  fill(0);
  ellipse(250, 100, 40, 40);
  fill(255, 50, 0);
  var vol = mic.getLevel();
  ellipse(100, 200, 400, vol * 500);
}