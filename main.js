let data;

// dimensioni
let sidebarWidth; // larghezza barra laterale
let mainWidth;    // larghezza area principale
let padding;      // margini dai bordi

let yLabelWidth;  // larghezza etichette asse Y
let xLabelHeight; // altezza etichette asse X
let rowHeight;    // altezza riga
let initialX;     // posizione X del primo anno
let yearWidth;    // larghezza colonna anno
let diam;         // diametro pallini
let gravity;      // velocità caduta pallini

// colori
let bg, white, red, red_translucent, red_hover;
let font = "JetBrains Mono";

// oggetto pallini
let dots = {};

// filtri
let countries = [];
let selectedCountry = null;

// categorie source_of_fire
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

// --- Barra di ricerca / toggle ---
function toggleSearch() {
  const btn = document.getElementById("worldwideBtn");
  const panel = document.getElementById("filterPanel");

  if (btn.classList.contains("search-mode")) return;

  btn.classList.add("search-mode");
  panel.style.display = "block";

  // Wrapper input + icone
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "search-wrapper";
  searchWrapper.style.display = "flex";
  searchWrapper.style.alignItems = "center";
  searchWrapper.style.gap = "5px";

  // Input
  const input = document.createElement("input");
  input.type = "text";
  input.id = "countrySearchInput";
  input.placeholder = "Search country...";
  input.style.flex = "1"; // input occupa tutto lo spazio disponibile

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
    btn.textContent = selectedCountry ? selectedCountry + " ▼" : "Worldwide ▼";
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
  canvas.position(0, 0);

  yLabelWidth = padding + 60;
  xLabelHeight = 50;
  rowHeight = (height - 2 * padding - xLabelHeight) / categories.length;
  initialX = padding + yLabelWidth;
  yearWidth = (mainWidth - 2 * padding - yLabelWidth) / (2025 - 1992);
  diam = 4;
  gravity = 2;

  // colori
  bg = color(0);
  white = color(255);
  red = color(255, 0, 0);
  red_translucent = color(255, 0, 0, 60);
  red_hover = color(255, 0, 0, 80);

  let nRows = data.getRowCount();

  // Carica i dati in dots e crea lista paesi unici
  for (let i = 0; i < nRows; i++) {
    let date = data.get(i, "entry_date");
    let year = parseInt(date.slice(-4));
    let journalist = {
      name: data.get(i, "journalist/media worker_name"),
      sourceOfFire: data.get(i, "source_of_fire"),
      year: year,
      y: -diam / 2,
      country: data.get(i, "country")
    };
    dots[i] = journalist;

    // Lista paesi unici
    let country = journalist.country;
    if (!countries.includes(country)) countries.push(country);
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
    let yLabelOffset = 20;
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

// --- Animazione pallini ---
function animateDot(i) {
  if (selectedCountry && dots[i].country !== selectedCountry) return;

  let categoryIndex = categories.indexOf(dots[i].sourceOfFire);
  if (categoryIndex === -1) return;

  let maxY = padding + categoryIndex * rowHeight + rowHeight / 2;
  let x = initialX + (dots[i].year - 1992) * yearWidth;

  // caduta limitata
  if (dots[i].y < maxY) {
    dots[i].y += gravity;
  } else {
    dots[i].y = maxY;
  }

  circle(x, dots[i].y, diam);
}

// --- Disegna ---
function draw() {
  background(bg);

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

  fill(white);
  let nRows = data.getRowCount();
  for (let i = 0; i < nRows; i++) {
    animateDot(i);
  }
}
