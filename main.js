let data;

// dimensioni
let sidebarWidth; // larghezza della barra laterale
let mainWidth; // larghezza della zona principale
let padding; // margini dai bordi

let yLabelWidth; // larghezza etichette asse y
let xLabelHeight; // altezza etichette asse x
let rowHeight; // altezza riga
let initialX; // posizione x del primo anno
let yearWidth; // larghezza colonna anno
let diam; // diametro pallini
let gravity; // velocità caduta

// colori
let bg, white, red, red_translucent, red_hover;
let font = "JetBrains Mono";

// pallini
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

// animazione della freccia dei filtri
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
  input.style.flex = "1"; // input occupa tutto lo spazio possibile

  // Icona lente (SVG) a destra
  const searchIcon = document.createElement("span");
  searchIcon.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;
  searchIcon.style.display = "inline-flex";

  // X per chiudere 
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

  input.addEventListener("input", function () {
    filterCountries(this.value);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  closeIcon.addEventListener("click", closeSearch);

  function closeSearch() {
    btn.classList.remove("search-mode");
    panel.style.display = "none";
    btn.textContent = selectedCountry ? selectedCountry + " ▼" : "Worldwide ▼";
  }
}

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

  // carica dati in dots
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

    // costruisci lista paesi unici
    let country = journalist.country;
    if (!countries.includes(country)) countries.push(country);
  }

  // popola tendina
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
    };
    panel.appendChild(div);
  });

  document.getElementById("worldwideBtn").addEventListener("click", toggleSearch);
}

// disegna griglia
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

  // etichette ogni 5 anni
  for (let i = 0; i <= ceil((2025 - 1992) / 5); i++) {
    let label = 1992 + i * 5;
    let x = initialX + (label - 1992) * yearWidth;

    fill(white);
    noStroke();
    textFont(font);
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, x, height - padding - 32);

    // pallino glow
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

// animazione pallini
function animateDot(i) {
  if (selectedCountry && dots[i].country !== selectedCountry) return;

  let categoryIndex = categories.indexOf(dots[i].sourceOfFire);
  if (categoryIndex === -1) return;

  let maxY = padding + categoryIndex * rowHeight + rowHeight / 2;
  let x = initialX + (dots[i].year - 1992) * yearWidth;

  if (dots[i].y < maxY) {
    dots[i].y += gravity;
  } else {
    dots[i].y = maxY;
  }
  circle(x, dots[i].y, diam);
}

function draw() {
  background(bg);

  // sfumatura tra sidebar e grafico
  let blurWidth = 12;  // larghezza sfumatura
let maxAlpha = 200;  // opacità massima
let blurStartX = mainWidth; // inizio blur a destra del grafico

for (let i = 0; i < blurWidth; i++) {
  stroke(255, 255, 255, map(i, 0, blurWidth, maxAlpha, 0));
  strokeWeight(1);
  line(blurStartX -i, 0, blurStartX -i, height); // +i per sfumare verso destra
}

  drawGrid();

  fill(white);
  let nRows = data.getRowCount();
  for (let i = 0; i < nRows; i++) {
    animateDot(i);
  }
}
