let data;

let sidebarWidth;
let mainWidth;
let padding;

let yLabelWidth;  // larghezza etichette asse Y
let xLabelHeight; // altezza etichette asse X

//limiti orizzontali di disposizione delle palline 
let minX;
let maxX;

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
  "Uncertain",
  "Unknown"
];

//variabili per la navigazione
let currentStep = 0;
const totalSteps = 10;
let showYAxis = false;
let showXAxis = false;
let showGridLines = false;
let animationStarted = false;
let animationCompleted = false;

//evidenzia pallini
let highlightMaguindanao = false;
let highlightPalestina = false;
let highlightIraq = false;
let highlightUncertain = false;
let highlightUnknown = false;

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
  closeIcon.addEventListener("click", function(e) {
    e.stopPropagation();
    closeSearch();
  });

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
  canvas.position(0, 80);


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
  panel.innerHTML = "";
  countries.forEach(country => {
    const div = document.createElement("div");
    div.textContent = country;
   
    div.onclick = () => {
      selectedCountry = country;
      panel.style.display = "none";
      const btn = document.getElementById("worldwideBtn");
      btn.classList.remove("search-mode");
      btn.textContent = country + " ▼";

  // Mostra il quadrato e aggiorna il numero di vittime
  updateDeathCounter(country);
  document.getElementById("deathCounterContainer").style.display = "block";
    };
    panel.appendChild(div);
  });

  inVisualizationArea = true;

  //gestione frecce navigazione
  document.getElementById('prevBtn').addEventListener('click', goToPreviousStep);
  document.getElementById('nextBtn').addEventListener('click', goToNextStep);
  //bottone VIEW THE DATA  che avvia l'animazione
  document.getElementById('viewDataBtn').addEventListener('click', function() {
    if(currentStep === 2) {
      //attiva l'animazione - step3
      currentStep = 3;
      updateVisualization();
      updateNavigationUI();
    } else if (currentStep === 3) {
      //vai al caso maguindanao
      currentStep = 4;
      updateVisualization();
      updateNavigationUI();
    }
  });

  updateVisualization();
  updateNavigationUI();

  // Click bottone per aprire ricerca
  document.getElementById("worldwideBtn").addEventListener("click", toggleSearch);
}


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

  //disegna in base allo step
  if(showYAxis) {
    if(currentStep >= 1) {
      //asse y opaco 0.5
      drawingContext.globalAlpha = 0.5;
    }
    drawYAxis();
    drawingContext.globalAlpha = 1;
  }

  if(showXAxis) {
    if(currentStep >= 2) {
      drawingContext.globalAlpha = 0.5;
    }
    drawXAxis();
    drawingContext.globalAlpha = 1;
  }

  if(showGridLines) {
    if(currentStep >= 2) {
      drawingContext.globalAlpha = 0.5;
    }
    drawCategoryLines();
    drawingContext.globalAlpha = 1;
  }

  if(animationStarted) {
    drawGrid(); //griglia solo durante l'animazione

    if(inVisualizationArea) { //se siamo nell'area di visualizzazione
    spawnUpToCurrentYear();
    }

    for(let i = 0; i < dots.length; i++) {
      dots[i].update();
    }

    applyRepulsion();
  }

  // sfumatura verticale tra grafico e sidebar
  let blurWidth = 10;
  let maxAlpha = 200;
  let blurStartX = mainWidth; // subito prima della sidebar

  for (let i = 0; i < blurWidth; i++) {
    stroke(255, 255, 255, map(i, 0, blurWidth, maxAlpha, 0));
    strokeWeight(1);
    line(blurStartX - i, 0, blurStartX - i, height); // sfumatura verso destra
  }
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
    // mostra solo i pallini del paese selezionato
    if (selectedCountry && this.country !== selectedCountry) return;

    let dotColor = color(255);

    //caso 4 maguindanao
    if(highlightMaguindanao && this.year === 2009 && this.category === "Government Officials") {
      dotColor = color(255, 0, 0);
    }

    //caso 5 palestina
    if(highlightPalestina && this.year === 2023 && this.category === "Military Officials") {
      dotColor = color(255, 0, 0);
    }

    //caso 6 iraq
    if(highlightIraq && this.year === 2006 && this.category === "Political Group") {
      dotColor = color(255, 0, 0);
    }

    //caso 7 uncertain e unknownù
    if(currentStep === 7) {
      if(this.category === "Uncertain" || this.category === "Unknown") {
        dotColor = color(255);
      } else {
        dotColor = color(150);
      }
    }

    //caso 8 uncertain
    if(currentStep === 8) {
      if(this.category === "Uncertain") {
        dotColor = color(255, 0, 0);
      } else {
        dotColor = color(150);
      }
    }

    //caso 9 tutti opachi 0.5 tranne uncertain e unknown
    if(currentStep === 9) {
      if(this.category === "Unknown") {
        dotColor = color(255, 0, 0);
      } else {
        dotColor = color(150);
      }
    }

    fill(dotColor);
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
  if(!years.length || currentYearIndex >= years.length) {
    if(!animationCompleted && currentStep === 3) {
      animationCompleted = true;
    }
    return;
  }


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

function drawYAxis() {
  stroke(white);
  strokeWeight(0.5);
  let yAxisOffset = 15;
  let yStartOffset = 20;
  let xAxisY = height - padding - xLabelHeight;

  line(initialX - yAxisOffset, xAxisY - yStartOffset, initialX - yAxisOffset, padding);

  // Etichette Y
  for(let i = 0; i < categories.length; i++) {
    let y = padding + i * rowHeight + rowHeight / 2;
    
    fill(white);
    noStroke();
    textFont(font);
    textAlign(RIGHT, CENTER);
    textSize(12);
    let yLabelOffset = 20;
    text(categories[i], padding - yLabelOffset, y, yLabelWidth - 10);
  }
}

function drawXAxis() {
  // Tacche anni
  for(let i = 0; i <= (2025 - 1992); i++) {
    stroke(255);
    strokeWeight(0.5);
    let x = initialX + i * yearWidth;
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(x, topY, x, bottomY);
  }
  
  // Etichette anni ogni 5
  for (let i = 0; i <= ceil((2025 - 1992) / 5); i++) {
    let label = 1992 + i * 5;
    let x = initialX + (label - 1992) * yearWidth;

    fill(white);
    noStroke();
    textFont(font);
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, x, height - padding - 32);
  }
}

//disegna linee categorie
function drawCategoryLines() {
  for(let i = 0; i < categories.length; i++) {
    let y = padding + i * rowHeight + rowHeight / 2;

    noFill();
    stroke(white);
    strokeWeight(0.5);
    line(padding + yLabelWidth, y, mainWidth - padding, y);
  }
}

//navigazione andare avanti
function goToNextStep() {
  if(currentStep < totalSteps - 1) {
    currentStep++;
    updateVisualization();
    updateNavigationUI();
  }
}

//navigazione tornare indietro
function goToPreviousStep() {
  if(currentStep > 0) {
    currentStep--;
    updateVisualization();
    updateNavigationUI();
  }
}

//aggiorna la schermata
function updateVisualization() {
  //reset tutto
  showXAxis = false;
  showYAxis = false;
  showGridLines = false;
  animationStarted = false;
  inVisualizationArea = false;
  highlightMaguindanao = false;
  highlightPalestina = false;
  highlightIraq = false;
  highlightUncertain = false;
  highlightUnknown = false;

  //attiva in base allo step corrente
  switch(currentStep) {
    case 0: //solo asse y
      showYAxis = true;
      break;
    case 1: //assi x e y
      showYAxis = true;
      showXAxis = true;
      break;
    case 2: //linee categorie
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      break;
    case 3: //animaizone completa
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      break;
    case 4: //caso maguindanao
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightMaguindanao = true;
      break;
    case 5: //caso palestina
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightPalestina = true;
      break;
    case 6: //caso iraq
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightIraq = true;
      break;
    case 7: //caso uncertain e unknown
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightUncertain = true;
      highlightUnknown = true;
      break;
    case 8: //caso uncertain
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightUncertain = true;
      break;
    case 9: //caso unknown
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      highlightUnknown = true;
      break;
  }
}

//abilita o disabilita i bottoni
function updateNavigationUI() {
  const navigationArrows = document.getElementById('navigationArrows');
  const viewDataBtn = document.getElementById('viewDataBtn');
  const nextBtnFinal = document.getElementById('nextBtnFinal');

  nextBtnFinal.style.display = 'none';
  nextBtnFinal.classList.remove('red-button');
  viewDataBtn.classList.remove('arrow-mode');
  viewDataBtn.style.width = '100%'

  if(currentStep === 2) {
    //mostra frecce e nascondi bottone finale
    navigationArrows.style.display = 'none';
    viewDataBtn.style.display = 'block';
    viewDataBtn.textContent = 'VIEW THE DATA';
    viewDataBtn.classList.remove('arrow-mode');
  } else if(currentStep === 3) {
    //dopo animazione, mostra bottone x continuare
    navigationArrows.style.display = 'none';
    viewDataBtn.style.display = 'block';
    viewDataBtn.textContent = "→";
    viewDataBtn.classList.add('arrow-mode');
  } else if(currentStep >= 4 && currentStep <= 8) {
    //mostra frecce di navigazione x i casi
    navigationArrows.style.display = 'flex';
    viewDataBtn.style.display = 'none';
    nextBtnFinal.style.display = 'none';
  } else if(currentStep === 9) {
    // nascondi tutto, mostra COUNTRY
    navigationArrows.style.display = 'none';
    viewDataBtn.style.display = 'none';
    nextBtnFinal.style.display = 'block';
    nextBtnFinal.textContent = "COUNTRY";
    nextBtnFinal.classList.add('red-button');
  } else {
    // normale navigazione
    navigationArrows.style.display = 'flex';
    viewDataBtn.style.display = 'none';
  }

  //disabilita frecce quando necessario
  document.getElementById('prevBtn').disabled = (currentStep === 0);
  document.getElementById('nextBtn').disabled = (currentStep >= 10);
}