let table;
let bubbles = [];
let sidebarWidth = 300;

function preload() {
  table = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  let mainWidth = windowWidth - sidebarWidth;
  let canvas = createCanvas(mainWidth, windowHeight);
  canvas.position(0, 30);


  buildBubbles();
}

function draw() {
  background(25);

  // controllo hover
  for (let b of bubbles) {
    let d = dist(mouseX, mouseY, b.x, b.y);
    b.isHovered = (d < b.r); 
  }

  for (let b of bubbles) {
    b.update();
    b.show();
  }

  // linea luminosa
  let blurWidth = 10, maxAlpha = 200;
  let blurStartX = width;
  for (let i = 0; i < blurWidth; i++) {
    stroke(255, 255, 255, map(i, 0, blurWidth - 1, maxAlpha, 0));
    line(blurStartX - i, 0, blurStartX - i, height);
  }
}


function buildBubbles() {
  if (!table) return;

  // colonna impunity
  let impCol = -1;
  for (let c = 0; c < table.getColumnCount(); c++) {
    if (table.columns[c].toLowerCase().includes("impunity"))
      impCol = c;
  }
  if (impCol === -1) {
    console.error("Colonna impunity non trovata.");
    return;
  }

  // righe x categoria
  let data = {};
  for (let r = 0; r < table.getRowCount(); r++) {
    let v = table.getString(r, impCol).trim();
    if (v === "") v = "Unknown";
    if (!data[v]) data[v] = [];
    data[v].push(r);
  }

  const order = ["Unknown", "Full Justice", "Complete Impunity", "Partial Impunity"];
  let cats = order.filter(c => data[c]);

  bubbles = [];

  // layout
  let cx = width / 2;
  let cy = height / 2;
  let offset = 200; // distanza tra i vertici

  const positions = [
    { x: cx - offset, y: cy },     // sinistra
    { x: cx,         y: cy - offset }, // alto
    { x: cx + offset, y: cy },     // destra
    { x: cx,         y: cy + offset }  // basso
  ];

  cats.forEach((cat, i) => {
    let n = data[cat].length;

    // raggio x densità costante
    let r = sqrt(n) * 4;

    // min e max
    r = constrain(r, 40, 220);

    bubbles.push(
      new Bubble(
        positions[i].x,
        positions[i].y,
        r,
        n,
        cat,
        n
      )
    );
  });
}


class Bubble {
  constructor(x, y, r, count, category, total) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.category = category;
    this.count = total;
    this.isHovered = false;

    this.points = [];

    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      let rad = this.r * sqrt(random());
      this.points.push({
        angle,
        rad,
        offset: random(1000),
        speed: random(-0.003, 0.003)
      });
    }
  }

  update() {
    let speedFactor = 1; // velocita normale

    // rallenta all hover
    if (this.isHovered) {
      speedFactor = 0.45; // nuova velocita
    }

    for (let p of this.points) {
      p.angle += p.speed * speedFactor;
      p.rad = constrain(
        p.rad + sin((frameCount + p.offset) * 0.01) * 0.2 * speedFactor,
        0,
        this.r
      );
    }
  }


  show() {
    noStroke();
    fill("white");

    for (let p of this.points) {
      let rr = p.rad + sin(frameCount * 0.01 + p.offset) * 0.8;
      let px = this.x + cos(p.angle) * rr;
      let py = this.y + sin(p.angle) * rr;
      circle(px, py, 3);
    }

    // label
    fill(255);
    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(12);
    textFont("JetBrains Mono");
    text(`${this.category}`, this.x, this.y - this.r - 8);
  }
}

function windowResized() {
  let newW = windowWidth - sidebarWidth;
  resizeCanvas(newW, windowHeight);

  // riallinea le bolle orizzontalmente
  let spacing = (width - padding * 2) / (bubbles.length + 1);
  bubbles.forEach((b, i) => {
    b.x = padding + spacing * (i + 1);
    b.y = height * 0.5;
  });
}
