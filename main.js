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

let activeCard = null; //variabile che stabilisce se/quale card mostrare
let closeCard = null;
let photos = []; //conterrà le foto per le card

//variabili per la navigazione
let currentStep = 0;
const totalSteps = 12;
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
let highlightNone = false;



// funzione barra di ricerca tutta da fare

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");

  console.log("Row count: " + data.getRowCount());
  // carica tutte le foto dei giornalisti
  for (let i = 0; i < data.getRowCount(); i++) {
    photos[i] = loadImage("assets/images/" + i + ".jpg");
  }
  console.log("photos " + photos);
}

/* 1. PRESENTAZIONE GRAFICO

    1.1 FUNZIONE CHE FA COMPARIRE I TESTI DI GRAPH-EXPLAINED

    1.2 FUNZIONE CHE FA APPARIRE IL GRAFICO UNO STEP ALLA VOLTA

      le due funzioni vanno combinate insieme in modo che siano coordinate in
      questo ordine:
        - categorie (sono già presenti) + id="explanation-categories"
        - timeline + id="explanation-timeline"
        - inzia l'animazione della cascata + id="explanation-dot"
        - la cascata continua (non viene toccata) + id="explanation-closure" 
        
      dopo il click su next-arrow-closure, sparisce tutto graph-explained */


/* 2. SPIEGAZIONE DEI PICCHI

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


/* 3. FILTRO X PAESE

    3.1 FUNZIONE CHE FA COMPARIRE I TESTI DI COUNTRY-INTRO

    3.2 FUNZIONE CHE FA APPARIRE FILTER-CONTAINER, ACCORDION E OTHER-VISUALIZATION WRAPPER QUANDO SI CLICCA NEXT-ARROW-COUNTRY-INTRO

    3.3 FUNZIONE CHE FA FUNZIONARE IL FILTRO*/


/* FUNZIONI IMPORTANTI DA TENERE A MENTE X IL MERGE:
  - drawXAxis + drawYAxis
  - drawCategoryLines
  - drawGrid
  - buildJournalistsFromTable
  - yearToX + categoryToY
  - spawnUpToCurrentYear
  - applyForceTo + applyRepulsion
  - updateVisualization
  - updateDeathCounter
  - drawCard
  - mousePressed
*/

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
}

// conteggio vittime
function updateDeathCounter(country) {
  const counter = document.getElementById("death-counter");
  
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
    let yLabelOffset = 12; //quanto spostare a sx le etichette
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

 // etichette ogni 5 anni con pallino 
for (let i = 0; i <= ceil((2025 - 1992) / 5); i++) {
  let label = 1992 + i * 5;
  let x = initialX + (label - 1992) * yearWidth;

  // Testo anno
  fill(white);
  noStroke();
  textFont(font);
  textAlign(CENTER, TOP);
  textSize(12);
  text(label, x, height - padding - 32);

  // Pallino semplice (senza glow)
  let yPallino = height - padding - 45;
  let radius = 8;

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

  if (showYAxis) {
    drawYAxis();
  }
  
  if (showXAxis) {
    drawXAxis();
  }
  
  if (showGridLines) {
    drawCategoryLines();
  }

  // Se animationStarted è true, disegna la griglia completa
  if (animationStarted && showGridLines) {
    drawGrid(); // Questa disegna la griglia completa con etichette, assi, ecc.
  }


  if(inVisualizationArea) {
    spawnUpToCurrentYear();
  }

  for(let i = 0; i < dots.length; i++) {
    dots[i].update();
  }

  applyRepulsion();

  for (let d of dots) d.update();


  if (activeCard) {
    drawCard(activeCard);
  }

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

    // PHILIPPINES
    if(highlightMaguindanao && this.year === 2009 && this.category === "Government Officials") {
      dotColor = color(255, 0, 0);
    }

    // PALESTINE
    if(highlightPalestina && this.year === 2023 && this.category === "Military Officials") {
      dotColor = color(255, 0, 0);
    }

    // IRAQ
    if(highlightIraq && this.year === 2006 && this.category === "Political Group") {
      dotColor = color(255, 0, 0);
    }

    // WITHOUT PERPETRATORS (UNCERTAIN + UNKNOWN)
    if(currentStep === 7) {
      if(this.category === "Uncertain" || this.category === "Unknown") {
        dotColor = color(255);
      } else {
        dotColor = color(150);
      }
    }

    // UNCERTAIN
    if(currentStep === 8) {
      if(this.category === "Uncertain") {
        dotColor = color(255, 0, 0);
      } else {
        dotColor = color(150);
      }
    }

    // UNKNOWN
    if(currentStep === 9) {
      if(this.category === "Unknown") {
        dotColor = color(255, 0, 0);
      } else {
        dotColor = color(150);
      }
    }

    // NESSUNO SELEZIONATO
    if(currentStep === 10) {
      dotColor = color(150);
    }

    // TUTTI SELEZIONATI

    fill(dotColor);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
     
   // controlla se il pallino deve essere visibile
  let visible = !selectedCountry || this.country === selectedCountry;
  if (!visible) return;

  // colore in base al filtro
  if (selectedCountry) {
    fill(255, 0, 0); // rosso se c'è filtro
  } else {
    fill(255); // bianco se worldwide
  }

  noStroke();
  ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  //funzione che restituisce true se il mouse è sul pallino
  isHovered() {
  let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
  return d < this.r;
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


  if(!years.length || currentYearIndex >= years.length) {
    return;
  }


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

function mousePressed() {
  for (let d of dots) {

    // se c'è un filtro per paese, ignora i pallini nascosti:
    if (selectedCountry && d.country !== selectedCountry) continue;

    if (d.isHovered()) {
      activeCard = d;
    }
  }

  if(closeCard){
    activeCard = null;
    closeCard = null;
    cursor(ARROW);
  }
}

function drawCard(dot){
  let journalist = journalists[dot.id];

  //Imposto tutte le variabili con le informazioni per la card
  let id = journalist.id;
  let name = journalist.name;
  let date = journalist.date;
  let ambiguous, dateIcon; //Queste variabili servono per mettere un'icona e un tooltip che spiega se la data è certa o meno
  if(!journalist.ambiguousEntryDate){
    dateIcon = "tick";
    ambiguous = "The date is confirmed";
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

  //fondo nero trasparente
  noStroke();
  fill(0,0,0,175);
  rectMode(CORNER);
  rect(0,0, width, height);

  // DISEGNO LA CARD

  //variabili per le dimensioni
  let cardWidth = 700;
  let cardHeight = 600;
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

  //foto
  let photo = photos[id];
  let photoWidth = 180;
  let photoHeight = 190;
  imageMode(CORNER);
  if(photo){
    image(photo, leftX, topY, photoWidth, photoHeight);
  }else{
    rectMode(CORNER);
    rect(leftX, topY, photoWidth, photoHeight, 10);
  }

  // X per chiudere la card
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

  //grafica della card

  let verticalOffset = 40;
  noFill();
  stroke(red);
  strokeWeight(0.5);
  line(leftX + photoWidth + padding, topY + 80, leftX + cardWidth - 2*padding, topY + 80); //nome
  line(leftX + photoWidth + padding, topY + 80 + 50, leftX + cardWidth - 2*padding, topY + 80 + 50); //data
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
  rect(leftX, topY + photoHeight + 5*padding + 40, width/2 + verticalOffset, bottomY, 3);

  //testi
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

  textSize(14);
  text(job, leftX + padding, topY + photoHeight + 3*padding + 35, 350);
  text(workRelated, width/2 + verticalOffset + padding, topY + photoHeight + 2*padding + 18);
  text(typeOfDeath, width/2 + verticalOffset + padding, topY + photoHeight + 3*padding + 35);

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
  highlightNone = false;

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
    case 10: //mostra filtro paese
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      break;
    case 11: //tutti i pallini bianchi
      showYAxis = true;
      showXAxis = true;
      showGridLines = true;
      animationStarted = true;
      inVisualizationArea = true;
      break;
  }
}