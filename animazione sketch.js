let data;

//pallini
let dots = [];
let journalists = [];
let years = [];
let categories = [
  "Criminal Group",
  "Government Official",
  "Local Residents",
  "Military Officials",
  "Mob Violence",
  "Paramilitary Group",
  "Political Group",
  "Unknown"
];


//animazione
let currentYearIndex = 0;
let spawnedIds = new Set();
let inVisualizationArea = false;

//layout
let margin = 80;
let graphWidth, graphHeight;
let xAxisStart, yAxisStart;

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

//carica dati dei giornalisti
function buildJournalistsFromTable() {
  journalists = [];

  for (let j = 0; j < data.getRowCount(); j++) {
    const row = data.getRow(j);
    //recuperare gli anni da  GG/M/AA a GG/MM/AAAA
    const dateStr = row.get("entry_date");

    const parts = dateStr.split("/");
    let year = Number(parts[2]);

    if(year < 100) {
      if(year >= 90) {
        year += 1900;
      } else {
        year += 2000;
      }
    }
    
    const journalist = {
      id: j,
      year: year,
      category: row.get("source_of_fire") || "Unknown",
      name: row.get("journalist/media worker_name") || "",
      country: row.get("country") || "",
      motive: row.get("motive") || "",
      role: row.get("role") || "",
      city: row.get("city") || "",
      impunity: row.get("impunity") || "",
      medium: row.get("mediums") || "",
      beats: row.get("beats_covered") || "",
      job: row.get("job") || "",
      url: row.get("cpj.org_url") || ""
    };

    journalists.push(journalist);
  }

  years = Array.from(new Set(journalists.map(j => j.year))).sort((a,b)=>a-b);
  console.log("Anni:", years);
  console.log("Giornalisti:", journalists.length);
}

//disegna layout
function drawLayout() {
  graphWidth = width - margin * 2;
  graphHeight = height - margin * 2;
  xAxisStart = margin;
  yAxisStart = height - margin;
  
  console.log("Layout fatto:", {graphWidth, graphHeight, xAxisStart, yAxisStart});
}

//asse x: anni
function yearToX(year) {
  if (years.length === 0) return width / 2;
  
  let minYear = min(years);
  let maxYear = max(years);
  return map(year, minYear, maxYear, xAxisStart, xAxisStart + graphWidth);
}

//asse y: categorie
function categoryToY(category) {
  let index = categories.indexOf(category);
  if(index === -1) index = categories.indexOf("Unknown");
  return map(index, 0, categories.length - 1, yAxisStart - graphHeight, yAxisStart);
}

//schema di ogni pallino
class Dot {
  constructor(id, year, category) {
    this.id = id;
    this.year = year;
    this.category = category;

    this.finalX = yearToX(year);
    this.finalY = categoryToY(category);

    // Inizia dall'alto in posizione casuale
    let randomOffset = random(-50, 50);
    this.pos = createVector(this.finalX + randomOffset, -20);
    this.speed = random(1, 3);
    this.arrived = false;
    this.r = 4;
  }

  update() {
    if(this.arrived) {
      this.draw();
      return;
    }
      //i pallini si muovono verso target
      let dx = this.finalX - this.pos.x;
      let dy = this.finalY - this.pos.y;
      let distance = sqrt(dx * dx + dy* dy);

      if(distance < this.speed) {
        this.pos.x = this.finalX;
        this.pos.y = this.finalY;
        this.arrived = true;
      } else {
        this.pos.x += (dx/distance) * this.speed;
        this.pos.y += (dy/distance) * this.speed;
      }

    this.draw();
  }

  draw() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 1);
  }
}

function setup() {
  buildJournalistsFromTable();

  const vizDiv = document.getElementById("visualization");
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('visualization');

  drawLayout();

  // Inizializza i dots vuoti - verranno spawnati durante lo scroll
  dots = [];

  window.addEventListener("scroll", onScrollUpdate);
  console.log("Setup completato. Dots da spawnare:", journalists.length);
}

function draw() {
  background(25, 25, 25);

  //disegna griglia
  drawGrid();

  // Spawna pallini progressivamente
  if(inVisualizationArea) {
    spawnUpToCurrentYear();
  }

  // Aggiorna e disegna tutti i dots
  for(let i = 0; i < dots.length; i++) {
    dots[i].update();
  }
}

//disegna griglia
function drawGrid() {
  let xStart = xAxisStart;
  let yStart = yAxisStart;

  stroke(100);
  strokeWeight(2);

  //asse x
  if(years.length > 0) {
    let minYear = min(years);
    let maxYear = max(years);

    for(let year = minYear; year <= maxYear; year++) {
      let x = yearToX(year);

      //tacca
      strokeWeight(2);
      line(x, yStart + 50, x, yStart + 42);
    }
  }

  //asse y
  line(xAxisStart - 10, yAxisStart + 50, xAxisStart - 10, yAxisStart - graphHeight);

  //linee orizzontali per ogni categoria
  for(let i = 0; i < categories.length; i++) {
    let y = categoryToY(categories[i]);
    stroke(80);
    strokeWeight(1);
    line(xAxisStart, y, xAxisStart + graphWidth, y);

    //testi delle categorie
    fill(255);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(12);
    text(categories[i], xAxisStart - 10, y);
  }
}

function spawnUpToCurrentYear() {
  if(!years.length || currentYearIndex >= years.length) return;

  const yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  const maxSpawnPerFrame = 3;

  for(let j of journalists) {
    if (spawnedCount >= maxSpawnPerFrame) break;
    
    if (j.year <= yearLimit && !spawnedIds.has(j.id)) {
      let dot = new Dot(j.id, j.year, j.category);
      dots.push(dot);
      spawnedIds.add(j.id);
      spawnedCount++;
      
      console.log("Spawnato dot:", j.id, j.year, j.category);
    }
  }

  // Avanza all'anno successivo se abbiamo spawnato tutti per l'anno corrente
  if (spawnedCount === 0 && currentYearIndex < years.length - 1) {
    currentYearIndex++;
    console.log("Passato all'anno:", years[currentYearIndex]);
  }
}

function onScrollUpdate() {
  const vizSection = document.getElementById("visualization-section");
  const rect = vizSection.getBoundingClientRect();

  inVisualizationArea = rect.top < window.innerHeight * 0.7;

  const canvasEl = document.querySelector("#visualization canvas");
  if(canvasEl) canvasEl.style.opacity = inVisualizationArea ? 1 : 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawLayout();
}