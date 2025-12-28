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
let allDotsSpawned = false; // flag per controllare se tutti i pallini sono stati spawnati

// filtri
let countries = [];
let selectedCountry = null;
let selectedState = null;

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

// variabili per le card
let activeCard = null; //variabile che stabilisce se/quale card mostrare
let closeCard = null;
let cpjLogo; //conterrà l'immagine del logo di cpj per il bottone della card
let cpjButtonHover = null; //memorizza se l'utente sta facendo hover sul bottone che rimanda alla pagina cpj
let cpjUrl;
let photo;
let hasLoadedPhoto = null;
let maskGraphics;
let tickIcon;

//variabili per la navigazione
let currentStep = 0;
let totalSteps = 12;
let showYAxis = false;
let showXAxis = false;
let showGridLines = false;
let animationStarted = false;
let animationCompleted = false;
let animationInitialized = false;


//evidenzia pallini
let highlightMaguindanao = false;
let highlightPalestina = false;
let highlightIraq = false;
let highlightUncertain = false;
let highlightUnknown = false;
let highlightNone = false;


function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
  cpjLogo = loadImage("assets/cpj_logo.svg");
  defaultPhoto = loadImage("assets/default_photo.jpg");
  tickIcon = loadImage("assets/tickIcon.svg");

  console.log("Row count: " + data.getRowCount());
  // carica tutte le foto dei giornalisti
  for (let i = 0; i < data.getRowCount(); i++) {
    photos[i] = loadImage("assets/images/" + i + ".jpg");
  }
  console.log("photos " + photos);
}

function handleConflictsFlags(step) {

    // reset di tutti gli highlight
    highlightMaguindanao = false;
    highlightPalestina = false;
    highlightIraq = false;
    highlightUncertain = false;
    highlightUnknown = false;

    // mappa degli step globali → highlight
    switch(step) {

        case 6: // conflicts-philippines
          highlightMaguindanao = true;
          break;

        case 7: // conflicts-palestine
          highlightPalestina = true;
          break;

        case 8: // conflicts-iraq
          highlightIraq = true;
          break;

        case 9: // without-perpetrators-intro
          highlightUncertain = true;
          highlightUnknown = true;
          break;

        case 10: // section-uncertain
          highlightUncertain = true;
          break;

        case 11: // section-unknown
          highlightUnknown = true;
          break;

        case 12:
          highlightNone = true;
          break;
        
        default:
          // tutti gli highlight si resettano
          break;
    }
}

// animazione typewriter
function typeWriter(element, speed = 20, callback = null) {
    let html = element.innerHTML.trim();
    let output = "", buffer = "";
    let i = 0, insideTag = false;

    element.innerHTML = "";
    element.style.visibility = "visible";

    function type() {
        if (i >= html.length) {
            if (callback) callback();
            return;
        }

        let char = html[i];

        if (char === "<") {
            insideTag = true;
            buffer = "<";
        } else if (char === ">") {
            insideTag = false;
            buffer += ">";
            output += buffer;
            element.innerHTML = output;
            buffer = "";
        } else if (insideTag) {
            buffer += char;
        } else {
            output += char;
            element.innerHTML = output;
        }

        i++;
        
        if(!insideTag) {
          setTimeout(type, speed);
        } else {
          type();
        }
    }
    type();
}

// lista sezioni di graph-explained in ordine
let explanationSections = [
    "explanation-categories",
    "explanation-timeline",
    "explanation-dot",
    "explanation-closure"
];

// lista sezioni di conflicts in ordine
let conflictSections = [
  "intro-first-paragraph",
  "intro-second-paragraph",
  "conflicts-philippines",
  "conflicts-palestine",
  "conflicts-iraq",
  "conflicts-without-perpetrators",
  "conflicts-uncertain",
  "conflicts-unknown"
];

// lista sezioni di country in ordine
let countrySections = [
  "country-intro",
  "filter-container",
  "impunity-status-wrapper"
];

// lista globale sezioni
let globalSteps = [...explanationSections, ...conflictSections, ...countrySections];


let currentGlobalStep = 0;


// funzione globale di attivazione sezioni + evento correlato (passaggi 1 e 2)
function activateGlobalStep(step) {
    if (step < 0 || step >= globalSteps.length) return;
    currentGlobalStep = step;

    // mappa i primi 4 step (graph-explained) sugli step del grafico
    if (step < explanationSections.length) {
      graphExplainedMode = true;
      graphExplainedStep = step;
      currentStep = step; // fondamentale per updateVisualization()
    } else if (step === 13) {
      currentStep = 11;
      graphExplainedMode = false;
    } else {
        graphExplainedMode = false; // esci dalla modalità grafico
        currentStep = step;
    }

    // nasconde tutte le sezioni
    globalSteps.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // mostra la sezione corretta
    let active = document.getElementById(globalSteps[step]);
    if (active) 
        active.style.display = "flex";

    if (active.id === "explanation-closure") {
    let bodyEl = active.querySelector(".section-body");
    if (bodyEl) typeWriter(bodyEl, 20);
    }

    handleConflictsFlags(step);
    
    updateVisualization();
}

// navigazione con le frecce di graph
function setupGraphExplainedNavigation() {

    function localActivate(i) {
        activateGlobalStep(i);
    }

    document.getElementById("next-arrow-categories").addEventListener("click", () => {
        localActivate(1);
    });

    document.getElementById("prev-arrow-timeline").addEventListener("click", () => {
        localActivate(0);
    });
    document.getElementById("next-arrow-timeline").addEventListener("click", () => {
        localActivate(2);
    });

    document.getElementById("prev-arrow-dot").addEventListener("click", () => {
        localActivate(1);
    });
    document.getElementById("next-arrow-dot").addEventListener("click", () => {
        localActivate(3);
    });

    document.getElementById("prev-arrow-closure").addEventListener("click", () => {
        localActivate(2);
    });

    // qui avviene il passaggio a conflicts
    document.getElementById("next-arrow-closure").addEventListener("click", () => {
        // step 3 → step 4
        activateGlobalStep(4);
    });
}

// navigazione con le frecce di conflicts
function setupConflictsNavigation() {

    function localActivateConflicts(relativeIndex) {
        // num. sezioni graph-explained = 4 → offset = 4
        activateGlobalStep(4 + relativeIndex);
    }

    document.getElementById("next-arrow-intro-first-paragraph").addEventListener("click", () => {
        localActivateConflicts(1);
    });

    document.getElementById("prev-arrow-intro-second-paragraph").addEventListener("click", () => {
        localActivateConflicts(0);
    });
    document.getElementById("next-arrow-intro-second-paragraph").addEventListener("click", () => {
        localActivateConflicts(2);
    });

    document.getElementById("prev-arrow-philippines").addEventListener("click", () => {
        localActivateConflicts(1);
    });
    document.getElementById("next-arrow-philippines").addEventListener("click", () => {
        localActivateConflicts(3);
    });

    document.getElementById("prev-arrow-palestine").addEventListener("click", () => {
        localActivateConflicts(2);
    });
    document.getElementById("next-arrow-palestine").addEventListener("click", () => {
        localActivateConflicts(4);
    });

    document.getElementById("prev-arrow-iraq").addEventListener("click", () => {
        localActivateConflicts(3);
    });
    document.getElementById("next-arrow-iraq").addEventListener("click", () => {
        localActivateConflicts(5);
    });

    document.getElementById("prev-arrow-without-perpetrators").addEventListener("click", () => {
        localActivateConflicts(4);
    });
    document.getElementById("next-arrow-without-perpetrators").addEventListener("click", () => {
        localActivateConflicts(6);
    });

    document.getElementById("prev-arrow-uncertain").addEventListener("click", () => {
        localActivateConflicts(5);
    });
    document.getElementById("next-arrow-uncertain").addEventListener("click", () => {
        localActivateConflicts(7);
    });

    document.getElementById("prev-arrow-unknown").addEventListener("click", () => {
        localActivateConflicts(6);
    });
    document.getElementById("next-arrow-unknown").addEventListener("click", () => {
        let index = globalSteps.indexOf("country-intro");
        activateGlobalStep(index);
    });

    document.getElementById("next-arrow-country-intro").addEventListener("click", () => {

        // nasconde country-intro
        let countryIntro = document.getElementById("country-intro");
        countryIntro.style.display = "none";

        // mostra filter-container
        let filterContainer = document.getElementById("filter-container");
        filterContainer.style.display = "flex";
        filterContainer.style.opacity = "1";

        // mostra impunity-status-wrapper
        let impunityWrapper = document.getElementById("impunity-status-wrapper");
        impunityWrapper.style.display = "flex";
        impunityWrapper.style.opacity = "1";
    });
}


window.addEventListener("load", () => {
  setupGraphExplainedNavigation();
  setupConflictsNavigation();

  let urlParams = new URLSearchParams(window.location.search);
  let stepParam = urlParams.get("step");

  if (stepParam !== null) {
    let stepNumber = parseInt(stepParam);
    if (!isNaN(stepNumber)) {
      
      // costruisce subito grafico completo
      buildFullVisualization();

      // attiva step desiderato
      activateGlobalStep(stepNumber);
    }
  } else {
    // comportamento normale
    activateGlobalStep(0);
  }
});


//disegna griglia
function drawGridWithSteps() {
  drawingContext.globalAlpha = 1.0;

  // asse y -- categorie
  if(showYAxis) {
    stroke(white);
    strokeWeight(0.5);
    let yAxisOffset = 15;
    let yStartOffset = 20;
    let xAxisY = height - padding - xLabelHeight;
    line(initialX - yAxisOffset, xAxisY - yStartOffset, initialX - yAxisOffset, padding);

    // etichette categorie
    for(let i = 0; i < categories.length; i++) {
      let y = padding + i * rowHeight + rowHeight / 2;
      fill(white);
      noStroke();
      textFont(font);
      textAlign(RIGHT, CENTER);
      textSize(12);
      let yLabelOffset = 12;
      text(categories[i], padding - yLabelOffset, y, yLabelWidth - 10);
    }
  }

  // asse x -- timeline
  if (showXAxis) {
    // tacche anni
    for(let i = 0; i <= (2025 - 1992); i++) {
      stroke(white);
      strokeWeight(0.5);
      let x = initialX + i * yearWidth;
      let topY = height - padding - xLabelHeight;
      let bottomY = height - padding - 40;
      line(x, topY, x, bottomY);
    }
    
    // etichette anni + pallini ogni 5
    for (let i = 0; i <= ceil((2025 - 1992) / 5); i++) {
      let label = 1992 + i * 5;
      let x = initialX + (label - 1992) * yearWidth;

    fill(white);
      noStroke();
      textFont(font);
      textAlign(CENTER, TOP);
      textSize(12);
      text(label, x, height - padding - 32);
      
      // pallini
      let yPallino = height - padding - 45;
      let radius = 15;
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
  }

  // linee categorie
  if (showGridLines) {
    for(let i = 0; i < categories.length; i++) {
      let y = padding + i * rowHeight + rowHeight / 2;
      noFill();
      stroke(white);
      strokeWeight(0.5);
      line(padding + yLabelWidth, y, mainWidth - padding, y);
    }
  }
  
  drawingContext.globalAlpha = 1.0;
}

//caricamento dati
function buildJournalistsFromTable() {
  journalists = [];

  for (let j = 0; j < data.getRowCount(); j++) {
    let row = data.getRow(j);
    let dateStr = row.get("entry_date") || "";
    let parts = dateStr.split("/");
    let year = Number(parts[2]) || 0;

    if (year < 100) {
      if (year >= 90) {
        year += 1900;
      } else {
        year += 2000;
      }
    }

    // workRelated
    let workRelated = "Unknown";
    let wr = row.get("confirmed work related or unconfirmed (may be work related)");
    if (wr === "Journalist - Confirmed") workRelated = "Confirmed";
    if (wr === "Journalist - Unconfirmed") workRelated = "Unconfirmed";
    if (wr === "Media Worker") workRelated = "Media Worker";

    // country: normalizziamo qui
    let rawCountry = (row.get("country") || "");
    let country = rawCountry.trim(); // per mostrare nella UI
    let countryNorm = country.toLowerCase(); // per confronti (no spazi esterni)

    let journalist = {
      id: j,
      year: year,
      date: row.get("entry_date"),
      ambiguousEntryDate: row.get("ambiguous_entry_date"),
      category: row.get("source_of_fire") || "Unknown",
      name: row.get("journalist/media worker_name") || "",
      country: country,
      countryNorm: countryNorm,
      motive: row.get("motive") || "",
      role: row.get("role") || "",
      city: row.get("city") || "",
      typeOfDeath: row.get("type_of_death") || "",
      impunity: row.get("impunity") || "",
      organization: row.get("organization") || "",
      medium: row.get("mediums") || "",
      beats: row.get("beats_covered") || "",
      job: row.get("job") || "",
      url: row.get("cpj.org_url") || "",
      workRelated: workRelated,
      threatened: row.get("threatened") || "Unknown",
      tortured: row.get("tortured") || "Unknown",
      heldCaptive: row.get("held_captive") || "Unknown",
      photoCredit: row.get("photoCredit")
    };

    journalists.push(journalist);
  }

  years = Array.from(new Set(journalists.map(j => j.year))).sort((a,b) => a-b);
  console.log("Journalists loaded:", journalists.length);
  console.log("Years available:", years);
  console.log("Sample journalist:", journalists[0]);
}

//calcola le dimensioni dell'area del grafico
function drawLayout() {
  graphWidth = mainWidth - 2 * padding - yLabelWidth;
  graphHeight = height - 2 * padding - xLabelHeight;
  xAxisStart = initialX;
  yAxisStart = height - padding - xLabelHeight;
}

//converti un anno in una coordinata x sullo schermo
function yearToX(year) {
  if (years.length === 0) return width / 2;
  let minYear = min(years);
  let maxYear = max(years);
  return map(year, minYear, maxYear, xAxisStart, xAxisStart + graphWidth);
}

//converti una categoria in una coordinata Y
function categoryToY(category) {
  let index = categories.indexOf(category);
  if(index === -1) index = categories.indexOf("Unknown");
  return padding + index * rowHeight + rowHeight / 2;
}

//crea gradualmente i pallini
function spawnUpToCurrentYear() {
  if (!years.length || currentYearIndex >= years.length) return;

  let yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  let maxSpawnPerFrame = 10;

  for (let j of journalists) {
  if (spawnedCount >= maxSpawnPerFrame) break;
  if (j.year <= yearLimit && !spawnedIds.has(j.id)) {

    // FILTRO PAESE
    let dot = new Dot(j.id, j.year, j.category); 
    // imposta la visibilità al momento della creazione
    if (!selectedCountry) {
      dot.visible = true;
      dot.dimmed = false;
    } else {
      let dotCountry = (dot.country || "").trim().toLowerCase();
      dot.visible = dotCountry === selectedCountry.trim().toLowerCase();
      dot.dimmed = !dot.visible;
    }
    dots.push(dot);
    spawnedIds.add(j.id);
    spawnedCount++;
  }
  }

  // passa all'anno successivo solo quando tutti i pallini di questo anno sono spawnati
  if (spawnedCount === 0 && currentYearIndex < years.length - 1) {
    currentYearIndex++;
  }

  // quando tutto è completato
  if(spawnedIds.size === journalists.length) {
    allDotsSpawned = true;
  }
}

function applyRepulsion() {
  let minDist = diam * 3.5;
  let strength = 0.5; // più basso = beeswarm più compatto 

  for (let i = 0; i < dots.length; i++) {
    let a = dots[i];
    if (!a.arrived) continue;

    for (let j = i + 1; j < dots.length; j++) {
      let b = dots[j];
      if (!b.arrived) continue;

      let dir = p5.Vector.sub(a.pos, b.pos);
      let d = dir.mag();

      if (d > 0 && d < minDist) {
        let overlap = (minDist - d) * strength;
        dir.normalize();

        // spinge punti in direzioni opposte
        a.pos.add(dir.copy().mult(overlap));
        b.pos.sub(dir.copy().mult(overlap));

        // limita all'area corretta
        a.pos.x = constrain(a.pos.x, minX, maxX);
        b.pos.x = constrain(b.pos.x, minX, maxX);
      }
    }
  }
}

//aggiorna la schermata
function updateVisualization() {
  // reset parziale degli highlight
  showXAxis = false;
  showYAxis = false;
  showGridLines = false;

  inVisualizationArea = animationStarted;

  // attiva in base allo step corrente
  switch(currentStep) {
    case 0: showYAxis = true; 
    break;

    case 1: 
      showYAxis = true; 
      showXAxis = true; 
    break;

    case 2: // start cascata
      showYAxis = true;
      showXAxis = true; 
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;

      if (!animationInitialized) {
        currentYearIndex = 0;
        animationInitialized = true;
        animationStarted = true;
      }
      break;

    case 3: // animazione continua
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      break;

    case 4:
    case 5:
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      inVisualizationArea = true;
    break;

    // highlight step
    case 6: 
      showYAxis = true;
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightMaguindanao = true; 
    break;

    case 7: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightPalestina = true; 
    break;

    case 8: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightIraq = true; 
    break;

    case 9: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUncertain = true; 
      highlightUnknown = true; 
    break;
    
    case 10: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUncertain = true; 
    break;
    
    case 11: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUnknown = true; 
    break;

    case 12: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
    break;
    
    case 13: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
    break;
  }
}

// genera tutti i pallini e il grafico (x quando si arriva dall header)
function buildFullVisualization() {
  dots = [];
  spawnedIds = new Set();

  for (let j of journalists) {
    if (!spawnedIds.has(j.id)) {
      let dot = new Dot(j.id, j.year, j.category);
      dot.visible = true;
      dot.dimmed = false;
      dots.push(dot);
      spawnedIds.add(j.id);
    }
  }

  allDotsSpawned = true;

  // visibilita assi e griglia
  showXAxis = true;
  showYAxis = true;
  showGridLines = true;
  inVisualizationArea = true;

  // aggiorna layout
  drawLayout();
}

//crea pallini
class Dot {
  constructor(id, year, category) {
    this.id = id;
    this.year = year;
    this.category = category;
    this.country = (journalists[id] && journalists[id].countryNorm) ? journalists[id].countryNorm : "";


    let centerX = yearToX(year);
    let jitterX = (yearWidth * 0.4) * randomGaussian(); 
    let baseY = categoryToY(category);

    let minX_local = yearToX(1992);
    let maxX_local = yearToX(2025);

    this.finalX = constrain(centerX + jitterX, minX_local, maxX_local);
    this.finalY = baseY + random(-10, 10);

    let startOffset = random(-40, 40);
    let startX = constrain(centerX + startOffset, minX_local, maxX_local);

    this.pos = createVector(startX, -20);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.speed = random(2, 4);
    this.arrived = false;
    this.mass = 1;
    this.r = diam;

    //stato hover
    this.hover = false;
  }

  update() {

    if (this.arrived) {
      this.draw();
      return;
    }

    let dx = this.finalX - this.pos.x;
    let dy = this.finalY - this.pos.y;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.pos.x = this.finalX;
      this.pos.y = this.finalY;
      this.arrived = true;
    } else {
      this.pos.x += (dx / distance) * this.speed;
      this.pos.y += (dy / distance) * this.speed;
    }

    let floorY = height - padding - xLabelHeight - 10;
    if (this.pos.y > floorY) {
      this.pos.y = floorY;
      this.vel.y = 0;
    }

    this.draw();
  }

  draw() {
    // raggio maggiore x dots selezionati (country)

    let dotColor = color(255);

    if (highlightMaguindanao && this.year === 2009 && this.category === "Government Officials")
      dotColor = color(255, 0, 0);

    if (highlightPalestina && this.year === 2023 && this.category === "Military Officials")
      dotColor = color(255, 0, 0);

    if (highlightIraq && this.year === 2006 && this.category === "Political Group")
      dotColor = color(255, 0, 0);

    if (highlightUncertain && highlightUnknown) {
      if (this.category === "Uncertain" || this.category === "Unknown" || this.category === "Multiple")
      dotColor = color(255, 0, 0);
    }

    else if (highlightUncertain) {
      if (this.category === "Uncertain")
        dotColor = color(255, 0, 0);
    }

    else if (highlightUnknown) {
      if (this.category === "Unknown" || this.category === "Multiple")
        dotColor = color(255, 0, 0);
    }

    // quando il pallino è in hover
    if(this.hover) {
      // si ingrandisce
      noStroke();
      ellipse(this.pos.x, this.pos.y, this.r * 4.5);
      return;
    }

    fill(dotColor);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }


  isHovered() {
    return dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.r;
  }
}

// popola il pannello dei paesi
function populateCountryPanel() {
  let panel = document.getElementById("filter-panel");
  let counterContainer = document.getElementById("death-counter-container");
  let worldwideBtn = document.getElementById("worldwide-btn");

  panel.innerHTML = "";
  panel.style.display = "none";

  // crea opzioni per ogni paese
  countries.forEach(country => {
    let div = document.createElement("div");
    div.classList.add("country-option");
    div.textContent = country;
    div.style.cursor = "pointer";

    div.addEventListener("click", () => {
      selectedCountry = country;

      // ripristina il bottone se c'è un input di ricerca
      let searchInput = document.getElementById("search-input");
      if(searchInput) {
        searchInput.replaceWith(worldwideBtn);
      }

      // aggiorna il testo del bottone con il paese selezionato
      worldwideBtn.textContent = country + ' ⌵';
  
      // aggiorna contatore e visibilità dei pallini
      updateDeathCounter(country);
      counterContainer.style.display = "flex";
      updateDotsVisibility(); 
  
      // nasconde il pannello
      panel.style.display = "none";

      // mostra tutti i paesi per la prossima apertura
      let allOptions = panel.querySelectorAll(".country-option");
      allOptions.forEach(opt => {
        opt.style.display = 'flex';
      });
    });

    panel.appendChild(div);
  });
}

// aggiorna il contatore delle vittime
function updateDeathCounter(country = null) {
  let counter = document.getElementById("death-counter");
  let container = document.getElementById("death-counter-container");

  // in worldwide è sempre nascosto
  if (!country) {
    counter.textContent = "";
    container.style.display = "none";
    return;
  }

  let countryLower = country.trim().toLowerCase();
  let count = journalists.filter(j => {
    let journalistCountry = (j.country || "").trim().toLowerCase();
    return journalistCountry === countryLower;
  }).length;

  counter.textContent = count;
  container.style.display = "flex";
}


// aggiorna la visibilità in base a selectedCountry
function updateDotsVisibility() {
  if (!dots) return;

  let sel = selectedCountry ? selectedCountry.trim().toLowerCase() : null;

  dots.forEach(d => {
    let dotCountry = (d.country || "").trim().toLowerCase();
    if (!sel) {
      // nessun paese selezionato - mostra tutti i pallini normalmente
      d.visible = true;
      d.dimmed = false;
    } else {
      // paese selezionato - mostra solo i pallini di quel paese
      d.visible = dotCountry === sel;
      d.dimmed = !d.visible;
    }
  });

  console.log("Filter:", selectedCountry, "Visible dots:", dots.filter(d => d.visible).length);
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

  // crea lista paesi unici
  for (let i = 0; i < nRows; i++) {
    let country = (data.get(i, "country") || "").trim();
    if (country && !countries.includes(country)) {countries.push(country)};
  }
  countries.sort((a, b) => a.localeCompare(b));

  // popola pannello paesi
  populateCountryPanel();

  let counterContainer = document.getElementById("death-counter-container");
  let counter = document.getElementById("death-counter");

  counter.textContent = "";
  counterContainer.style.display = "none";


  // bottone worldwide → reset filtro + input di ricerca
  let worldwideBtn = document.getElementById("worldwide-btn");
  worldwideBtn.addEventListener("click", () => {
    
    let panel = document.getElementById("filter-panel");
    let counterContainer = document.getElementById("death-counter-container");

    // se c'è un paese selezionato resetta a WORLDWIDE
    if(selectedCountry) {
      selectedCountry = null; // reset filtro
      worldwideBtn.textContent = "WORLDWIDE ⌵";

      // nasconde il contatore
      counterContainer.style.display = "none";

      // mostra tutti i pallini
      updateDotsVisibility();
    }

        // se già c'è un input lo rimuove e ripristina il bottone
    let existingInput = document.getElementById("search-input");
    if (existingInput) {
      existingInput.replaceWith(worldwideBtn);
    }
    
    // nasconde pannello paesi
    panel.style.display = "none";
    
    // crea input di ricerca
    let input = document.createElement("input");
    input.type = "text";
    input.id = "search-input";
    input.placeholder = "Search country..."; 
    
    // copia stile dal bottone
    input.style.cssText = worldwideBtn.style.cssText;
    input.style.width = worldwideBtn.offsetWidth + "px";
    input.style.height = worldwideBtn.offsetHeight + "px";
    
    // stili imput
    input.style.color = "white";
    input.style.textAlign = "center";
    input.style.fontFamily = "'JetBrains Mono', monospace";
    input.style.fontSize = "16px";
    input.style.backgroundColor = "#191919";
    input.style.border = "2px solid red";
    input.style.borderRadius = "60px";
    input.style.padding = "12px 28px";
    input.style.boxSizing = "border-box";
    input.style.cursor = "text";
    
    // sostituisce bottone con input
    worldwideBtn.replaceWith(input);
    
    // mostra pannello con tutti i paesi
    panel.style.display = "flex";
    panel.style.maxHeight = "200px"; // altezza x scroll
    
    // filtro mentre si digita
    input.addEventListener("input", (e) => {
      e.stopPropagation();
      let query = input.value.toLowerCase().trim();
      let options = panel.querySelectorAll(".country-option");
      
      options.forEach(opt => {
        if (query === "") {
          // se la ricerca è vuota mostra tutti i paesi
          opt.style.display = "flex";
        } else {
          // mostra solo i paesi che corrispondono alla ricerca
          opt.style.display = opt.textContent.toLowerCase().includes(query) ? "flex" : "none";
        }
      });
    });
    
    input.focus();
    
    // torna al bottone quando si perde focus o quando si seleziona un paese
    input.addEventListener("blur", () => {
      setTimeout(() => {
        let currentInput = document.getElementById("search-input");
        if (currentInput) {
          currentInput.replaceWith(worldwideBtn);
          panel.style.display = "none";
        }
      }, 200);
    });
    
    // previene chiusura quando si clicca nel pannello
    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // chiude pannello se si clicca fuori
  document.addEventListener('click', (e) => {
    let panel = document.getElementById("filter-panel");
    let worldwideBtn = document.getElementById("worldwide-btn");
    let searchInput = document.getElementById("search-input");
    
    if (!panel.contains(e.target) && 
        !worldwideBtn.contains(e.target) && 
        !(searchInput && searchInput.contains(e.target))) {
      panel.style.display = "none";
      
      // se c'è un input di ricerca ripristina il bottone
      if (searchInput) {
        searchInput.replaceWith(worldwideBtn);
      }
    }
  });

  inVisualizationArea = true;
}

function draw() {
  background(25);

  // disegna sempre la griglia completa ma controlla cosa rendere visibile in base allo step
  updateVisualization();
  drawGridWithSteps();

  if (inVisualizationArea) {
    spawnUpToCurrentYear();
  }

  // reset hover e cursore
  cursor(ARROW);
  for (let d of dots) d.hover = false;

  // hover
  let hoveredDot = null;
  for (let d of dots) {
    if (d.visible && d.isHovered()) {
      hoveredDot = d;
      d.hover = true;
      cursor(HAND); // cambia cursore se il mouse è sopra
      break; // considera un dot alla volta
    }
  }

  for (let d of dots) {
    if (d.visible) {
      d.update();
    }
  }

  applyRepulsion();

  // disegna la card se activeCard è vero (cioè quando si clicca su un dot)
  if (activeCard) {
    drawCard(activeCard);
  }
}

function mousePressed() {
   for (let d of dots) {

    // se è dimmed (cioè non è del paese selezionato), ignora l'interazione
    if (d.dimmed) continue;

    if (d.isHovered()) {
      activeCard = d;
    }
    }

  // chiude la card quando si clicca sulla x
  if(closeCard){
    activeCard = null;
    closeCard = null;
    cursor(ARROW);
    hasLoadedPhoto = null;
  }

  // aprire la pagina di cpj quando si preme su DISCOVER MORE nella card
  if(cpjButtonHover){
    window.open(cpjUrl);
    cpjButtonHover = null;
  }
}

/* funzione che disegna la card, per farla funzionare ci sono:
 - delle variabili globali dichiarate all'inizio
 - dei cicli if nella funzione mousePressed()
 - un richiamo della funzione dentro draw() */
function drawCard(dot){
  let journalist = journalists[dot.id];

  let id = journalist.id;
  let name = journalist.name;
  let date = journalist.date;
  let ambiguous, dateIcon; // tooltip x data di morte certa o no
  if(!journalist.ambiguousEntryDate){
    dateIcon = "tick";
    ambiguous = "The date\nis confirmed";
  }else{
    dateIcon = "?";
    ambiguous = "The date is ambiguous. Plausible dates: " + journalist.ambiguousEntryDate;
  }
  let place = journalist.city + ", " + journalist.country;
  if(journalist.country == "Israel and the Occupied Palestinian Territory"){
    place = journalist.city + ", Palestine";
  }
  let org;
  if(journalist.organization !== ""){
    org = journalist.organization;
  }else{
    org = "Unknown";
  }
  let job = journalist.job;
  if(journalist.job !== ""){
    job = journalist.job;
  }else{
    job = "Unknown";
  }
  let workRelated = journalist.workRelated;
  let typeOfDeath;
  if(journalist.typeOfDeath !== ""){
    typeOfDeath = journalist.typeOfDeath;
  }else{
    typeOfDeath = "Unknown";
  }
  let threatened, tortured, heldCaptive;
  if(journalist.threatened !== ""){
    threatened = journalist.threatened;
  }else{
    threatened = "Unknown";
  }
  if(journalist.tortured !== ""){
    tortured = journalist.tortured;
  }else{
    tortured = "Unknown";
  }
  if(journalist.heldCaptive !== ""){
    heldCaptive = journalist.heldCaptive;
  }else{
    heldCaptive = "Unknown";
  }
  let impunity = journalist.impunity;
  let url = journalist.url;
  let photoCredit = journalist.photoCredit;

  // sfondo che oscura il grafico
  noStroke();
  fill(0,0,0,175);
  rectMode(CORNER);
  rect(0,0, width, height);

  // CARD

  //variabili dimensioni
  let cardWidth = 700;
  let cardHeight = 572;
  let cardX = width/2;
  let cardY = height/2;
  let padding = 30;
  let leftX = cardX - cardWidth/2 + padding;
  let topY = cardY - cardHeight/2 + padding;
  let rightX = cardX + cardWidth/2 - padding;
  let bottomY = cardY + cardHeight/2 - padding;

  let bg = color(19,19,19);
  let grey = color(38,38,38);

  // rettangolo base
  stroke(grey);
  strokeWeight(2);
  fill(bg);
  rectMode(CENTER);
  rect(cardX, cardY, cardWidth, cardHeight, 20);

  //foto

  let photoWidth = 180;
  let photoHeight = 190;

  // carica la foto una volta sola
  if(!hasLoadedPhoto){
    photo = loadImage("assets/images/" + (id + 1) + ".jpg");
    hasLoadedPhoto = true;
  }

  imageMode(CORNER);

  // foto di default

  image(defaultPhoto, leftX, topY, photoWidth, photoHeight);

  // maschera rettangolare con gli angoli arrotondati 
  drawingContext.save();

  // rettangolo arrotondato come maschera per le foto

  let radius = 5;
  drawingContext.beginPath();
  drawingContext.moveTo(leftX + radius, topY);
  drawingContext.lineTo(leftX + photoWidth - radius, topY);
  drawingContext.quadraticCurveTo(leftX + photoWidth, topY, leftX + photoWidth, topY + radius);
  drawingContext.lineTo(leftX + photoWidth, topY + photoHeight - radius);
  drawingContext.quadraticCurveTo(leftX + photoWidth, topY + photoHeight, leftX + photoWidth - radius, topY + photoHeight);
  drawingContext.lineTo(leftX + radius, topY + photoHeight);
  drawingContext.quadraticCurveTo(leftX, topY + photoHeight, leftX, topY + photoHeight - radius);
  drawingContext.lineTo(leftX, topY + radius);
  drawingContext.quadraticCurveTo(leftX, topY, leftX + radius, topY);
  drawingContext.closePath();
  drawingContext.clip();

  if (photo.width >= photo.height) {
    image(photo, leftX, topY, photoHeight * (photo.width/photo.height), photoHeight);
  } else {
    image(photo, leftX, topY, photoWidth, photoWidth * (photo.height/photo.width));
  }
  
  drawingContext.restore();


  // x che chiude la card
  noFill();
  stroke(red);
  let crossWidth = 16;
  line(rightX - crossWidth, topY, rightX, topY + crossWidth);
  line(rightX, topY, rightX - crossWidth, topY + crossWidth);
  let crossCenterX = rightX - crossWidth/2;
  let crossCenterY = topY + crossWidth/2;
  let d = dist(mouseX, mouseY, crossCenterX, crossCenterY);
  if(d <= crossWidth){
    closeCard = true;
    cursor(HAND);
  }else{
    closeCard = null;
    cursor(ARROW);
  }

  // grafica

  let verticalOffset = 40;

  noFill();
  stroke(red);
  strokeWeight(0.5);
  line(leftX + photoWidth + padding, topY + 80, leftX + cardWidth - 2*padding, topY + 80); //nome
  line(leftX + photoWidth + padding, topY + 80 + 50, rightX - 40 - 20, topY + 80 + 50); //data
  line(leftX + photoWidth + padding, topY + 80 + 97, leftX + cardWidth - 2*padding, topY + 80 + 97); //luogo
  rectMode(CORNER);
  fill(grey);
  rect(leftX, topY + photoHeight + padding, cardWidth - 2*padding, 3*padding + 40, 3);
  noFill();
  line(width/2 + verticalOffset, topY + photoHeight + padding, width/2 + verticalOffset, topY + photoHeight + padding + 3*padding + 40); //divisore verticale
  line(leftX + padding, topY + photoHeight + 2*padding + 15, width/2 + verticalOffset - padding, topY + photoHeight + 2*padding + 15); //org
  line(leftX + padding, topY + photoHeight + 3*padding + 37, width/2 + verticalOffset - padding, topY + photoHeight + 3*padding + 37); //job
  line(width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 15, rightX - padding, topY + photoHeight + 2*padding + 15); //work-related
  line(width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 37, rightX - padding, topY + photoHeight + 3*padding + 37); //type of death
  rectMode(CORNERS);
  rect(leftX, topY + photoHeight + 5*padding + 40, width/2 + verticalOffset, bottomY, 3); //per il violation status
  line(leftX, topY + photoHeight + 6*padding + 54, width/2 + verticalOffset, topY + photoHeight + 6*padding + 54);
  line(leftX, topY + photoHeight + 7*padding + 54 + 14, width/2 + verticalOffset, topY + photoHeight + 7*padding + 54 + 14);
  line(leftX + 200, topY + photoHeight + 5*padding + 40, leftX + 200, bottomY);
  line(width/2 + verticalOffset + padding, topY + photoHeight + 6*padding + 54, rightX, topY + photoHeight + 6*padding + 54); //impunity
  fill(red_translucent);
  stroke(red);
  strokeWeight(2);
  rect(width/2 + verticalOffset + padding, bottomY - padding - 14, rightX, bottomY, 100); //sfondo del bottone

  // icona e tooltip per la data
  noStroke();
  circle(rightX - 20, topY + 80 + 40, 40);
  if(dateIcon == "tick"){
    imageMode(CENTER);
    image(tickIcon, rightX - 20, topY + 80 + 40, 40, 40);
  }else{
    noStroke();
    fill(red);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("?", rightX - 20, topY + 80 + 43);
  }

  // tooltip
  let dDate = dist(mouseX, mouseY, rightX - 20, topY + 80 + 40);
  if(dDate <= 20){
    fill(bg);
    rectMode(CORNER);
    let rectHeight = 120;
    let rectWidth = 160;
    rect(rightX + 2*padding, topY + 80 + 40 - rectHeight/2, rectWidth, rectHeight, 10);
    fill(white);
    textAlign(LEFT, CENTER);
    textSize(14);
    text(ambiguous, rightX + 2*padding + padding/2, topY + 80 + 40, rectWidth - padding/2);
  }

  // etichette
  fill(red);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(13);
  text("Name", leftX + photoWidth + padding, topY + 83);
  text("Date of death", leftX + photoWidth + padding, topY + 132);
  text("Place of death", leftX + photoWidth + padding, topY + 127 + 52);
  text("Organization", leftX + padding, topY + photoHeight + 2*padding + 20);
  text("Job", leftX + padding, topY + photoHeight + 3*padding + 40);
  text("Work-related", width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 18);
  text("Type of death", width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 40);
  text("Murderer's impunity", width/2 + verticalOffset + padding, topY + photoHeight + 6*padding + 56);

  textSize(14);
  textAlign(LEFT, BOTTOM);
  text("Threatened", leftX + padding, topY + photoHeight + 5.5*padding + 54);
  text("Tortured", leftX + padding, topY + photoHeight + 6.5*padding + 54 + 14);
  text("Held captive", leftX + padding, topY + photoHeight + 7.5*padding + 54 + 28);

  // testi
  textAlign(LEFT, BOTTOM);
  textFont(font);
  textWrap(WORD);
  fill(white);
  noStroke();

  textSize(35);
  textLeading(37);
  text(name, leftX + photoWidth + padding, topY + 80, cardWidth - 3*padding - photoWidth);

  textSize(20);
  textLeading(22);
  text(date, leftX + photoWidth + padding, topY + 127, cardWidth - 3*padding - photoWidth);
  text(impunity, width/2 + verticalOffset + padding, topY + photoHeight + 6*padding + 54);
  if(textWidth(place) < cardWidth - 3*padding - photoWidth){
    text(place, leftX + photoWidth + padding, topY + 127 + 47);
  }else{
    textSize(16);
    textLeading(18);
    text(place, leftX + photoWidth + padding, topY + 127 + 47, cardWidth - 3*padding - photoWidth);
  }
  if(textWidth(org) < 340){
    textSize(20);
    textLeading(22);
    text(org, leftX + padding, topY + photoHeight + 2*padding + 15);
  }else{
    textSize(14);
    textLeading(16);
    text(org, leftX + padding, topY + photoHeight + 2*padding + 15, 340);
  }

  textSize(14);
  textLeading(16);
  text(job, leftX + padding, topY + photoHeight + 3*padding + 35, 350);
  text(workRelated, width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 13);
  text(typeOfDeath, width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 35);
  text(threatened, leftX + padding + 200, topY + photoHeight + 5.5*padding + 54);
  text(tortured, leftX + padding + 200, topY + photoHeight + 6.5*padding + 54 + 14);
  text(heldCaptive, leftX + padding + 200, topY + photoHeight + 7.5*padding + 54 + 28);

  //photo credit
  textSize(9);
  textLeading(9);
  textAlign(LEFT, TOP);
  text(photoCredit, leftX, topY + photoHeight + 5, photoWidth);

  // bottone discover more
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text("DISCOVER MORE", (width/2 + verticalOffset + padding + rightX)/2 + 20, bottomY - padding/2);

  imageMode(CENTER);
  image(cpjLogo, width/2 + verticalOffset + 3*padding, bottomY - 22, 36, 36);

  // ciclo if che fa aprire la pagina di cpj
  if(mouseX > width/2 + verticalOffset + padding && mouseX < rightX && mouseY > bottomY - padding - 14 && mouseY < bottomY){
    cpjButtonHover = true;
    cpjUrl = url;
    cursor(HAND);
  }else{
    cpjButtonHover = null;
  }

}