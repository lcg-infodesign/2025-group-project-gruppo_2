let table;
let bubbles = [];
let journalists = []; 

let sidebarWidth = 300;

let defaultPhoto;       
let photo;
let photos = [];
let hasLoadedPhoto = false;

let tickIcon;
let cpjLogo;

let red, red_translucent, white;
let font = "JetBrains Mono";

let cpjButtonHover = false;
let cpjUrl = null;

let closeCard = null;


let activeLabel = null;
let activeCardDot = null;



function preload() {
  table = loadTable("assets/data.csv", "csv", "header");
  cpjLogo = loadImage("assets/cpj_logo.svg");
  defaultPhoto = loadImage("assets/default_photo.jpg");
  tickIcon = loadImage("assets/tickIcon.svg");

  console.log("Row count: " + table.getRowCount());
  // carica tutte le foto dei giornalisti
  for (let i = 0; i < table.getRowCount(); i++) {
    photos[i] = loadImage("assets/images/" + i + ".jpg");
  }
  console.log("photos " + photos);
}

function setup() {
    let mainWidth = windowWidth - sidebarWidth;
    let canvas = createCanvas(mainWidth, windowHeight);
    canvas.position(0, 30);

    white = color(255);
    red = color(255, 0, 0);
    red_translucent = color(255, 0, 0, 60);
    red_hover = color(255, 0, 0, 80);

    buildJournalistsFromTable();
    buildBubbles();
}

function typeWriter(element, speed = 20, callback = null) {
    const html = element.innerHTML.trim();
    let output = "", buffer = "";
    let i = 0, insideTag = false;

    element.innerHTML = "";
    element.style.visibility = "visible";

    function type() {
        if (i >= html.length) {
            if (callback) callback();
            return;
        }

        const char = html[i];

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

window.onload = () => {
    let headline = document.getElementById("headline");
    let arrow = document.getElementById("arrow");

    typeWriter(headline, 35, () => {
        arrow.style.opacity = "1";
    });
};

function activateSection(wrapperId, categoryFilter) {

    activeLabel = categoryFilter; // mostra solo etichetta corrente

    document.querySelectorAll(".section-wrapper").forEach(w => w.style.display = "none");

    let wrapper = document.getElementById(wrapperId);
    wrapper.style.display = "flex";

    for (let b of bubbles) {
        b.dimmed = b.category.toLowerCase() !== categoryFilter.toLowerCase();
    }

    let titleEl = wrapper.querySelector(".section-title");
    let bodyEl  = wrapper.querySelector(".section-body");
    let arrowEl = wrapper.querySelector(".arrow");

    titleEl.style.visibility = "hidden";
    bodyEl.style.visibility = "hidden";
    arrowEl.style.visibility = "hidden";
    arrowEl.style.opacity = "0";

    const titleHTML = titleEl.innerHTML;
    const bodyHTML  = bodyEl.innerHTML;

    titleEl.innerHTML = titleHTML;
    bodyEl.innerHTML = bodyHTML;

    typeWriter(titleEl, 35, () => {
        typeWriter(bodyEl, 15, () => {
            arrowEl.style.visibility = "visible";
            arrowEl.style.opacity = "1";
        });
    });
}

function activateClosure() {

    document.querySelectorAll(".section-wrapper").forEach(w => w.style.display = "none");

    let wrapper = document.getElementById("closure-wrapper");
    let bodyEl  = wrapper.querySelector(".section-body");

    wrapper.style.display = "flex";

    for (let b of bubbles) b.dimmed = false;
    activeLabel = "ALL";

    bodyEl.style.visibility = "hidden";

    let bodyHTML = bodyEl.innerHTML;

    bodyEl.innerHTML = bodyHTML;

    typeWriter(bodyEl, 20);
}



// primo click apre unknown
document.getElementById("arrow").addEventListener("click", () => {
    document.getElementById("headline-wrapper").style.display = "none";
    activateSection("unknown-wrapper", "Unknown");
});

// unknown → complete
document.getElementById("arrow-unknown").addEventListener("click", () => {
    activateSection("complete-wrapper", "Complete Impunity");
});

// complete → partial
document.getElementById("arrow-complete").addEventListener("click", () => {
    activateSection("partial-wrapper", "Partial Impunity");
});

// partial → full
document.getElementById("arrow-partial").addEventListener("click", () => {
    activateSection("full-wrapper", "Full Justice");
});

// full → closure
document.getElementById("arrow-full").addEventListener("click", () => {
    document.getElementById("full-wrapper").style.display = "none";
    activateClosure();
});

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
  if (photo.width >= photo.height) {
    image(photo, leftX, topY, photoHeight * (photo.width/photo.height), photoHeight);
  } else {
    image(photo, leftX, topY, photoWidth, photoWidth * (photo.height/photo.width));
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
  textSize(12);
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

  //--------------------------- TESTI DELLA CARD ---------------------------
  
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

  //Bottone Discover more
  textAlign(CENTER);
  text("DISCOVER MORE", (width/2 + verticalOffset + padding + rightX)/2 + 20, bottomY - padding/2);

  imageMode(CENTER);
  image(cpjLogo, width/2 + verticalOffset + 3*padding, bottomY - 22, 36, 36);

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

function draw() {
  let hoveringLabel = false;

    for (let b of bubbles) {
        if (activeLabel && b.labelClicked(mouseX, mouseY)) {
            hoveringLabel = true;
            break;
        }
    }

    // pointer
    if (hoveringLabel) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    background(25);

    for (let b of bubbles) {
        let d = dist(mouseX, mouseY, b.x, b.y);
        b.isHovered = d < b.r;
    }

    for (let b of bubbles) {
        b.update();
        b.show();
    }

    if (activeCardDot !== null) {
    drawCard(activeCardDot);
    }
  
}

function buildBubbles() {
    if (!table) return;

    let impCol = -1;

    for (let c = 0; c < table.getColumnCount(); c++) {
        if (table.columns[c].toLowerCase().includes("impunity"))
            impCol = c;
    }

    if (impCol === -1) {
        console.error("Colonna impunity non trovata.");
        return;
    }

    let data = {};

    for (let r = 0; r < table.getRowCount(); r++) {
        let v = table.getString(r, impCol).trim();
        if (v === "") v = "Unknown";
        if (!data[v]) data[v] = [];
        data[v].push(r);
    }

    let order = ["Unknown", "Full Justice", "Complete Impunity", "Partial Impunity"];
    let cats = order.filter(c => data[c]);

    bubbles = [];

    let cx = width / 2;
    let cy = height / 2;
    let offset = 200;

    let positions = [
        { x: cx - offset, y: cy },
        { x: cx, y: cy - offset },
        { x: cx + offset, y: cy },
        { x: cx, y: cy + offset }
    ];

    cats.forEach((cat, i) => {
        let n = data[cat].length;
        let r = constrain(sqrt(n) * 4, 40, 220);

        bubbles.push(new Bubble(
            positions[i].x,
            positions[i].y,
            r,
            data[cat],
            cat
        ));

    });

}

function buildJournalistsFromTable() {
  journalists = [];

  for (let j = 0; j < table.getRowCount(); j++) {
    let row = table.getRow(j);
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
    const wr = row.get("confirmed work related or unconfirmed (may be work related)");
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
      heldCaptive: row.get("held_captive") || "Unknown"
    };

    journalists.push(journalist);
  }

  years = Array.from(new Set(journalists.map(j => j.year))).sort((a,b) => a-b);
  console.log("Journalists loaded:", journalists.length);
  console.log("Years available:", years);
  console.log("Sample journalist:", journalists[0]);
}

class Bubble {
    constructor(x, y, r, indices, category) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.category = category;
        this.indices = indices;  // array degli ID giornalisti
        this.count = indices.length;

        this.isHovered = false;
        this.dimmed = false;

        this.points = [];

        for (let i = 0; i < this.indices.length; i++) {
            this.points.push({
                id: this.indices[i],  // ID giornalista
                angle: random(TWO_PI),
                rad: this.r * sqrt(random()),
                offset: random(1000),
                speed: random(-0.003, 0.003)
            });
        }
    }

    update() {
        let speedFactor = this.isHovered ? 0 : 1;

        for (let p of this.points) {
            p.angle += p.speed * speedFactor;
            p.rad = constrain(
                p.rad + sin((frameCount + p.offset) * 0.01) * 0.2 * speedFactor,
                0,
                this.r
            );
        }
    }

    show() {
        noStroke();
        fill(this.dimmed ? "rgba(255,255,255,0.15)" : "white");

        for (let p of this.points) {

            // calcolo RR (UGUALE a quello che userai in mousePressed!)
            let rr = p.rad + sin((frameCount + p.offset) * 0.01) * 0.8;

            let px = this.x + cos(p.angle) * rr;
            let py = this.y + sin(p.angle) * rr;

            circle(px, py, 3);
        }  


        if (activeLabel === "ALL" || this.category === activeLabel) {
            fill(255);
            textAlign(CENTER, BOTTOM);
            textSize(12);
            textFont("JetBrains Mono");
            text(this.category, this.x, this.y - this.r - 8);
        }
    }

    labelClicked(mx, my) {
        textSize(12);
        textFont("JetBrains Mono");
        let tw = textWidth(this.category);
        let th = 14;

        let lx = this.x - tw / 2;
        let ly = this.y - this.r - 8;

        return mx > lx && mx < lx + tw && my > ly - th && my < ly;
    }
}

function mousePressed() {
    for (let b of bubbles) {

        for (let p of b.points) {

            // coordinate dot
            let rr = p.rad + sin((frameCount + p.offset) * 0.01) * 0.8;

            let px = b.x + cos(p.angle) * rr;
            let py = b.y + sin(p.angle) * rr;

            if (dist(mouseX, mouseY, px, py) < 6) {
                activeCardDot = p;
                hasLoadedPhoto = false;
                return;
            }
        }
    }

    if (closeCard) {
        activeCardDot = null;
        closeCard = null;
        cursor(ARROW);
        hasLoadedPhoto = false; 
        return;
    }

    // aprire la pagina di cpj quando si preme su DISCOVER MORE nella card
    if(cpjButtonHover){
        window.open(cpjUrl);
        cpjButtonHover = null;
    }


    for (let b of bubbles) {
        if ((activeLabel === "ALL" || activeLabel === b.category) &&
            b.labelClicked(mouseX, mouseY)) {
            triggerSectionFromLabel(b.category);
        }
    }
}


function triggerSectionFromLabel(cat) {
    const map = {
        "Unknown":      ["unknown-wrapper", "Unknown"],
        "Complete Impunity": ["complete-wrapper", "Complete Impunity"],
        "Partial Impunity":  ["partial-wrapper", "Partial Impunity"],
        "Full Justice":      ["full-wrapper", "Full Justice"]
    };

    if (!map[cat]) return;
    
    const [wrapperId, filter] = map[cat];

    activateSection(wrapperId, filter);
}


function windowResized() {
    resizeCanvas(windowWidth - sidebarWidth, windowHeight);
}
