// https://editor.p5js.org/jht9629-nyu/sketches/gxCnkWB5F
// https://editor.p5js.org/yw9954/sketches/JoYmbc79n
// 2026-Wk10-Star-burst-Yuyao
let camera, mic;
let distortion = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  camera = createCapture(VIDEO);
  camera.size(640, 480);
  camera.hide();

  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  if (camera.elt.readyState < 2) return;

  background(20);

  let volume = mic.getLevel();
  console.log('volume', volume);
  let target = constrain(volume * 600, 0, 100);
  distortion = lerp(distortion, target, 0.15);

  push();
  translate(width, 0);
  scale(-1, 1);

  for (let y = 0; y < height; y += 4) {
    let shift = sin(y * 0.04 + frameCount * 0.1) * distortion;

    image(
      camera,
      shift, y, width, 4,
      0, y * 480 / height, 640, 4 * 480 / height
    );
  }

  pop();
}

function mousePressed() {
  userStartAudio();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}