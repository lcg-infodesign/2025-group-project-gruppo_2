let data;

// dimensioni

let sidebarWidth; //larghezza della barra laterale dove stanno i testi e i filtri
let mainWidth; //larghezza della zona dove sta la viz principale
let padding; //margini dai bordi laterali dello schermo

let yLabelWidth; //larghezza per le etichette dell'asse y
let xLabelHeight; //altezza per le etichette dell'asse x
let rowHeight; //altezza della singola riga nel grafico
let initialX; //posizione x da cui comincia il primo anno
let yearWidth; //larghezza di ogni colonna (corrispondente a 1 anno)
let diam; //diametro dei pallini
let gravity; //regola la velocità della caduta

// colori
let bg; // colore di sfondo (nero)
let white;
let red;
let red_translucent; //rosso scuro per i fondi di pulsanti, icone ecc.
let red_hover; //rosso per i fondi quando c'è l'hover del mouse

let font = "JetBrains Mono";

// variabili per la visualizzazione dei pallini
let dots = {};

//categorie source_of_fire
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

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //imposto le variabili per le dimensioni dell'interfaccia
  sidebarWidth = 380;
  mainWidth = windowWidth - sidebarWidth;
  padding = 30;

  yLabelWidth = padding + 60;
  xLabelHeight = 50;
  rowHeight = (height - 2 * padding - xLabelHeight) / categories.length;
  initialX = padding + yLabelWidth ;
  yearWidth = (mainWidth - 2*padding - yLabelWidth) / (2025-1992);
  diam = 10;
  gravity = 2;

  //imposto i colori
  bg = color(0,0,0);
  red = color(255, 0, 0);
  white = color(255,255,255);
  red_translucent = color(255,0,0, 60);
  red_hover = color(255,0,0, 80);

  //carico i dati nell'oggetto dots
  for(let i = 0; i < data.getRowCount(); i++){
    let date = data.get(i, "entry_date");
    let fourDigitYear = date.slice(-4);
    let journalist = {
      name: data.get(i, "journalist/media worker_name"),
      sourceOfFire: data.get(i, "source_of_fire"),
      year: fourDigitYear,
      y: -diam/2 //inizializzo la y del pallino fuori dallo schermo in modo che possa essere animato aumentando la y
    };
    dots[i] = journalist;
  }

  console.log(dots);
  
}

//funzione che disegna la griglia sotto i pallini
function drawGrid(){
  
  for(let i = 0; i < categories.length; i ++){

    let y = padding + i * rowHeight + rowHeight/2;

    //etichette sull'asse y
    fill(white);
    noStroke();
    textFont(font);
    textAlign(RIGHT, CENTER);
    textSize(12);
    text(categories[i], padding, y, yLabelWidth - 10);

    //righe orizzontali delle categorie
    noFill();
    stroke(white);
    strokeWeight(1);
    line(padding + yLabelWidth, y, mainWidth - padding, y);
  }

  //tacca ogni anno sull'asse x
  for(let i = 0; i <= (2025-1992); i++){
    let x = initialX + i * yearWidth;
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(x, topY, x, bottomY);
  }

  //etichetta e tacca spessa ogni 5 anni
  for(let i = 0; i < ceil((2025 - 1992) / 5); i++){
    let label = i*5 + 1995;
    let x = initialX + 3 * ((mainWidth - 2*padding - yLabelWidth) / (2025 - 1992)) + (i * 5) * yearWidth;

    //etichetta
    fill(white);
    noStroke();
    textFont(font);
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, x, height - padding - 32);

    //tacca spessa
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    noFill();
    stroke(white);
    strokeWeight(2);
    line(x, topY, x, bottomY);
  }
}

//funzione che disegna i pallini di un anno
function animateDot(i){
  let category = dots[i].sourceOfFire;
  let year = dots[i].year;
  let categoryIndex = categories.indexOf(category);
  let maxY = 0; //per ora metto 0 così i pallini che non rientrano in nessuna categoria si fermano in alto
  if(!isNaN(categoryIndex)){
    maxY = padding + categoryIndex * rowHeight + rowHeight/2; //questo parametro dovrà essere dipendente dal fatto che ci siano già altri pallini arrivati o meno
  }
  let x = initialX + (year - 1992) * yearWidth;
  let y = dots[i].y;
  if(y <= maxY){
    circle(x, y, diam);
  }else{
    circle(x, maxY, diam);
  }
  dots[i].y += gravity;
}

function draw() {
  background(50);
  
  drawGrid();
  fill(white);

  let currentYear = 1992;

  for(let i = 0; i < data.getRowCount(); i ++){
    animateDot(i, 0);
  }
}