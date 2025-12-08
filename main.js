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

/* 1. PRESENTAZIONE GRAFICO -- FATTO

    1.1 FUNZIONE CHE FA COMPARIRE I TESTI DI GRAPH-EXPLAINED

    1.2 FUNZIONE CHE FA APPARIRE IL GRAFICO UNO STEP ALLA VOLTA

      le due funzioni vanno combinate insieme in modo che siano coordinate in
      questo ordine:
        - categorie (sono già presenti) + id="explanation-categories"
        - timeline + id="explanation-timeline"
        - inzia l'animazione della cascata + id="explanation-dot"
        - la cascata continua (non viene toccata) + id="explanation-closure" 
        
      dopo il click su next-arrow-closure, sparisce tutto graph-explained */


/* 2. SPIEGAZIONE DEI PICCHI -- FATTO

    2.1 FUNZIONE CHE FA COMPARIRE I TESTI DI CONFLICTS

    2.2 FUNZIONE CHE EVIDENZIA I PALLINI RELATIVI AL CONFLITTO

      le due funzioni vanno combinate insieme in modo che siano coordinate in
      questo ordine:
        - id="intro-first-paragraph"
        - id="intro-second paragraph"
        - let highlightMaguindanao = true + id="conflicts-philippines" (al click su next-arrow-philippines let highlightMaguindanao torna false)
        - let highlightPalestina = true + id="conflicts-palestine" (al click su next-arrow-palestine let highlightPalestina torna false)
        - let highlightIraq = true + id="conflicts-iraq" (al click su next-arrow-iraq let highlightIraq torna false)
        - let highlightUncertain = true + let highlightUnknown = true + id="without-perpetrators-intro" (al click su next-arrow-without-perpetrators let highlightUnknown torna false)
        - let highlightUncertain = true (lo era già) + id="section-uncertain" (al click su next-arrow-uncertain let highlightUncertain torna false)
        - let highlightUnknown = true + id="section-unknown" (al click su next-arrow-unknown tutte le variabili highlight tornano false)*/

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
        
        default:
          // tutti gli highlight si resettano
          break;
    }
}


/* 3. FILTRO X PAESE

    3.1 FUNZIONE CHE FA COMPARIRE I TESTI DI COUNTRY-INTRO -- FATTO

    3.2 FUNZIONE CHE FA APPARIRE FILTER-CONTAINER, ACCORDION E OTHER-VISUALIZATION WRAPPER QUANDO SI CLICCA NEXT-ARROW-COUNTRY-INTRO

    3.3 FUNZIONE CHE FA FUNZIONARE IL FILTRO*/


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
        setTimeout(type, speed);
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
    } else {
        graphExplainedMode = false; // esci dalla modalità grafico
    }

    // nasconde tutte le sezioni
    globalSteps.forEach(id => {
        let el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // mostra la sezione corretta
    let active = document.getElementById(globalSteps[step]);
    if (active) {
        active.style.display = "flex";

        let bodyEl = active.querySelector(".section-body");
        if (bodyEl) typeWriter(bodyEl, 20);
    }

    // da qui in poi puoi iniettare i tuoi boolean flags del grafico
    handleConflictsFlags(step);
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

        // 1. Nasconde country-intro
        const countryIntro = document.getElementById("country-intro");
        countryIntro.style.display = "none";

        // 2. Mostra filter-container
        const filterContainer = document.getElementById("filter-container");
        filterContainer.style.display = "flex";
        filterContainer.style.opacity = "1";

        // 3. Mostra impunity-status-wrapper
        const impunityWrapper = document.getElementById("impunity-status-wrapper");
        impunityWrapper.style.display = "flex";
        impunityWrapper.style.opacity = "1";
    });



}


window.addEventListener("load", () => {
    setupGraphExplainedNavigation();
    setupConflictsNavigation();
    activateGlobalStep(0); // parte da explanation-categories
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

    let workRelated = "Unknown";
    if(row.get("confirmed work related or unconfirmed (may be work related)") == "Journalist - Confirmed"){
      workRelated = "Confirmed";
    }
    if(row.get("confirmed work related or unconfirmed (may be work related)") == "Journalist - Unconfirmed"){
      workRelated = "Unconfirmed";
    }
    if(row.get("confirmed work related or unconfirmed (may be work related)") == "Media Worker"){
      workRelated = "Media Worker";
    }

    let journalist = {
      id: j,
      year: year,
      date: row.get("entry_date"),
      ambiguousEntryDate: row.get("ambiguous_entry_date"),
      category: row.get("source_of_fire") || "Unknown",
      name: row.get("journalist/media worker_name") || "",
      country: row.get("country") || "",
      motive: row.get("motive") || "",
      role: row.get("role") || "",
      city: row.get("city") || "",
      typeOfDeath: row.get("type_of_death"),
      impunity: row.get("impunity") || "",
      organization: row.get("organization"),
      medium: row.get("mediums") || "",
      beats: row.get("beats_covered") || "",
      job: row.get("job") || "",
      url: row.get("cpj.org_url") || "",
      workRelated: workRelated,
      threatened: row.get("threatened") || "Unknown",
      tortured: row.get("tortured") || "Unknown",
      heldCaptive: row.get("held_captive") || "Unknown"
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
  if (!graphExplainedMode || graphExplainedStep < 2) return; 

  if (!years.length || currentYearIndex >= years.length) return;

  let yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  let maxSpawnPerFrame = 10;

  for (let j of journalists) {
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

  inVisualizationArea = false;

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
      }
      break;

    case 3: // animazione continua
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true;
      animationStarted = true;
      break;

    // highlight step
    case 4: 
      showYAxis = true;
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightMaguindanao = true; 
    break;

    case 5: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightPalestina = true; 
    break;

    case 6: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightIraq = true; 
    break;

    case 7: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUncertain = true; 
      highlightUnknown = true; 
    break;
    
    case 8: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUncertain = true; 
    break;
    
    case 9: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
      highlightUnknown = true; 
    break;

    case 10: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
    break;
    
    case 11: 
      showYAxis = true; 
      showXAxis = true; 
      showGridLines = true; 
      inVisualizationArea = true; 
    break;
  }

}


/*
function showAllDotsImmediately() {
  for (let j of journalists) {
    if (!spawnedIds.has(j.id)) {
      let dot = new Dot(j.id, j.year, j.category);
      dots.push(dot);
      spawnedIds.add(j.id);
      dot.arrived = true; // piazza subito i pallini mancanti
    }
  }
  animationCompleted = true; // marca l’animazione come completata
  showAllDots = false;
} */

//crea pallini
class Dot {
  constructor(id, year, category) {
    this.id = id;
    this.year = year;
    this.category = category;
    this.country = journalists[id] ? journalists[id].country : "";

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
    this.speed = random(8, 10);
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
    if (selectedCountry && this.country !== selectedCountry) return;

    let dotColor = color(255);

    if (highlightMaguindanao && this.year === 2009 && this.category === "Government Officials")
      dotColor = color(255, 0, 0);

    if (highlightPalestina && this.year === 2023 && this.category === "Military Officials")
      dotColor = color(255, 0, 0);

    if (highlightIraq && this.year === 2006 && this.category === "Political Group")
      dotColor = color(255, 0, 0);

    if (highlightUncertain && highlightUnknown)
      dotColor = (this.category === "Uncertain" || this.category === "Unknown" || this.category === "Multiple") ? color(255) : color(150);

    else if (highlightUncertain)
      dotColor = this.category === "Uncertain" ? color(255, 0, 0) : color(150);

    else if (highlightUnknown)
      dotColor = (this.category === "Unknown" || this.category === "Multiple") ? color(255, 0, 0) : color(150);

    if (currentStep === 10)
      dotColor = color(150);

    //quando il pallino è in hover
    if(this.hover) {
      //diventa rosso e si ingrandisce
      noStroke();
      fill(255, 0, 0);
      ellipse(this.pos.x, this.pos.y, this.r * 3);
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

// conteggio vittime
function updateDeathCounter(country) {
  let counter = document.getElementById("death-counter");
  
  let count = 0;
  for (let i = 0; i < data.getRowCount(); i++) {
    if (data.get(i, "country") === country) {
      count++;
    }
  }
  
  counter.textContent = count;
}


//funzione che disegna la card, per farla funzionare ci sono:
// - delle variabili globali dichiarate all'inizio
// - dei cicli if() nella funzione mousePressed()
// - un richiamo della funzione dentro draw()

function drawCard(dot){
  let journalist = journalists[dot.id];

  //Imposto tutte le variabili con le informazioni sul giornalista per la card
  let id = journalist.id;
  let name = journalist.name;
  let date = journalist.date;
  let ambiguous, dateIcon; //Queste variabili servono per mettere un'icona e un tooltip che spiega se la data è certa o meno
  if(!journalist.ambiguousEntryDate){
    dateIcon = "tick";
    ambiguous = "The date\nis confirmed";
  }else{
    dateIcon = "?";
    ambiguous = "The date is ambiguous. Plausible dates: " + journalist.ambiguousEntryDate;
  }
  let place = journalist.city + ", " + journalist.country;
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

  //fondo nero trasparente che oscura il grafico
  noStroke();
  fill(0,0,0,175);
  rectMode(CORNER);
  rect(0,0, width, height);

  // DISEGNO LA CARD

  //variabili per le dimensioni
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

  //rettangolo di base
  stroke(grey);
  strokeWeight(2);
  fill(bg);
  rectMode(CENTER);
  rect(cardX, cardY, cardWidth, cardHeight, 20);

  //--------------------------- FOTO ---------------------------

  let photoWidth = 180;
  let photoHeight = 190;

  //Serve memorizzare se la foto è stata caricata e fare un ciclo if in modo che la foto viene caricata una volta sola
  if(!hasLoadedPhoto){
    photo = loadImage("assets/images/" + (id + 1) + ".jpg");
    hasLoadedPhoto = true;
  }

  imageMode(CORNER);

  //Disegno la foto di default in modo che
  // - se esiste la foto del giornalista viene disegnata sopra e copre quella di default
  // - se non esiste la foto del giornalista non viene disegnato nulla sopra quella di default e si vede quella
  image(defaultPhoto, leftX, topY, photoWidth, photoHeight);

  //tutte ste righe servono per fare una maschera rettangolare con gli angoli arrotondati in modo che:
  // - se la foto non ha il formato giusto non serve deformarla perchè tanto l'eccesso viene mascherato
  // - ci sono gli angoli arrotondati :)
  drawingContext.save(); // salva lo stato del canvas

  // crea un rettangolo arrotondato come maschera per le foto
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

  // disegna l'immagine nel rettangolo
  if (photo) {
    image(photo, leftX, topY, photoHeight * (photo.width/photo.height), photoHeight);
  } else {
    rect(leftX, topY, photoWidth, photoHeight, radius);
  }
  
  drawingContext.restore(); // rimuove il clipping


  //--------------------------- X PER CHIUDERE LA CARD ---------------------------
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

  //--------------------------- GRAFICA DELLA CARD ---------------------------

  let verticalOffset = 40; // quanto la linea verticale che divide il rettangolo centrale è spostata rispetto al centro della card

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
  line(leftX + padding, topY + photoHeight + 2*padding + 20, width/2 + verticalOffset - padding, topY + photoHeight + 2*padding + 20); //org
  line(leftX + padding, topY + photoHeight + 3*padding + 37, width/2 + verticalOffset - padding, topY + photoHeight + 3*padding + 37); //job
  line(width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 20, rightX - padding, topY + photoHeight + 2*padding + 20); //work-related
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

  //icona e tooltip per la data
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

  //tooltip
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

  //Etichette
  fill(red);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  text("Name", leftX + photoWidth + padding, topY + 83);
  text("Date of death", leftX + photoWidth + padding, topY + 132);
  text("Place of death", leftX + photoWidth + padding, topY + 127 + 52);
  text("Organization", leftX + padding, topY + photoHeight + 2*padding + 25);
  text("Job", leftX + padding, topY + photoHeight + 3*padding + 40);
  text("Work-related", width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 23);
  text("Type of death", width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 40);
  text("Murderer's impunity", width/2 + verticalOffset + padding, topY + photoHeight + 6*padding + 56);

  textSize(14);
  textAlign(LEFT, BOTTOM);
  text("Threatened", leftX + padding, topY + photoHeight + 5.5*padding + 54);
  text("Tortured", leftX + padding, topY + photoHeight + 6.5*padding + 54 + 14);
  text("Held captive", leftX + padding, topY + photoHeight + 7.5*padding + 54 + 28);

  //--------------------------- TESTI DELLA CARD ---------------------------
  
  textAlign(LEFT, BOTTOM);
  textFont(font);
  textWrap(WORD);
  fill(white);
  noStroke();

  textSize(35);
  text(name, leftX + photoWidth + padding, topY + 80, cardWidth - 3*padding - photoWidth);

  textSize(20);
  text(date, leftX + photoWidth + padding, topY + 127, cardWidth - 3*padding - photoWidth);
  text(place, leftX + photoWidth + padding, topY + 127 + 47, cardWidth - 3*padding - photoWidth);
  text(org, leftX + padding, topY + photoHeight + 2*padding + 20);
  text(impunity, width/2 + verticalOffset + padding, topY + photoHeight + 6*padding + 54);

  textSize(14);
  text(job, leftX + padding, topY + photoHeight + 3*padding + 35, 350);
  text(workRelated, width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 18);
  text(typeOfDeath, width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 35);
  text(threatened, leftX + padding + 200, topY + photoHeight + 5.5*padding + 54);
  text(tortured, leftX + padding + 200, topY + photoHeight + 6.5*padding + 54 + 14);
  text(heldCaptive, leftX + padding + 200, topY + photoHeight + 7.5*padding + 54 + 28);

  //Bottone Discover more
  textAlign(CENTER);
  text("DISCOVER MORE", (width/2 + verticalOffset + padding + rightX)/2 + 20, bottomY - padding/2);

  imageMode(CENTER);
  image(cpjLogo, width/2 + verticalOffset + 3*padding, bottomY - 22, 37, 37);

  //Praticamente quando l'utente fa hover cpjButtonHover diventa true e in mousePressed() c'è una condizione:
  //Se cpjButtonHover è vera e l'utente clicca si apre la pagina di CPJ
  if(mouseX > width/2 + verticalOffset + padding && mouseX < rightX && mouseY > bottomY - padding - 14 && mouseY < bottomY){
    cpjButtonHover = true;
    cpjUrl = url;
    cursor(HAND);
  }else{
    cpjButtonHover = null;
  }

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

  // ordina i paesi alfabeticamente
  countries.sort((a, b) => a.localeCompare(b));


  inVisualizationArea = true;

  //cliccando su source of fire va alla pagina con i pallini disposti
  let urlParams = new URLSearchParams(window.location.search);
  let isDirectMode = urlParams.get('direct') === 'true';
}

function draw() {
  background(25);

  //disegna sempre la griglia  completa
  //ma controlla cosa rendere visibile in base allo step
  updateVisualization();
  drawGridWithSteps();

  if(inVisualizationArea) {
    spawnUpToCurrentYear();
  }

  for (let d of dots) {
    d.update();
  }
  
  applyRepulsion();

  //Disegna la card se activeCard è vero (cioè quando si preme su un pallino)
  if (activeCard) {
    drawCard(activeCard);
  }

  //pallino in hover
  let hoveredDot = null;

  //reset
  for(let d of dots) d.hover = false;

  //trova dot in hover
  for(let d of dots) {
    if(d.isHovered()) {
      hoveredDot = d;
      d.hover = true;
      break;
    }
  }
}


/*//applica campo di forze
function applyForceTo(dot, force) {
  let f = p5.Vector.div(force, dot.mass);
  dot.acc.add(f);
}

//applica campo di forze
function applyRepulsion() {
  let minDist = diam * 3;
  let strength = 6.0;

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

        dots[i].pos.x = constrain(dots[i].pos.x, minX, maxX);
        dots[j].pos.x = constrain(dots[j].pos.x, minX, maxX);
      }
    }
  }
}*/

function mousePressed() {
  for (let d of dots) {

    // se c'è un filtro per paese, ignora i pallini nascosti
    if (selectedCountry && d.country !== selectedCountry) continue;

    if (d.isHovered()) {
      activeCard = d;
    }
  }

  //Condizione per chiudere la card quando si preme sulla croce
  if(closeCard){
    activeCard = null;
    closeCard = null;
    cursor(ARROW);
    hasLoadedPhoto = null;
  }

  //Condizione per aprire la pagina di cpj quando si preme su DISCOVER MORE nella card
  if(cpjButtonHover){
    window.open(cpjUrl);
    cpjButtonHover = null;
  }
}