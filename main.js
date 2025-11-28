let data;

let sidebarWidth;
let mainWidth;
let padding;

let yLabelWidth;  // larghezza etichette asse Y
let xLabelHeight; // altezza etichette asse X
let rowHeight;    // altezza riga
let initialX;     // posizione X del primo anno
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
  "Unknown"
];

// toggle barra di ricerca
function toggleSearch() {
  const btn = document.getElementById("worldwideBtn");
  const panel = document.getElementById("filterPanel");

  if (btn.classList.contains("search-mode")) return;

  btn.classList.add("search-mode");
  panel.style.display = "block";

  // wrapper input e icone
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "search-wrapper";
  searchWrapper.style.display = "flex";
  searchWrapper.style.alignItems = "center";
  searchWrapper.style.gap = "5px";

  // Input
  const input = document.createElement("input");
  input.type = "text";
  input.id = "countrySearchInput";
  input.placeholder = "Search for a country...";
  input.style.flex = "1"; // occupa tutto lo spazio disponibile

  // Icona lente a destra (SVG stilizzata)
  const searchIcon = document.createElement("span");
  searchIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;
  searchIcon.style.display = "inline-flex";

  // X per chiudere la barra
  const closeIcon = document.createElement("span");
  closeIcon.className = "close-icon";
  closeIcon.textContent = "✕";
  closeIcon.style.cursor = "pointer";

  // Append: input prima, poi icone (lente e X) a destra
  searchWrapper.appendChild(input);
  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(closeIcon);

  btn.innerHTML = ""; // pulisci bottone
  btn.appendChild(searchWrapper);

  input.focus();

  // Filtra i paesi mentre digiti
  input.addEventListener("input", function () {
    filterCountries(this.value);
  });

  // Chiudi con ESC
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  // Chiudi cliccando la X
  closeIcon.addEventListener("click", closeSearch);

  function closeSearch() {
      btn.classList.remove("search-mode");
      panel.style.display = "none";
      
      selectedCountry = null;
      
      btn.textContent = "Worldwide ▼";

      // Nasconde il quadrato delle vittime
      document.getElementById("deathCounterContainer").style.display = "none";
  }
}

// Filtra i paesi in base al testo
function filterCountries(value) {
  const panel = document.getElementById("filterPanel");
  const countryDivs = panel.querySelectorAll("div");
  const query = value.toLowerCase();

  countryDivs.forEach(div => {
    div.style.display = div.textContent.toLowerCase().includes(query) ? "block" : "none";
  });
}

// --- Caricamento dati ---
function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  sidebarWidth = 380;
  mainWidth = windowWidth - sidebarWidth;
  padding = 30;

  let canvas = createCanvas(mainWidth, windowHeight);
  canvas.position(0, 40);


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

  dots = [];
  countries = [];

  let nRows = data.getRowCount();

  // Carica i dati in dots e crea lista paesi unici
  for (let i = 0; i < nRows; i++) {
    // Lista paesi unici
    let country = data.get(i, "country");
    if (country && !countries.includes(country)) {countries.push(country)};
  }

  // Ordina alfabeticamente
  countries.sort((a, b) => a.localeCompare(b));

  // Popola tendina dei paesi
  const panel = document.getElementById("filterPanel");
  countries.forEach(country => {
    const div = document.createElement("div");
    div.textContent = country;
   
    div.onclick = () => {
      selectedCountry = country;
      panel.style.display = "none";
      const btn = document.getElementById("worldwideBtn");
      btn.classList.remove("search-mode");
      btn.textContent = country + " ▼";
       // Nascondi pannello filtri
      panel.style.display = "none";

  // Mostra il quadrato e aggiorna il numero di vittime
  updateDeathCounter(country);
  document.getElementById("deathCounterContainer").style.display = "block";
    };
    panel.appendChild(div);
  });

  inVisualizationArea = true;
}

  // Click bottone per aprire ricerca
  document.getElementById("worldwideBtn").addEventListener("click", toggleSearch);

  countries.forEach(country => {
  const div = document.createElement("div");
  div.textContent = country;
  div.onclick = () => {
    selectedCountry = country;
    
    // Aggiorna bottone
    const btn = document.getElementById("worldwideBtn");
    btn.classList.remove("search-mode");
    btn.textContent = country + " ▼";
    
    // Aggiorna contatore vittime
    updateDeathCounter(country);
    
    // Mostra il quadrato se era nascosto
    document.getElementById("deathCounterContainer").style.display = "block";

    // Chiudi il pannello
    const panel = document.getElementById("filterPanel");
    panel.style.display = "none";
  };
  panel.appendChild(div);
});


function updateDeathCounter(country) {
  const counter = document.getElementById("deathCounter");
  
  // Conta il numero di vittime nel dataset per quel paese
  let count = 0;
  for (let i = 0; i < data.getRowCount(); i++) {
    if (data.get(i, "country") === country) {
      count++;
    }
  }
  
  counter.textContent = count;
}

// --- Disegna griglia e tacche ---
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

  // tacche ogni anno
  for (let i = 0; i <= (2025 - 1992); i++) {
    stroke(255);
    strokeWeight(0.5);
    let x = initialX + i * yearWidth;
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(x, topY, x, bottomY);
  }

  // tacche anni precedenti (non lineari)
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
    let radius = 10;
    let glowWidth = 8;
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

  // asse Y verticale
  stroke(white);
  strokeWeight(0.5);
  let yAxisOffset = 15;
  let yStartOffset = 20;
  let xAxisY = height - padding - xLabelHeight;
  line(initialX - yAxisOffset, xAxisY - yStartOffset, initialX - yAxisOffset, padding);
}

// --- Disegna ---
function draw() {
  background(25);

  drawGrid();

  if(inVisualizationArea) { //se siamo nell'area di visualizzazione
    spawnUpToCurrentYear();
  }

  for(let i = 0; i < dots.length; i++) {
    dots[i].update();
  }

  avoidOverlap();

  // sfumatura verticale tra grafico e sidebar
  let blurWidth = 10;
  let maxAlpha = 200;
  let blurStartX = mainWidth; // subito prima della sidebar

  for (let i = 0; i < blurWidth; i++) {
    stroke(255, 255, 255, map(i, 0, blurWidth, maxAlpha, 0));
    strokeWeight(1);
    line(blurStartX + i, 0, blurStartX + i, height); // sfumatura verso destra
  }

  drawGrid();
}

//carica i dati
function buildJournalistsFromTable() {
  journalists = [];

  for(let j = 0; j < data.getRowCount(); j++) {
    const row = data.getRow(j);
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

    // GRIGLIA 5 COLONNE CON RIGHE ALTERNATE SOPRA/SOTTO

    let samePositionDots = journalists.filter(j => j.year === year && j.category === category);
    let dotIndex = samePositionDots.findIndex(j => j.id === id);

    // centro della categoria
    let baseX = yearToX(year);
    let baseY = categoryToY(category);

    // griglia
    let cols = 4;
    let colSpacing = diam * 3;
    let rowSpacing = diam * 2;

    // cella
    let col = dotIndex % cols;
    let row = Math.floor(dotIndex / cols);

    // offset X centrato
    let offsetX = (col - (cols - 1) / 2) * colSpacing;

    // offset Y alternato sopra-sotto
    let direction = (row % 2 === 1) ? -1 : 1;       // righe dispari sopra, pari sotto
    let magnitude = Math.ceil(row / 2);            // distanza crescente
    let offsetY = (row === 0) ? 0 : direction * magnitude * rowSpacing;

    // posizioni finali
    this.finalX = baseX + offsetX;
    this.finalY = baseY + offsetY;

    let randomOffset = random(-30, 30);
    this.pos = createVector(this.finalX + randomOffset, -20);
    this.speed = random(1, 3);
    this.arrived = false;
    this.r = diam;
  }

  update() {
    if(this.arrived) {
      this.draw();
      return;
    }
    
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

    this.draw();
  }

  draw() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

function avoidOverlap() {
  let minDist = diam * 1.05;

  for(let i = 0; i < dots.length; i++) {
    for(let j = i + 1; j < dots.length; j++) {
      let dx = dots[j].pos.x - dots[i].pos.x;
      let dy = dots[j].pos.y - dots[i].pos.y;
      let dist = sqrt(dx * dx + dy * dy);

      if(dist < minDist && dist > 0) {
        let overlap = (minDist - dist) * 0.5;

        let nx = dx / dist;
        let ny = dy / dist;

        dots[i].pos.x -= nx * overlap;
        dots[i].pos.y -= ny * overlap;

        dots[j].pos.x += nx * overlap;
        dots[j].pos.y += ny * overlap;
      }
    }
  }
}

function spawnUpToCurrentYear() {
  if(!years.length || currentYearIndex >= years.length) return;


  const yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  const maxSpawnPerFrame = 3; //controlla la velocità

  for(let j of journalists) {
    if (spawnedCount >= maxSpawnPerFrame) break; //ferma dopo max pallini
    
    if (j.year <= yearLimit && !spawnedIds.has(j.id)) {
      let dot = new Dot(j.id, j.year, j.category);
      dots.push(dot);
      spawnedIds.add(j.id);
      spawnedCount++;
    }
  }

  if (spawnedCount === 0 && currentYearIndex < years.length - 1) {
    currentYearIndex++; //passa all'anno successivo
  }
}