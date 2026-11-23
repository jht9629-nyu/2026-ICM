// https://editor.p5js.org/jht9629-nyu/sketches/LLRIGYQZ6
// https://editor.p5js.org/jj4692/sketches/KexjJmmDV
// 2026-wk10-Assignment-10-audio-Fiona

let sheepX = 450;
let sheepY = 520;

//sheep speed
let sheepSteps = 10;
// make the sheep jump
let jumpY = 0;
let jumpSpeed = 0;
let gravity = 0.6

let clouds =[];
let cloudTouched = []
// play mp3 sound
let pianoSounds = [];
let soundStarted = false;


async function setup() {
  createCanvas(900, 600);

  // load the piano sounds
  pianoSounds[0]= await loadSound("Do.mp3");
  pianoSounds[1]= await loadSound("Re.mp3");
  pianoSounds[2]= await loadSound("Mi.mp3");
  pianoSounds[3]= await loadSound("Fa.mp3");
  pianoSounds[4]= await loadSound("Sol.mp3");
  pianoSounds[5]= await loadSound("La.mp3");
  pianoSounds[6]= await loadSound("Si.mp3");
  pianoSounds[7]= await loadSound("Do2.mp3");

  //clouds
  let cloudY = [310,280,300,260,320,270,300,280];

  for(let i = 0; i <8; i++){
    let cloud = {
      x: 65 + i * 110,
      y : cloudY[i]
    };
    clouds.push(cloud);
    cloudTouched.push(false);
  }
}

function draw() {
  background(120, 180, 220);
  // drawCloud(150, 300);
  // drawSheep();
  // draw clouds
  for (let i=0;i<clouds.length; i ++ ){
    drawCloud(clouds[i].x, clouds[i].y);

    fill(255);
    noStroke();
  }
  drawSheep();
  checkClouds()
}

// draw the sheep
function drawSheep() {
  //add the mouse control
  let dx = (mouseX - sheepX) / sheepSteps;
  sheepX = sheepX + dx;

  // keep the sheep inside canvas
  if (sheepX < 30) {
    sheepX = 30;
  }
  if (sheepX > width - 30) {
    sheepX = width - 30;
  }

  //jump
  jumpY = jumpY + jumpSpeed;
  jumpSpeed = jumpSpeed + gravity

  // stop when sheep lands on the ground
  if(jumpY>0){
    jumpY = 0
    jumpSpeed = 0
  }

  push();
  translate(0,jumpY);
  // Body
  noStroke();
  fill(255);

  circle(sheepX - 12, sheepY + 2, 42);
  circle(sheepX, sheepY - 2, 54);
  circle(sheepX + 13, sheepY, 54);

  // Face
  fill(69, 69, 69);
  ellipse(sheepX - 2, sheepY - 4, 28, 22);

  // Legs
  stroke(69, 69, 69);
  strokeWeight(4);

  line(sheepX - 8, sheepY + 20, sheepX - 6, sheepY + 34);
  line(sheepX + 4, sheepY + 20, sheepX + 2, sheepY + 34);

  pop()
}


// draw cloud

function drawCloud(cloudX, cloudY) {
  push();

  translate(cloudX, cloudY);
  scale(0.3);

  noStroke();
  fill(247, 243, 227);

  ellipse(-60, -30, 90, 60);
  ellipse(-120, 10, 90, 60);
  ellipse(-50, 0, 160, 80);
  ellipse(10, 30, 110, 60);
  ellipse(40, -20, 200, 90);
  ellipse(100, 10, 160, 80);

  pop();
}
// check the cloud collision
function checkClouds(){
  for(let i = 0; i < clouds.length; i++){
    let sheepHeadX = sheepX;
    let sheepHeadY = sheepY-4 + jumpY;

    // setup the area for each clouds
    let cloudLeft = clouds[i].x - 45;
    let cloudRight = clouds[i].x + 45;
    let cloudTop = clouds[i].y - 30;
    let cloudBottom = clouds[i].y + 25;

    if(jumpSpeed < 0){
      if(sheepHeadX >cloudLeft &&sheepHeadX <cloudRight && sheepHeadY >cloudTop && sheepHeadY < cloudBottom && cloudTouched[i]==false){
        cloudTouched[i]=true
        // play the piano audio
        pianoSounds[i].play();
      }
    }
  }
}

function mousePressed(){

  //start audio after mouse interaction
  if(soundStarted == false){
    // start the audio environment reference：https://p5js.org/reference/p5/userStartAudio/
    userStartAudio();
    soundStarted = true;
  }
  
  if(jumpY ==0){
    jumpSpeed = -18;

    for(let i = 0; i < cloudTouched.length; i++){
      cloudTouched[i]= false
    }
  }
}

