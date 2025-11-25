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
  diam = 4;
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
    let yLabelOffset = 20; // quanto spostare a sinistra le etichette
    text(categories[i], padding - yLabelOffset, y, yLabelWidth - 10);

    //righe orizzontali delle categorie
    noFill();
    stroke(white);
    strokeWeight(0.5);
    line(padding + yLabelWidth, y, mainWidth - padding, y);
  }

  //tacca ogni anno sull'asse x
  for(let i = 0; i <= (2025-1992); i++){
    let x = initialX + i * yearWidth;
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;
    line(x, topY, x, bottomY);
  }

  // Tacchette verticali prima del 1992
    let xStart = initialX;        // inizio grafico (1992)
    let numTicks = 10;            // numero di tacchette da disegnare
    let maxStep = yearWidth;      // passo iniziale tra le prime tacchette
    let minStep = 5;              // passo minimo vicino all'asse Y

   for (let i = 1; i <= numTicks; i++) {
    // passo progressivamente più piccolo verso sinistra
    let step = map(i, 1, numTicks, maxStep, minStep);
    xStart -= step;

    // disegna la tacca verticale
    stroke(255);                  // colore bianco
    strokeWeight(1);              // spessore linea
    let topY = height - padding - xLabelHeight;
    let bottomY = height - padding - 40;  // stessa altezza delle tacche regolari
    line(xStart, topY, xStart, bottomY);
  }


  //etichetta e tacca spessa ogni 5 anni
      for (let i = 0; i < ceil((2025 - 1992) / 5); i++){
      let label = i*5 + 1995;
      let x = initialX + 3 * ((mainWidth - 2*padding - yLabelWidth) / (2025 - 1992)) + (i * 5) * yearWidth;

      // etichetta
      fill(white);
      noStroke();
      textFont(font);
      textAlign(CENTER, TOP);
      textSize(12);
      text(label, x, height - padding - 32);

      // pallino con glow sfumato
      let yPallino = height - padding - 45; // stessa posizione verticale della tacca
      let radius = 10;      // raggio interno pieno
      let glowWidth = 8;   // larghezza del glow
      let maxAlpha = 120;  // trasparenza massima del glow

      // disegna il glow (cerchi concentrici)
      for (let j = glowWidth; j > 0; j--) {
        fill(255, 255, 255, map(j, glowWidth, 0, 0, maxAlpha));
        noStroke();
        circle(x, yPallino, radius + j);
      }

      // cerchio interno pieno
      fill(255);
      noStroke();
      circle(x, yPallino, radius);
    }



    // asse Y verticale (linea bianca del grafico)
    stroke(white);
    strokeWeight(0.5);

    let yAxisOffset = 15;        // quanto far partire prima del 1992
    let yStartOffset = 20;       // quanto più in alto rispetto all'asse X

    let xAxisY = height - padding - xLabelHeight;

    line(
      initialX - yAxisOffset,
      xAxisY - yStartOffset,   // parte un po' più in alto dell'asse X
      initialX - yAxisOffset,
      padding                  // sale verso l'alto
    );

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
  background(bg); // sfondo

  drawGrid(); // griglia ed etichette

  // blur verticale sfumato verso sinistra con padding per separalro meglio dal grafico
  let rightPadding = 50; // distanza tra grafico e blur
  let xBlurStart = initialX + (mainWidth - padding - yLabelWidth) + rightPadding; // destra del grafico + padding
  let glowWidth = 12;       // larghezza del blur
  let maxAlpha = 120;       // opacità massima della parte più vicina al grafico

  // disegna il glow sfumato verso sinistra
  for (let i = 0; i < glowWidth; i++) {
    stroke(255, 255, 255, map(i, 0, glowWidth, maxAlpha, 0)); // opacità decrescente verso sinistra
    strokeWeight(1); 
    line(xBlurStart - i, 0, xBlurStart - i, height); // linea sfumata verso sinistra
  }

  // disegna i pallini
  fill(white);
  for (let i = 0; i < data.getRowCount(); i++) {
    animateDot(i);
  }
}
