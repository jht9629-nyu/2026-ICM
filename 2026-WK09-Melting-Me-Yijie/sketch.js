// https://editor.p5js.org/jht9629-nyu/sketches/l4l3fXXL9
// https://editor.p5js.org/JayWan/sketches/4a1Qak26d
// 2026-WK09-Melting-Me-Yijie
// ICM Week 9 · Melting Me（融化的自己）
// Yijie Wan
//
// 上周 Melting City 的视频版：摄像头里的你被实时「融化」。
// 每一帧都做一遍像素排序：在每一列里，从比门槛亮的像素开始往下，
// 一直到碰上比「停止亮度」暗的像素为止，这一段按亮度从亮到暗重新排，
// 亮光就被往下拖成一道道光带。人一动，光带就跟着流。
//
// 画布下面两个滑块：
//   Brightness threshold：多亮的像素才开始拖光带。往左拉，门槛越低，融化的地方越多。
//   Streak length：光带拖多长。往右拉，光带越长。
// 按 S 键，把当前画面存成一张图片。

// ---------- 设置 ----------
const PROCESS_W = 320; // 排序在小画面上做（320 × 240），再放大显示，这样每帧都算得过来
const PROCESS_H = 240;

// ---------- 状态 ----------
let cam; // 摄像头
let frame; // 每一帧先把摄像头画到这张小画布上，左右翻转，像照镜子
let sorted; // 排序后的结果
let thresholdSlider; // 滑块：亮度门槛
let lengthSlider; // 滑块：光带长度

function setup() {
  createCanvas(640, 480);

  cam = createCapture(VIDEO);
  cam.hide(); // 不显示原始的视频元素，只用它的画面

  frame = createGraphics(PROCESS_W, PROCESS_H);
  frame.pixelDensity(1); // 一个像素就是一个像素，算下标时不用管高清屏
  sorted = createImage(PROCESS_W, PROCESS_H);

  // 画布下面的两个滑块
  createDiv("Brightness threshold (move left to melt more)");
  thresholdSlider = createSlider(20, 255, 140, 1);
  createDiv("Streak length");
  lengthSlider = createSlider(0, 100, 70, 1);
  createDiv("Press S to save a screenshot");
}

function draw() {
  background(0);

  // 摄像头还没出画面，就先等一等
  if (cam.elt.readyState < 2) {
    fill(200);
    textAlign(CENTER, CENTER);
    text("waiting for the camera…", width / 2, height / 2);
    return;
  }

  // 1. 把摄像头画到小画布上，左右翻转，像照镜子
  frame.push();
  frame.translate(PROCESS_W, 0);
  frame.scale(-1, 1);
  frame.image(cam, 0, 0, PROCESS_W, PROCESS_H);
  frame.pop();
  frame.loadPixels(); // 把这一帧的像素读进 frame.pixels 数组

  // 2. 读滑块。
  // 光带长度 0 到 100 换算成「停止亮度」：
  // 0 时停止亮度等于门槛，只排比门槛亮的那一小段；
  // 100 时停止亮度是 0，一直拖到这一列的最底下。
  let t = thresholdSlider.value();
  let stopAt = map(lengthSlider.value(), 0, 100, t, 0);

  // 3. 排序，再放大画满整个画布
  sortFrame(t, stopAt);
  image(sorted, 0, 0, width, height);
}

// 按 S 键存图
function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("melting-me", "png");
  }
}

// ---------- 像素排序 ----------

// 门槛是 t，停止亮度是 stopAt，把这一帧重排一遍，结果放进 sorted
function sortFrame(t, stopAt) {
  sorted.loadPixels();
  sorted.pixels.set(frame.pixels); // 先把这一帧整张复制过来

  // 一列一列地处理
  for (let x = 0; x < PROCESS_W; x++) {
    let y = 0;
    while (y < PROCESS_H) {
      // 先跳过比门槛暗的像素
      while (y < PROCESS_H && brightnessAt(x, y) < t) {
        y++;
      }
      // 从这个亮像素开始一直往下，碰到比停止亮度暗的像素才停
      let start = y;
      while (y < PROCESS_H && brightnessAt(x, y) >= stopAt) {
        y++;
      }
      // start 到 y - 1 就是一段：上头是亮光，下面拖着一截暗一些的像素
      if (y - start > 1) {
        sortRun(x, start, y);
      }
    }
  }

  sorted.updatePixels();
}

// 把第 x 列里从 start 到 end - 1 的像素，按亮度从亮到暗重新排
function sortRun(x, start, end) {
  // 1. 把这一段像素一个个取出来，每个是一个对象：颜色加亮度
  let run = [];
  for (let y = start; y < end; y++) {
    let i = indexOf(x, y);
    run.push({
      r: frame.pixels[i],
      g: frame.pixels[i + 1],
      b: frame.pixels[i + 2],
      light: brightnessAt(x, y),
    });
  }

  // 2. 按亮度排序：亮的在上，暗的在下，光就从亮处往下拖出一道尾巴
  run.sort((p, q) => q.light - p.light);

  // 3. 按新的顺序写回 sorted 的同一列、同一段位置
  for (let k = 0; k < run.length; k++) {
    let i = indexOf(x, start + k);
    sorted.pixels[i] = run[k].r;
    sorted.pixels[i + 1] = run[k].g;
    sorted.pixels[i + 2] = run[k].b;
  }
}

// 像素 (x, y) 在 pixels 数组里从第几格开始：每个像素占 4 格（R、G、B、A）
function indexOf(x, y) {
  return (y * PROCESS_W + x) * 4;
}

// 这一帧里像素 (x, y) 有多亮（0 到 255）。
// 人眼对绿色最敏感、对蓝色最不敏感，所以三种颜色的权重不一样。
function brightnessAt(x, y) {
  let i = indexOf(x, y);
  return 0.299 * frame.pixels[i] + 0.587 * frame.pixels[i + 1] + 0.114 * frame.pixels[i + 2];
}
