// https://editor.p5js.org/jht9629-nyu/sketches/ZhtkOuC1f
// https://editor.p5js.org/Wangshu11/sketches/g3nht-oLq
// 2026-wk10 Homework-Wangshu11

let mic;
let micStarted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
}

function mousePressed() {
  if (!micStarted) {
    mic.start(function () {
      micStarted = true;
    });
  }
}

function draw() {
  background(255);

  let volume;
  
  if (micStarted) {
    volume = mic.getLevel(0.12);
  } else {
    volume = 0;
  }
  console.log(volume);

  let flowerSize = map(constrain(volume, 0, 0.15), 0, 0.15, 35, 240);

  drawFlower(width / 2, height / 2, flowerSize);
}

function drawFlower(x, y, size) {
  push();
  translate(x, y);
  noStroke();

  // 花瓣
  fill("#e86d8a");
  const petalCount = 8;

  for (let i = 0; i < petalCount; i++) {
    rotate(TWO_PI / petalCount);
    ellipse(0, -size * 0.25, size * 0.24, size * 0.48);
  }

  // 花心
  fill("#f4c84a");
  circle(0, 0, size * 0.25);

  pop();
}
