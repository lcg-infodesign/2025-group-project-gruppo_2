let data;

let titleText = "STOLEN VOICES";
let titleIndex = 0;

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

let currentYearIndex = 0; //quale anno mostrare
let spawnedIds = new Set(); //altrimenti cadono tutti i pallini degli anni precedenti ogni volta che arrivo a un anno

let introFinished = false; //quando l'animazione del testo intro è finita

let introHeight = 0;
let introEl = null;

let contentHeight = 0;
let inVisualizationArea = false;

function buildJournalistsFromTable() {
  journalists = [];

  for (let j = 0; j < data.getRowCount(); j++) {
    const row = data.getRow(j);
    const dateStr = row.get("entry_date"); //es. GG/MM/AA o GG/M/AA

    const parts = dateStr.split("/"); // ["3", "11", "94"]
    let year = Number(parts[2]); //AA, es 94

    //trasforma AA in AAAA
    if(year < 100) {
      if(year >= 90) {
        year += 1900; //90-99->1990-1999
      } else {
        year += 2000; //00-89 -> 2000-20
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

  //anni unici
  years = Array.from(new Set(journalists.map(j => j.year))).sort((a,b)=>a-b);

  console.log("anni:", years);
  console.log("categorie:", categories);
}

let introText =
  "This platform provides an interactive view of a dataset documenting journalists who have lost their lives in the pursuit of truth. Here, you can explore detailed data and personal stories that reveal the human and historical impact of these events.\n\nUse the right arrow key on your keyboard to navigate through the sections and discover the data in an intuitive, interactive way.";

let introIndex = 0;
let introStarted = false; //evita doppia animazione

let records


function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

//creare un pallino per ogni giornalista
function createDotsFromJournalists() {
  dots = [];

  for(let j of journalists) {
    let d = new Dot(j.id, j.year, j.category);
    dots.push(d);
  }

  console.log("Pallini generati:", dots.length);
}

function setup() {
  buildJournalistsFromTable(); //legge i dati

  //calcolo altezza intro
  introEl = document.getElementById("intro-text");

  const vizDiv = document.getElementById("visualization");
  //crea canvas grande quanto la sezione visualization
  const canvas = createCanvas(vizDiv.offsetWidth, vizDiv.offsetHeight);
  //il canvas va dentro il div visualization
  canvas.parent('visualization');

  window.addEventListener("scroll", onScrollUpdate);
  
  typeTitle();
  setupIntroTrigger();

  //estrae colonna country
  const countries = data.getColumn("country");

  //valori unici
  const uniqueCountries = new Set(countries);

  console.log("Valori unici:", [...uniqueCountries]);
  console.log("Numero di valori unici:", uniqueCountries.size);
  console.log("Setup completato");
  console.log("canvas size:", width, height);
  console.log("vizdiv:", vizDiv.offsetWidth, vizDiv.offsetHeight);
}

//animazione che scrive il titolo
function typeTitle() {
  let titleEl = document.getElementById("title");

  if (titleIndex < titleText.length) {
    titleEl.textContent += titleText.charAt(titleIndex);
    titleIndex++;
    setTimeout(typeTitle, 200);
  }
}

//l animazione intro text appare solo quando il testo si trova al centro della pagina
function setupIntroTrigger() {
  let target = document.getElementById("intro-text");

  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !introStarted) {
        introStarted = true;
        typeIntroText();
      }
    });
  }, {
    root: null,
    threshold: 0.6     //60% dell'epigrafe visibile
  });

  observer.observe(target);
}

//animazione intro text
function typeIntroText() {
  let introEl = document.getElementById("intro-text");
  introEl.style.opacity = 1;

  if (introIndex < introText.length) {
    introEl.textContent += introText.charAt(introIndex);
    introIndex++;
    setTimeout(typeIntroText, 70);
  } else {
    //testo completato
    introFinished = true;
  }
}

//serve per dire come si costruisce un pallino
// class Dot è la struttura
class Dot {
  constructor(id, year, category) { //serve per mettere i parametri
    this.id = id; //this è il pallino specifico che sto creando
    this.year = year;
    this.category = category;

    //inizia dall'alto del canvas e cade verso il basso
    this.pos = createVector(random(width), 0);

    //posizione target finale (dove deve arrivare)
    this.targetY = random(height * 0.2, height * 0.8);

    //velocità di caduta
    this.speed = random(1, 3);

    //stato: true quando ha raggiunto la posizione target
    this.arrived = false;

    //raggio del pallino
    this.r = 3;
  }

  update() {
    if(!this.arrived) {
      // muovi verso il basso
      this.pos.y += this.speed;

      //quando raggiunge la posiozne target
      if(this.pos.y >= this.targetY) {
        this.pos.y = this.targetY;
        this.arrived = true;
      }
    }

    //disegna il pallino
    fill(180, 200);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}


function draw() {
  background(25);

  //genera pallini progressivamente quando sono nell'area di visualizzazione
  if(introFinished && inVisualizationArea) {
      spawnUpToCurrentYear();
    }

  for(let d of dots) {
    d.update(); //fa cadere i pallini
  }
}

function windowResized() {
  const vizDiv = document.getElementById("visualization");
  resizeCanvas(vizDiv.offsetWidth, vizDiv.offsetHeight);
}

function onScrollUpdate() {
  const vizSection = document.getElementById("visualization-section");
  const rect = vizSection.getBoundingClientRect(); //restituisce la posizione e le dimensioni di vizSection

  // la sezione è visibile quando entra nella viewport
  // il top della sezione è sopra il 60% della finestra
  inVisualizationArea = rect.top < window.innerHeight * 0.6;

  const canvasEl = document.querySelector("#visualization canvas"); //cerca nell'html
  if(canvasEl) canvasEl.style.opacity = inVisualizationArea ? 1 : 0; //se è uguale allora 1, altrimenti 0
}

//fai cadere i pallini quando serve
function spawnUpToCurrentYear() {
  //solo se l'animazione del testo è finita
  if(!introFinished || !inVisualizationArea) return; //|| è oppure, ! è se non, quindi se l'intro non è finita o non sono in inVisualizationArea, non continuare

  if(!years || years.length === 0) return; // se years è false o la lunghezza dell'anno è 0, non continuare

  const yearLimit = years[currentYearIndex];
  let spawnedCount = 0;
  const maxSpawnPerFrame = 3; // massimo numero di pallini per frame

  //per ongi giornalista, se il suo anno è
  //minore o uguale a yearLimit e non è già stato creato
  //crea il dot
  for(let j of journalists) {
    if (spawnedCount >= maxSpawnPerFrame) break;
    
    //usare spawnedIds per evitare di creare due volte lo stesso pallino
    //spawn serve ad apparire nel canvas
    if (j.year <= yearLimit && !spawnedIds.has(j.id)) { //se spawnedids non ha questo id
      let d = new Dot(j.id, j.year, j.category); //new Dot crea un pallino vuoto con tra parentesi i parametri
      dots.push(d);
      spawnedIds.add(j.id); //registra che l'ho costruito
      spawnedCount++;
    }
  }
}
