// Costanti P5.js
const DOT_COUNT = 80;         // Totale di pallini creati (AGGIORNATO)
const SECTION_DOT_COUNT = 80; // Usiamo DOT_COUNT per tutte le sezioni normali
const DOT_RADIUS = 3;         // Raggio del pallino (AGGIORNATO)
let dots = []; 
let bullets; 

// Variabili per la gestione della digitazione del testo
let typingTimeoutText = null;
let isTypingText = false;

// Costanti di Repulsione (Mantenute dai prompt precedenti)
const SEPARATION_DISTANCE = 40; 
const SEPARATION_STRENGTH = 0.5; 
const BG_COLOR = 25; 

// Costanti di Repulsione dal Mouse
const MOUSE_REPULSION_RADIUS = 120; 
const MOUSE_REPULSION_STRENGTH = 1.0; 


// Sezioni di contenuto
const SECTIONS = [
  { id: "why-this-project", title: "WHY THIS PROJECT", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { id: "why-this-metodology", title: "WHY THIS METODOLOGY", text: "Nunc id est ante. Ut in eleifend ex. Proin sed tortor non urna fringilla scelerisque. Vivamus quis magna sit amet urna consequat dictum. Sed luctus lacus nec tortor iaculis, at consectetur libero molestie. Curabitur vel justo sed libero pretium varius. Etiam in libero in orci vehicula rutrum vitae nec libero. Proin eu ipsum at quam varius cursus ac ut felis." },
  { id: "what-is-cpj", title: "WHAT IS CPJ", text: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean vitae turpis in mi feugiat consectetur. Donec at elit tellus. Sed at metus eros. Aliquam erat volutpat. Nulla facilisi. In nec urna in elit aliquam tristique at quis ligula. Sed sit amet dolor at nibh varius placerat non nec nulla." },
  { id: "how-cpj-collected-this-dataset", title: "HOW CPJ COLLECTED THIS DATASET", text: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris euismod vel velit in dignissim. Cras tincidunt tortor in est bibendum, vitae bibendum dolor consequat. In hac habitasse platea dictumst. Sed in ex eget enim facilisis blandit. Suspendisse potenti. Nam non lectus velit." }
];

// Dati del Team
const TEAM_NAMES = ["Sara Allegro", "Filippo Garbero", "Letizia Neri", "Vanessa Preite", "Enea Tramontana", "Cristina Zheng"];
const NAMES_PER_DOT = Math.ceil(DOT_COUNT / TEAM_NAMES.length);
const RED_DOT_RATIO = 0.2; 

// Variabili di stato
let currentSectionIndex = 0;
let sectionTextIndices = new Array(SECTIONS.length).fill(0);
let sectionTitleIndices = new Array(SECTIONS.length).fill(0); 
let sectionStarted = new Array(SECTIONS.length).fill(false);
let isTeamAnimationMode = false; 

let mouseTarget;


// CLASSE DOT
class Dot {
  constructor(index) {
    this.initialPos = createVector(0, 0); 
    this.pos = createVector(random(width), random(height / 2)); 
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1.0; // Velocità ridotta per pallini più grandi/pesanti
    this.maxForce = 0.1;
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
  
  // Applica la repulsione dal mouse (necessaria solo in modalità Team, ma definita qui)
  applyRepulsion(target) {
    let desired = p5.Vector.sub(this.pos, target); 
    let d = desired.mag();
    
    if (d < MOUSE_REPULSION_RADIUS && d > 0) { 
        desired.normalize();
        let strength = map(d, 0, MOUSE_REPULSION_RADIUS, MOUSE_REPULSION_STRENGTH, 0);
        desired.mult(strength * 2); 
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce * 2); 
        return steer;
    }
    return createVector(0, 0);
  }

  // Tremolio basato sul rumore
  applyWiggle() {
    let noiseVal = noise(this.pos.x * 0.005 + frameCount * 0.001, this.pos.y * 0.005 + frameCount * 0.001);
    let angle = map(noiseVal, 0, 1, 0, TWO_PI);
    let wiggle = p5.Vector.fromAngle(angle);
    wiggle.mult(this.maxForce * 0.5); 
    this.acc.add(wiggle);
  }

  update(targetPos) {
    this.initialPos.set(targetPos);
    
    let seekingForce = this.seek(this.initialPos);
    this.acc.add(seekingForce);
    
    this.applyWiggle();
    this.vel.add(this.acc); 
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); 
    
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
    
    // Inizializza tutti i pallini
    for (let i = 0; i < DOT_COUNT; i++) {
        dots.push(new Dot(i));
    }

    bullets = document.querySelectorAll(".bullet");
    
    // Gestione link Team
    const teamLink = document.getElementById('team-link');
    if (teamLink) {
        teamLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            startTeamAnimation();
        });
    }
    
    // Gestione tasto di ritorno
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', exitTeamAnimation);
    }
    
    // Aggiorna la posizione del mouse
    document.addEventListener('mousemove', (event) => {
        mouseTarget = createVector(event.clientX, event.clientY);
    });

    // Aggiungi il listener per il doppio click per completare la digitazione del testo
    document.addEventListener('dblclick', () => {
        if (isTypingText) {
            skipTextTyping();
        }
    });

    mouseTarget = createVector(width / 2, height / 2);

    document.addEventListener('keydown', handleKeyPress); 
    scrollToSection(currentSectionIndex); 
}

// Eventi da tastiera 
function handleKeyPress(event) {
    if (event.key === "ArrowRight") {
        // Skip se si sta scrivendo il testo
        if (isTypingText) {
            skipTextTyping();
            return;
        }

        // Se non sta scrivendo, va alla sezione successiva
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


// Funzione per l'effetto di digitazione del testo
function typeText(id, text, setIndex, getIndex, allowTags, speed) {
    let el = document.getElementById(id);
    el.style.opacity = 1;
    let idx = getIndex();

    if (id.endsWith("-text")) {
        isTypingText = true;
    }

    function step() {
        let i = getIndex();

        // Stop immediato allo skip
        if (id.endsWith("-text") && !isTypingText) return;

        if (i >= text.length) {
            if (id.endsWith("-text")) isTypingText = false;
            return;
        }

        // Gestione dei tag HTML
        if (allowTags && text[i] === "<") {
            let closing = text.indexOf(">", i);
            let tag = text.substring(i, closing + 1);
            el.innerHTML += tag;
            setIndex(closing + 1);

            if (id.endsWith("-text")) typingTimeoutText = setTimeout(step, 10);
            else setTimeout(step, 10);

            return;
        }

        // Gestione del carattere newline
        if (text[i] === "\n") {
            el.innerHTML += "<br>";
            setIndex(i + 1);

            if (id.endsWith("-text")) typingTimeoutText = setTimeout(step, speed);
            else setTimeout(step, speed);

            return;
        }

        el.innerHTML += text.charAt(i);
        setIndex(i + 1);

        if (id.endsWith("-text")) typingTimeoutText = setTimeout(step, speed);
        else setTimeout(step, speed);
    }

    step();
}

// Funzione per saltare la digitazione del testo
function skipTextTyping() {
    const section = SECTIONS[currentSectionIndex];
    const id = section.id + "-text";

    clearTimeout(typingTimeoutText);
    isTypingText = false;

    const el = document.getElementById(id);
    el.innerHTML = section.text;

    sectionTextIndices[currentSectionIndex] = section.text.length;
}


// Uscire dalla modalità team 
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

// Avvio animazione team
function startTeamAnimation() {
    document.getElementById('navigation-bullets').style.display = 'none';
    const currentSectionId = SECTIONS[currentSectionIndex].id;
    document.getElementById(currentSectionId).style.display = 'none';

    document.getElementById('team-content').style.opacity = '1';
    
    document.getElementById('return-button').style.opacity = '1';
    document.getElementById('return-button').style.pointerEvents = 'auto'; 
    
    isTeamAnimationMode = true;
    
    // Reset dei pallini per l'animazione team (sparsi in tutta la finestra)
    dots.forEach(dot => {
        dot.initialPos = createVector(random(width), random(height)); 
        dot.vel.mult(0);
        dot.acc.mult(0);
    });
}

// Funzione principale di disegno P5.js
function draw() {
    background(BG_COLOR, 255); 

    let targetPositions = [];
    
    const animationTopOffset = height * 0.1; 
    const animationHeight = height * 0.4; 

    const centerX = width / 2;
    const adjustedCenterY = animationTopOffset + animationHeight / 2;
    
    
    if (isTeamAnimationMode) {
        // Modalità Team: REPULSIONE E TUTTI I PALLINI (DOT_COUNT = 80) SONO VISIBILI
        const loopCount = DOT_COUNT; 
        
        for (let i = 0; i < loopCount; i++) {
            
            // Applica la repulsione dal mouse
            let repulsionForce = dots[i].applyRepulsion(mouseTarget);
            dots[i].acc.add(repulsionForce);
            
            let target = dots[i].initialPos;
            
            dots[i].update(target); 
            dots[i].display();
        }
        
    } else {
        // Logica delle Sezioni: SECTION_DOT_COUNT (80) PALLINI SONO VISIBILI
        const loopCount = SECTION_DOT_COUNT; 
        
        switch (currentSectionIndex) {
            case 0: // Onda Complessa e Dinamica (WHY THIS PROJECT)
                const baseWaveAmplitude = 30; 
                const baseWaveFrequency = 0.01; 
                const waveSpeed = 0.02; 

                // Modulazioni dinamiche nel tempo
                const dynamicAmplitude = baseWaveAmplitude + sin(frameCount * 0.01) * 10; 
                const dynamicFrequency = baseWaveFrequency + cos(frameCount * 0.005) * 0.005; 
                
                for (let i = 0; i < loopCount; i++) {
                    // Mappa i pallini lungo l'asse X
                    let x = map(i, 0, loopCount - 1, width * 0.2, width * 0.8);
                    
                    // Onda principale
                    let yOffset1 = sin(x * dynamicFrequency + frameCount * waveSpeed) * dynamicAmplitude;
                    
                    // Onda secondaria/rumore per irregolarità
                    let yOffset2 = sin(x * (dynamicFrequency * 3) + frameCount * (waveSpeed * 0.5)) * (dynamicAmplitude * 0.4);
                    
                    let y = adjustedCenterY + yOffset1 + yOffset2; // Combina le onde
                    targetPositions.push(createVector(x, y));
                }
                break;
            case 1: // Quadrato (Griglia) (WHY THIS METODOLOGY)
                const dotsPerSide = ceil(sqrt(loopCount)); // 9x9 per 80 pallini
                const gridSpacing = 20; 
                const totalGridWidth = dotsPerSide * gridSpacing;

                // Calcola l'angolo in alto a sinistra per centrare il quadrato
                const startX = centerX - totalGridWidth / 2;
                const startY = adjustedCenterY - totalGridWidth / 2;
                
                for (let i = 0; i < loopCount; i++) {
                    const col = i % dotsPerSide;
                    const row = floor(i / dotsPerSide);
                    
                    let x = startX + col * gridSpacing;
                    let y = startY + row * gridSpacing; 
                    
                    targetPositions.push(createVector(x, y));
                }
                break;
            case 2: // Tre righe (WHAT IS CPJ)
                const rowCount = 3;
                const separation = 40; 
                const dotsPerRow = ceil(loopCount / rowCount); // Circa 27 pallini per riga
                for (let i = 0; i < loopCount; i++) {
                    let row = floor(i / dotsPerRow);
                    let x = map(i % dotsPerRow, 0, dotsPerRow - 1, width * 0.2, width * 0.8);
                    let y = adjustedCenterY + (row - 1) * separation * 0.7; 
                    targetPositions.push(createVector(x, y));
                }
                break;
            case 3: // Cerchio (HOW CPJ COLLECTED THIS DATASET)
                for (let i = 0; i < loopCount; i++) {
                    const radius = 120; 
                    let angle = map(i, 0, loopCount, 0, TWO_PI);
                    let x = centerX + cos(angle) * radius;
                    let y = adjustedCenterY + sin(angle) * radius; 
                    targetPositions.push(createVector(x, y));
                }
                break;
        }
        
        // Aggiorna e disegna i pallini
        for (let i = 0; i < loopCount; i++) {
            let target = targetPositions[i % targetPositions.length]; 
            dots[i].update(target);
            dots[i].display();
        }
    }
}

// Funzione windowResized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}