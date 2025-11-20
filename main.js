// --DIMENSIONI DELL'INTERFACCIA--
//dichiarate qui e impostate in setup()
let sidebarWidth; //larghezza della barra laterale dove stanno i testi e i filtri
let mainWidth; //larghezza della zona dove sta la viz principale
let padding; //margini dai bordi laterali dello schermo

// --COLORI--
//dichiarate qui e impostate in setup()
let bg; // colore di sfondo (nero)
let white;
let red;
let red_translucent; //rosso scuro per i fondi di pulsanti, icone ecc.
let red_hover; //rosso per i fondi quando c'è l'hover del mouse

// --TIPOGRAFIA--
let font = "JetBrains Mono";


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

function setup() {
  createCanvas(windowWidth, windowHeight);

  //imposto le variabili per le dimensioni dell'interfaccia
  sidebarWidth = 380;
  mainWidth = windowWidth - sidebarWidth;
  padding = 30;

  //imposto i colori
  bg = color(0,0,0);
  red = color(255, 0, 0);
  white = color(255,255,255);
  red_translucent = color(255,0,0, 60);
  red_hover = color(255,0,0, 80);
}

//funzione che disegna la griglia sotto i pallini
function drawGrid(){
  let yLabelWidth = padding + 60; //larghezza per le etichette dell'asse y
  let xLabelHeight = 30; //altezza per le etichette dell'asse x
  let rowHeight = (height - 2 * padding - xLabelHeight) / categories.length; //altezza della singola riga nel grafico

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
    line(padding + yLabelWidth, y, mainWidth - padding, y)
  }
}

function draw() {
  background(220);
  
  drawGrid();
}