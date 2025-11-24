// Costanti per P5.js (Invariate)
const DOT_COUNT = 80; 
const DOT_RADIUS = 3;  
let dots = []; 
let bullets; 

// Distanza minima per il campo di forze (Invariata)
const MIN_DISTANCE_SQUARED = 50 * 50; 

// Sezioni di contenuto: 4 SEZIONI TOTALI (Invariate)
const SECTIONS = [
  { id: "why-this-project", title: "WHY THIS PROJECT", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { id: "why-this-metodology", title: "WHY THIS METODOLOGY", text: "Nunc id est ante. Ut in eleifend ex. Proin sed tortor non urna fringilla scelerisque. Vivamus quis magna sit amet urna consequat dictum. Sed luctus lacus nec tortor iaculis, at consectetur libero molestie. Curabitur vel justo sed libero pretium varius. Etiam in libero in orci vehicula rutrum vitae nec libero. Proin eu ipsum at quam varius cursus ac ut felis." },
  { id: "what-is-cpj", title: "WHAT IS CPJ", text: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean vitae turpis in mi feugiat consectetur. Donec at elit tellus. Sed at metus eros. Aliquam erat volutpat. Nulla facilisi. In nec urna in elit aliquam tristique at quis ligula. Sed sit amet dolor at nibh varius placerat non nec nulla." },
  { id: "how-cpj-collected-this-dataset", title: "HOW CPJ COLLECTED THIS DATASET", text: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris euismod vel velit in dignissim. Cras tincidunt tortor in est bibendum, vitae bibendum dolor consequat. In hac habitasse platea dictumst. Sed in ex eget enim facilisis blandit. Suspendisse potenti. Nam non lectus velit." }
];

// Dati del Team (Invariati)
const TEAM_NAMES = ["Sara Allegro", "Filippo Garbero", "Letizia Neri", "Vanessa Preite", "Enea Tramontana", "Cristina Zheng"];
const NAMES_PER_DOT = Math.ceil(DOT_COUNT / TEAM_NAMES.length);
const RED_DOT_RATIO = 0.2; 

// Variabili di stato
let currentSectionIndex = 0;
let sectionTextIndices = new Array(SECTIONS.length).fill(0);
let sectionTitleIndices = new Array(SECTIONS.length).fill(0); 
let sectionStarted = new Array(SECTIONS.length).fill(false);
let isTeamAnimationMode = false; 

// AGGIORNATO: Ora il mouseTarget viene usato come Target di Attrazione
let mouseTarget;

// CLASSE DOT - MODIFICATO IL METODO update()
class Dot {
  constructor(index) {
    this.initialPos = createVector(0, 0); 
    this.pos = createVector(random(width), random(height / 2)); 
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1.5; // Leggermente più veloce per seguire il mouse
    this.maxForce = 0.15; // Forza leggermente maggiore
    this.index = index;
    this.dotColor = random(1) < RED_DOT_RATIO ? color(255, 0, 0) : 255;
  }
  
  // Forza attrattiva (seek) verso una posizione target
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    if (d < 100) {
      let speed = map(d, 0, 100, 0, this.maxSpeed);
      desired.setMag(speed);
    } else {
      desired.setMag(this.maxSpeed);
    }
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // Aggiunge un movimento casuale (tremolio) basato sul rumore Perlin (Invariata)
  applyWiggle() {
    let noiseVal = noise(this.pos.x * 0.005 + frameCount * 0.001, this.pos.y * 0.005 + frameCount * 0.001);
    let angle = map(noiseVal, 0, 1, 0, TWO_PI);
    let wiggle = p5.Vector.fromAngle(angle);
    wiggle.mult(this.maxForce * 0.5); 
    this.acc.add(wiggle);
  }

  // AGGIORNATO: update() ora usa targetPos (che sarà mouseTarget in modalità team)
  update(targetPos) {
    this.initialPos.set(targetPos);
    
    // Il target di attrazione è la posizione del mouse
    let seekingForce = this.seek(this.initialPos);
    this.acc.add(seekingForce);
    
    this.applyWiggle();
    this.vel.add(this.acc); 
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); 
    
    // Mantiene i pallini entro i limiti dello schermo
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }

  display() {
    fill(this.dotColor);
    noStroke();
    ellipse(this.pos.x, this.pos.y, DOT_RADIUS * 2, DOT_RADIUS * 2);
  }
}


function setup() {
    createCanvas(windowWidth, windowHeight); 
    
    for (let i = 0; i < DOT_COUNT; i++) {
        dots.push(new Dot(i));
    }

    bullets = document.querySelectorAll(".bullet");
    
    const teamLink = document.getElementById('team-link');
    if (teamLink) {
        teamLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            startTeamAnimation();
        });
    }
    
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', exitTeamAnimation);
    }
    
    // Listener per aggiornare la posizione del mouse (Invariata)
    document.addEventListener('mousemove', (event) => {
        mouseTarget = createVector(event.clientX, event.clientY);
    });

    // Inizializza mouseTarget al centro
    mouseTarget = createVector(width / 2, height / 2);

    document.addEventListener('keydown', handleKeyPress); 
    scrollToSection(currentSectionIndex); 
}

// Gestione degli eventi da tastiera 
function handleKeyPress(event) {
    if (event.key === "ArrowRight") {
        if (currentSectionIndex < SECTIONS.length - 1) {
            if (bullets[currentSectionIndex]) bullets[currentSectionIndex].classList.remove("active"); 
            currentSectionIndex++;
            scrollToSection(currentSectionIndex);
        }
    } else if (event.key === "ArrowLeft") {
        if (isTeamAnimationMode) {
            exitTeamAnimation(); 
            return;
        }
        if (currentSectionIndex > 0) {
            if (bullets[currentSectionIndex]) bullets[currentSectionIndex].classList.remove("active"); 
            currentSectionIndex--;
            scrollToSection(currentSectionIndex);
        }
    }
}

// Scorrimento alla sezione 
function scrollToSection(index) {
    isTeamAnimationMode = false;
    document.getElementById('team-content').style.opacity = '0';
    document.getElementById('navigation-bullets').style.display = 'flex';
    document.getElementById('return-button').style.opacity = '0';
    document.getElementById('return-button').style.pointerEvents = 'none';
    
    const sectionId = SECTIONS[index].id;
    const allSections = document.querySelectorAll('.about-section'); 
    
    if (bullets[index]) {
        bullets.forEach(b => b.classList.remove('active')); 
        bullets[index].classList.add("active");
    }

    allSections.forEach(section => {
        section.style.display = 'none'; 
    });

    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
        targetSection.style.display = 'flex'; 

        if (!sectionStarted[index]) {
            sectionStarted[index] = true;
            
            document.getElementById(`${sectionId}-title`).textContent = "";
            document.getElementById(`${sectionId}-text`).textContent = ""; 
            
            typeText(
                `${sectionId}-title`, 
                SECTIONS[index].title, 
                (idx) => sectionTitleIndices[index] = idx, 
                () => sectionTitleIndices[index], 
                false, 
                50 
            ); 

            setTimeout(() => {
                typeText(
                    `${sectionId}-text`, 
                    SECTIONS[index].text, 
                    (idx) => sectionTextIndices[index] = idx, 
                    () => sectionTextIndices[index],
                    true, 
                    35 
                );
            }, 1000); 
        }
    }
}


function typeText(id, text, setIndex, getIndex, allowTags, speed) {
    let el = document.getElementById(id);
    el.style.opacity = 1;
    let idx = getIndex();

    if (idx >= text.length) return;

    if (allowTags && text[idx] === "<") {
        let closing = text.indexOf(">", idx);
        let tag = text.substring(idx, closing + 1);
        el.innerHTML += tag;
        idx = closing + 1;
        setIndex(idx);
        setTimeout(() => typeText(id, text, setIndex, getIndex, allowTags, speed), 10);
        return;
    }

    if (text[idx] === "\n") {
        el.innerHTML += "<br>";
        setIndex(idx + 1);
        setTimeout(() => typeText(id, text, setIndex, getIndex, allowTags, speed), 35);
        return;
    }

    el.innerHTML += text.charAt(idx);
    setIndex(idx + 1);
    setTimeout(() => typeText(id, text, setIndex, getIndex, allowTags, speed), speed);
}

//  Funzione per uscire dalla modalità Team 
function exitTeamAnimation() {
    isTeamAnimationMode = false;
    document.getElementById('team-content').style.opacity = '0';
    document.getElementById('navigation-bullets').style.display = 'flex'; 
    document.getElementById('return-button').style.opacity = '0';
    document.getElementById('return-button').style.pointerEvents = 'none';

    document.querySelectorAll('.about-section').forEach(section => section.style.display = 'none');

    const sectionIdToDisplay = SECTIONS[currentSectionIndex].id;
    const targetSection = document.getElementById(sectionIdToDisplay);

    if (targetSection) {
        targetSection.style.display = 'flex';
    }
    
    if (bullets[currentSectionIndex]) {
        bullets.forEach(b => b.classList.remove('active')); 
        bullets[currentSectionIndex].classList.add("active");
    }
}

// FUNZIONE ANIMAZIONE TEAM - AVVIO
function startTeamAnimation() {
    document.getElementById('navigation-bullets').style.display = 'none';
    const currentSectionId = SECTIONS[currentSectionIndex].id;
    document.getElementById(currentSectionId).style.display = 'none';

    document.getElementById('team-content').style.opacity = '1';
    
    document.getElementById('return-button').style.opacity = '1';
    document.getElementById('return-button').style.pointerEvents = 'auto'; 
    
    isTeamAnimationMode = true;
    
    // Resetta i pallini per l'animazione Team (sparsi in tutta la finestra)
    dots.forEach(dot => {
        // Assegna una posizione iniziale casuale, che funge da 'ancora' morbida
        // L'attrazione del mouse prenderà il sopravvento.
        dot.initialPos = createVector(random(width), random(height)); 
        dot.vel.mult(0);
        dot.acc.mult(0);
    });
}


//  Draw di P5.js 
function draw() {
    background(25); 

    let targetPositions = [];
    const centerX = width / 2;
    const centerY = height / 3; 
    
    
    if (isTeamAnimationMode) {
        // Modalità Team: I pallini seguono il mouseTarget
        for (let i = 0; i < dots.length; i++) {
            // Se il mouse si muove, usa la posizione del mouse come target.
            // Altrimenti, i pallini si muovono verso la loro posizione casuale iniziale (effetto tremolio)
            
            // Per farli seguire il mouse, passiamo mouseTarget come targetPos
            dots[i].update(mouseTarget); 
            dots[i].display();
        }
        
    } else {
        // La logica delle Sezioni è attiva, usa le forme statiche
        switch (currentSectionIndex) {
            case 0: // Sparse 
                for (let i = 0; i < DOT_COUNT; i++) {
                    targetPositions.push(createVector(random(width * 0.2, width * 0.8), random(height * 0.1, height * 0.5)));
                }
                break;
            case 1: // Una riga orizzontale
                for (let i = 0; i < DOT_COUNT; i++) {
                    let x = map(i, 0, DOT_COUNT - 1, width * 0.2, width * 0.8);
                    targetPositions.push(createVector(x, centerY));
                }
                break;
            case 2: // Tre righe
                const rowCount = 3;
                const separation = 40; 
                const dotsPerRow = ceil(DOT_COUNT / rowCount);
                for (let i = 0; i < DOT_COUNT; i++) {
                    let row = floor(i / dotsPerRow);
                    let x = map(i % dotsPerRow, 0, dotsPerRow - 1, width * 0.2, width * 0.8);
                    let y = centerY + (row - 1) * separation; 
                    targetPositions.push(createVector(x, y));
                }
                break;
            case 3: // Cerchio
                for (let i = 0; i < DOT_COUNT; i++) {
                    const radius = 150;
                    let angle = map(i, 0, DOT_COUNT, 0, TWO_PI);
                    let x = centerX + cos(angle) * radius;
                    let y = centerY + sin(angle) * radius;
                    targetPositions.push(createVector(x, y));
                }
                break;
        }
        
        // Aggiorna e disegna i pallini
        for (let i = 0; i < dots.length; i++) {
            let target = targetPositions[i % targetPositions.length]; 
            dots[i].update(target);
            dots[i].display();
        }
    }
}

// Funzione windowResized (omessa per brevità, è invariata)
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}