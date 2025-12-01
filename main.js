let data;

let sidebarWidth;
let mainWidth;
let padding;

let yLabelWidth;  // larghezza etichette asse y
let xLabelHeight; // altezza etichette asse x

//limiti orizzontali di disposizione delle palline 
let minX;
let maxX;

let rowHeight;    // altezza riga
let initialX;     // posizione x del primo anno
let yearWidth;    // larghezza colonna anno
let diam;         // diametro pallini
let gravity;      // velocità caduta pallini

// colori
let white, red, red_translucent, red_hover;

//font
let font = "JetBrains Mono";

// variabili per la visualizzazione dei pallini
let dots = []; //elenco dei pallini
let journalists = []; //elenco dei giornalisti
let years = []; //elenco degli anni
let currentYearIndex = 0; //anno corrente
let spawnedIds = new Set(); //pallini che si caricano
let inVisualizationArea = false;

// filtri
let countries = [];
let selectedCountry = null;

// categorie source_of_fire
let categories = [
  "Criminal Group",
  "Government Officials",
  "Local Residents",
  "Military Officials",
  "Mob Violence",
  "Paramilitary Group",
  "Political Group",
  "Uncertain",
  "Unknown"
];


// toggle barra di ricerca
function toggleSearch() {
  let btn = document.getElementById("worldwideBtn");
  let panel = document.getElementById("filterPanel");

  if (btn.classList.contains("search-mode")) return;

  btn.classList.add("search-mode");
  panel.style.display = "block";

  // crea input e icone
  if (!document.getElementById("countrySearchInput")) {

    const searchWrapper = document.createElement("div");
    searchWrapper.className = "search-wrapper";
    searchWrapper.style.display = "flex";
    searchWrapper.style.alignItems = "center";
    searchWrapper.style.gap = "5px";

    const input = document.createElement("input");
    input.type = "text";
    input.id = "countrySearchInput";
    input.style.fontSize = "15px";
    input.placeholder = "Select country...";
    input.style.flex = "1";

    const searchIcon = document.createElement("span");
    searchIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`;
    searchIcon.style.display = "inline-flex";

    const closeIcon = document.createElement("span");
    closeIcon.className = "close-icon";
    closeIcon.textContent = "✕";
    closeIcon.style.cursor = "pointer";

    searchWrapper.appendChild(input);
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(closeIcon);

    btn.innerHTML = "";
    btn.appendChild(searchWrapper);

    input.focus();

    // filtra i paesi mentre si digita
    input.addEventListener("input", function () {
      filterCountries(this.value);
    });

    // chiudere con la x
    closeIcon.addEventListener("click", function(e) {
      e.stopPropagation();
      closeSearch();
    });
  }
}

function closeSearch() {
  const btn = document.getElementById("worldwideBtn");
  const panel = document.getElementById("filterPanel");

  btn.classList.remove("search-mode");
  panel.style.display = "none";

  const input = document.getElementById("countrySearchInput");
  if (input) input.value = "";

  selectedCountry = null;

  btn.textContent = "WORLDWIDE ▼";

  document.getElementById("deathCounterContainer").style.display = "none";
}




// filtra i paesi in base al testo
function filterCountries(value) {
  const panel = document.getElementById("filterPanel");
  const countryDivs = panel.querySelectorAll("div");
  const query = value.toLowerCase();

  countryDivs.forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(query) ? "block" : "none";
  });
}

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  sidebarWidth = 300;
  mainWidth = windowWidth - sidebarWidth;
  padding = 30;

  let canvas = createCanvas(mainWidth, windowHeight);
  canvas.position(0, 30);


  yLabelWidth = padding + 60;
  xLabelHeight = 50;
  rowHeight = (height - 2 * padding - xLabelHeight) / categories.length;
  initialX = padding + yLabelWidth;
  yearWidth = (mainWidth - 2 * padding - yLabelWidth) / (2025 - 1992);
  diam = 2;
  gravity = 2;

  // colori
  white = color(255);
  red = color(255, 0, 0);
  red_translucent = color(255, 0, 0, 60);
  red_hover = color(255, 0, 0, 80);

  buildJournalistsFromTable();
  drawLayout();

  minX = yearToX(1992)-13;
  maxX = yearToX(2025)+15;


  dots = [];
  countries = [];

  let nRows = data.getRowCount();

  // carica i dati in dots e crea lista paesi unici
  for (let i = 0; i < nRows; i++) {
    let country = data.get(i, "country");
    if (country && !countries.includes(country)) {countries.push(country)};
  }

  // ordina alfabeticamente
  countries.sort((a, b) => a.localeCompare(b));

  let panel = document.getElementById("filterPanel");
  countries.forEach(country => {
  let div = document.createElement("div");
  div.textContent = country;
   
    div.onclick = () => {
      selectedCountry = country;
      updateDeathCounter(country);         // aggiorna contatore vittime
      document.getElementById("deathCounterContainer").style.display = "block";
      panel.style.display = "none";
      const btn = document.getElementById("worldwideBtn");
      btn.classList.remove("search-mode");
      btn.textContent = country + " ▼";
       // Nascondi pannello filtri
      panel.style.display = "none";

  // aggiornamento numero vittime
  updateDeathCounter(country);
  document.getElementById("deathCounterContainer").style.display = "block";
    };
    panel.appendChild(div);
  });

  inVisualizationArea = true;

  
}

  // apertura ricerca
  document.getElementById("worldwideBtn").addEventListener("click", toggleSearch);

  
  

function updateDeathCounter(country) {
  const counter = document.getElementById("deathCounter");
  
  // conteggio vittime x paese
  let count = 0;
  for (let i = 0; i < data.getRowCount(); i++) {
    if (data.get(i, "country") === country) {
      count++;
    }
  }
  
  counter.textContent = count;
}

// griglia con tacche
function drawGrid() {
  // righe categorie
  for (let i = 0; i < categories.length; i++) {
    let y = padding + i * rowHeight + rowHeight / 2;

    fill(white);
    noStroke();
    textFont(font);
    textAlign(RIGHT, CENTER);
    textSize(12);
    let yLabelOffset = 20; //quanto spostare a sx le etichette
    text(categories[i], padding - yLabelOffset, y, yLabelWidth - 10);

    noFill();
    stroke(white);
    strokeWeight(0.5);
    line(padding + yLabelWidth, y, mainWidth - padding, y);
  }

  // tacche x anno
  for (let i = 0; i <= (2025 - 1992); i++) {
    stroke(255);
    strokeWeight(0.5);
    let x = initialX + i * yearWidth;
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(x, topY, x, bottomY);
  }

  // tacche anni precedenti
  let xStart = initialX;
  let numTicks = 10;
  let maxStep = yearWidth;
  let minStep = 5;
  for (let i = 1; i <= numTicks; i++) {
    let step = map(i, 1, numTicks, maxStep, minStep);
    xStart -= step;
    stroke(255);
    strokeWeight(1);
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(xStart, topY, xStart, bottomY);
  }

  // etichette ogni 5 anni con pallino glow
  for (let i = 0; i <= ceil((2025 - 1992) / 5); i++) {
    let label = 1992 + i * 5;
    let x = initialX + (label - 1992) * yearWidth;

    fill(white);
    noStroke();
    textFont(font);
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, x, height - padding - 32);

    // glow
    let yPallino = height - padding - 45;
    let radius = 8;
    let glowWidth = 6;
    let maxAlpha = 120;

    for (let j = glowWidth; j > 0; j--) {
      fill(255, 255, 255, map(j, glowWidth, 0, 0, maxAlpha));
      noStroke();
      circle(x, yPallino, radius + j);
    }
    fill(255);
    noStroke();
    circle(x, yPallino, radius);
  }

  // asse y
  stroke(white);
  strokeWeight(0.5);
  let yAxisOffset = 15;
  let yStartOffset = 20;
  let xAxisY = height - padding - xLabelHeight;
  line(initialX - yAxisOffset, xAxisY - yStartOffset, initialX - yAxisOffset, padding);
}

function draw() {
  background(25);

  drawGrid();

  if(inVisualizationArea) {
    spawnUpToCurrentYear();
  }

  for(let i = 0; i < dots.length; i++) {
    dots[i].update();
  }

  applyRepulsion();

  for (let d of dots) d.update();


  // sfumatura verticale tra grafico e sidebar
  let blurWidth = 10;
  let maxAlpha = 200;
  let blurStartX = mainWidth; // subito prima della sidebar

  for (let i = 0; i < blurWidth; i++) {
    stroke(128, 128, 128, map(i, 0, blurWidth, maxAlpha, 0));
    strokeWeight(1);
    line(blurStartX -i, 0, blurStartX -i, height); // sfumatura verso destra
  }

  drawGrid();
}

//caricamento dati
function buildJournalistsFromTable() {
  journalists = [];

  for(let j = 0; j < data.getRowCount(); j++) {
    let row = data.getRow(j);
    let dateStr = row.get("entry_date");
    let parts = dateStr.split("/");
    let year = Number(parts[2]);

    if(year < 100) {
      if(year >= 90) {
        year += 1900;
      } else {
        year += 2000;
      }
    }

    let journalist = {
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

  years = Array.from(new Set(journalists.map(j => j.year))).sort((a,b) => a-b);
  console.log("Journalists loaded:", journalists.length);
  console.log("Years available:", years);
  console.log("Sample journalist:", journalists[0]);
}

function drawLayout() {
  graphWidth = mainWidth - 2 * padding - yLabelWidth;
  graphHeight = height - 2 * padding - xLabelHeight;
  xAxisStart = initialX;
  yAxisStart = height - padding - xLabelHeight;
}

function yearToX(year) {
  if (years.length === 0) return width / 2;
  let minYear = min(years);
  let maxYear = max(years);
  return map(year, minYear, maxYear, xAxisStart, xAxisStart + graphWidth);
}

function categoryToY(category) {
  let index = categories.indexOf(category);
  if(index === -1) index = categories.indexOf("Unknown");
  return padding + index * rowHeight + rowHeight / 2;
}

class Dot {
  constructor(id, year, category) {
    this.id = id;
    this.year = year;
    this.category = category;
    this.country = journalists[id].country;

    // griglia per determinare la posizione
    let centerX = yearToX(year);
    let jitterX = (yearWidth * 0.4) * randomGaussian(); 
    let baseY = categoryToY(category);

    // posizione finale

    // limiti orizzontali del grafico (1992–2025)
    let minX = yearToX(1992);
    let maxX = yearToX(2025);
    this.finalX = constrain(centerX + jitterX, minX, maxX);

    this.finalY = baseY + random(-10, 10);

    let randomOffset = random(-30, 30);
    this.pos = createVector(this.finalX + randomOffset, -20);
    this.speed = random(2, 4);
    this.arrived = false;
    this.r = diam;

    let startOffset = random(-40, 40);
    let startX = constrain(centerX + startOffset, minX, maxX);
    this.pos = createVector(startX, -20);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = 1;

    this.r = diam;
  }

  update() {
  if(this.arrived) {
    this.draw();
    return;
  }

  // movimento verso la posizione finale
  let dx = this.finalX - this.pos.x;
  let dy = this.finalY - this.pos.y;
  let distance = sqrt(dx * dx + dy * dy);

  if(distance < this.speed) {
    this.pos.x = this.finalX;
    this.pos.y = this.finalY;
    this.arrived = true;
  } else {
    this.pos.x += (dx/distance) * this.speed;
    this.pos.y += (dy/distance) * this.speed;
  }

  if (!this.arrived) {
    let floorY = height - padding - xLabelHeight - 10;

    if (this.pos.y > floorY) {
      this.pos.y = floorY;
      this.vel.y = 0;
    }
  }

  this.draw();
}



  draw() {
     
   // controlla se il pallino deve essere visibile
  let visible = !selectedCountry || this.country === selectedCountry;
  if (!visible) return;

  // colore
  if (selectedCountry) {
    fill(255, 0, 0); // rosso se c'è filtro
  } else {
    fill(255); // bianco se worldwide
  }

  noStroke();
  ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

function applyForceTo(dot, force) {
  let f = p5.Vector.div(force, dot.mass);
  dot.acc.add(f);
}

function applyRepulsion() {
  let minDist = diam * 3;      // distanza tra i punti
  let strength = 6.0;          // costante elastica

  for (let i = 0; i < dots.length; i++) {

    if (!dots[i].arrived) continue;

    for (let j = i + 1; j < dots.length; j++) {

      if (!dots[j].arrived) continue;

      let dir = p5.Vector.sub(dots[i].pos, dots[j].pos);
      let d = dir.mag();

      if (d < minDist && d > 0) {
        let force = map(d, 0, minDist, strength, 0);
        dir.normalize().mult(force);

        dots[i].pos.add(dir);
        dots[j].pos.sub(dir);

        // pallini entro i limiti dopo repulsione
        dots[i].pos.x = constrain(dots[i].pos.x, minX, maxX);
        dots[j].pos.x = constrain(dots[j].pos.x, minX, maxX);
      }
    }
  }
}

function spawnUpToCurrentYear() {
  if(!years.length || currentYearIndex >= years.length) return;


  const yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  const maxSpawnPerFrame = 3; //controllo velocità

  for(let j of journalists) {
    if (spawnedCount >= maxSpawnPerFrame) break;
    
    if (j.year <= yearLimit && !spawnedIds.has(j.id)) {
      let dot = new Dot(j.id, j.year, j.category);
      dots.push(dot);
      spawnedIds.add(j.id);
      spawnedCount++;
    }
  }

  if (spawnedCount === 0 && currentYearIndex < years.length - 1) {
    currentYearIndex++;
  }
}