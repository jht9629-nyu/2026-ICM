// https://editor.p5js.org/jht9629-nyu/sketches/uJLn8yxd4
// https://editor.p5js.org/bt2737-svg/sketches/Y7JwElDoa
// 2026-wk10-Cello-lines-Bettina
// Cello lines: each vertical line is one note (C major scale, C2 to C4).
// Click and hold a line to bow it. Drag across lines to play them in turn.
//reference from ear training by icm4.0
//help from claude

//Mary Had a Little Lamb (D Major)

//• F# – E – D – E – F# – F# – F#
//• E – E – E – F# – A – A
//• F# – E – D – E – F# – F# – F# – F# – E – E – F# – E – D

//Twinkle, Twinkle, Little Star (D Major)

//• D – D – A – A – B – B – A
//• G – G – F# – F# – E – E – D
//• A – A – G – G – F# – F# – E
//• A – A – G – G – F# – F# – E
//• D – D – A – A – B – B – A
//• G – G – F# – F# – E – E – D

const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const STEPS = [0, 2, 4, 5, 7, 9, 11];
const NOTE_COUNT = 15; // C2 up to C4
const MIN_PLAY = 600; // ms a note rings even on a quick tap

let voices = [];
let reverb;
let active = -1; // line currently being bowed

function setup() {
  createCanvas(800, 500);
  textFont('Georgia');

  reverb = new p5.Reverb();

  for (let i = 0; i < NOTE_COUNT; i++) {
    let octave = 2 + floor(i / 7);
    let degree = i % 7;
    let midi = 12 * (octave + 1) + STEPS[degree];
    let f = 440 * pow(2, (midi - 69) / 12);

    let v = {
      name: NAMES[degree] + octave,
      freq: f,
      x: 0,
      top: 0,
      bottom: 0,
      held: false,
      sounding: false,
      minUntil: 0,
      vib: 0,
    };

    // cello-ish tone: sawtooth through a low-pass filter, with vibrato
    v.osc = new p5.Oscillator(f, 'sawtooth');
    v.osc.amp(0);
    v.filter = new p5.LowPass();
    v.filter.freq(min(f * 5, 2800));
    v.filter.res(1);
    v.osc.disconnect();
    v.osc.connect(v.filter);

    v.lfo = new p5.Oscillator(5.2, 'sine');
    v.lfo.disconnect();
    v.lfo.amp(0);
    v.osc.freq(v.lfo);

    // share one reverb between all voices
    v.filter.disconnect();
    if (i === 0) reverb.process(v.filter, 2.5, 2);
    else v.filter.connect(reverb);

    v.osc.start();
    v.lfo.start();
    voices.push(v);
  }
  reverb.drywet(0.3);

  // lay out the lines: low notes are longer, like a harp
  let margin = 60;
  let spacing = (width - margin * 2) / (NOTE_COUNT - 1);
  for (let i = 0; i < NOTE_COUNT; i++) {
    let v = voices[i];
    v.x = margin + i * spacing;
    v.bottom = height - 70;
    v.top = map(i, 0, NOTE_COUNT - 1, 90, 230);
  }
}

function draw() {
  background(0);

  // release notes that were let go and have rung long enough
  for (let v of voices) {
    if (v.sounding && !v.held && millis() > v.minUntil) stopNote(v);
  }

  let spacing = voices[1].x - voices[0].x;
  let hover = lineAt(mouseX, mouseY);

  for (let i = 0; i < voices.length; i++) {
    let v = voices[i];

    // vibration eases in while bowed and fades out after
    v.vib = lerp(v.vib, v.sounding ? 7 : 0, 0.15);

    let isHot = i === hover || v.sounding;
    stroke(255, isHot ? 255 : 170);
    strokeWeight(isHot ? 2.5 : 1.5);
    noFill();

    beginShape();
    for (let y = v.top; y <= v.bottom; y += 5) {
      let t = (y - v.top) / (v.bottom - v.top);
      let wobble = v.vib * sin(PI * t) * sin(millis() * 0.03 + t * 6);
      vertex(v.x + wobble, y);
    }
    vertex(v.x, v.bottom);
    endShape();

    // note name under each line
    noStroke();
    fill(255, isHot ? 255 : 130);
    textAlign(CENTER);
    textSize(isHot ? 14 : 12);
    text(v.name, v.x, v.bottom + 24);
  }

  noStroke();
  fill(255, 140);
  textSize(13);
  textAlign(CENTER);
  text('2026 Click and hold a line to bow it. Drag across the lines to play them in turn.', width / 2, 36);
}

// which line (if any) is under the given point
function lineAt(mx, my) {
  let spacing = voices[1].x - voices[0].x;
  for (let i = 0; i < voices.length; i++) {
    let v = voices[i];
    if (abs(mx - v.x) < spacing / 2 && my > v.top - 10 && my < v.bottom + 10) return i;
  }
  return -1;
}

function startNote(v) {
  v.held = true;
  v.sounding = true;
  v.minUntil = millis() + MIN_PLAY;
  v.osc.amp(0.22, 0.12); // bow attack
  v.lfo.amp(v.freq * 0.006, 0.9); // vibrato fades in
}

function stopNote(v) {
  v.sounding = false;
  v.osc.amp(0, 0.5); // release
  v.lfo.amp(0, 0.3);
}

function playLine(i) {
  if (i === active) return;
  if (active >= 0) voices[active].held = false;
  active = i;
  if (i >= 0) startNote(voices[i]);
}

function mousePressed() {
  userStartAudio(); // browsers need a click first
  playLine(lineAt(mouseX, mouseY));
}

function mouseDragged() {
  if (mouseIsPressed) playLine(lineAt(mouseX, mouseY));
}

function mouseReleased() {
  if (active >= 0) voices[active].held = false;
  active = -1;
}
