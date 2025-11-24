let DOT_COUNT = 80; 
let DOT_RADIUS = 3;  
let dots = []; 
let bullets; 

// distanza minima per il campo di forze 
let MIN_DISTANCE_SQUARED = 50 * 50; 

// sezioni
let SECTIONS = [
  { id: "why-this-project", title: "WHY THIS PROJECT", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { id: "why-this-metodology", title: "WHY THIS METODOLOGY", text: "Nunc id est ante. Ut in eleifend ex. Proin sed tortor non urna fringilla scelerisque. Vivamus quis magna sit amet urna consequat dictum. Sed luctus lacus nec tortor iaculis, at consectetur libero molestie. Curabitur vel justo sed libero pretium varius. Etiam in libero in orci vehicula rutrum vitae nec libero. Proin eu ipsum at quam varius cursus ac ut felis." },
  { id: "what-is-cpj", title: "WHAT IS CPJ", text: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean vitae turpis in mi feugiat consectetur. Donec at elit tellus. Sed at metus eros. Aliquam erat volutpat. Nulla facilisi. In nec urna in elit aliquam tristique at quis ligula. Sed sit amet dolor at nibh varius placerat non nec nulla." },
  { id: "how-cpj-collected-this-dataset", title: "HOW CPJ COLLECTED THIS DATASET", text: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris euismod vel velit in dignissim. Cras tincidunt tortor in est bibendum, vitae bibendum dolor consequat. In hac habitasse platea dictumst. Sed in ex eget enim facilisis blandit. Suspendisse potenti. Nam non lectus velit." }
];

let typingTimeoutText = null;
let isTypingText = false;


// dati team
let TEAM_NAMES = ["Sara Allegro", "Filippo Garbero", "Letizia Neri", "Vanessa Preite", "Enea Tramontana", "Cristina Zheng"];
let NAMES_PER_DOT = Math.ceil(DOT_COUNT / TEAM_NAMES.length);
let RED_DOT_RATIO = 0.2; 

// variabili di stato
let currentSectionIndex = 0;
let sectionTextIndices = new Array(SECTIONS.length).fill(0);
let sectionTitleIndices = new Array(SECTIONS.length).fill(0); 
let sectionStarted = new Array(SECTIONS.length).fill(false);
let isTeamAnimationMode = false; 

let mouseTarget;

// pallini
class Dot {
  constructor(index) {
    this.initialPos = createVector(0, 0); 
    this.pos = createVector(random(width), random(height / 2)); 
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 1.5; // segue il mouse
    this.maxForce = 0.15;
    this.index = index;
    this.dotColor = random(1) < RED_DOT_RATIO ? color(255, 0, 0) : 255;
  }
  
  // forza attrattiva (seek) verso una posizione target
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

  // tremolio basato sul rumore
  applyWiggle() {
    let noiseVal = noise(this.pos.x * 0.005 + frameCount * 0.001, this.pos.y * 0.005 + frameCount * 0.001);
    let angle = map(noiseVal, 0, 1, 0, TWO_PI);
    let wiggle = p5.Vector.fromAngle(angle);
    wiggle.mult(this.maxForce * 0.5); 
    this.acc.add(wiggle);
  }

  update(targetPos) {
    this.initialPos.set(targetPos);
    
    // il target di attrazione è la posizione del mouse
    let seekingForce = this.seek(this.initialPos);
    this.acc.add(seekingForce);
    
    this.applyWiggle();
    this.vel.add(this.acc); 
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); 
    
    // mantiene i pallini entro i limiti dello schermo
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
    
    // aggiorna la posizione del mouse
    document.addEventListener('mousemove', (event) => {
        mouseTarget = createVector(event.clientX, event.clientY);
    });

    // mouseTarget al centro
    mouseTarget = createVector(width / 2, height / 2);

    document.addEventListener('keydown', handleKeyPress); 
    scrollToSection(currentSectionIndex); 
}

    // eventi da tastiera 
    function handleKeyPress(event) {
        if (event.key === "ArrowRight") {

        // skip se si sta scrivendo il testo
        if (isTypingText) {
            skipTextTyping();
            return;
        }

        // se non sta scrivendo, va alla sezione successiva
        if (currentSectionIndex < SECTIONS.length - 1) {
            if (bullets[currentSectionIndex]) bullets[currentSectionIndex].classList.remove("active");
            currentSectionIndex++;
            scrollToSection(currentSectionIndex);
        }
    }
}

// scorrimento alla sezione 
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

    if (id.endsWith("-text")) {
        isTypingText = true;
    }

    function step() {
        let i = getIndex();

        // stop immediato allo skip
        if (id.endsWith("-text") && !isTypingText) return;

        if (i >= text.length) {
            if (id.endsWith("-text")) isTypingText = false;
            return;
        }

        if (allowTags && text[i] === "<") {
            let closing = text.indexOf(">", i);
            let tag = text.substring(i, closing + 1);
            el.innerHTML += tag;
            setIndex(closing + 1);

            if (id.endsWith("-text")) typingTimeoutText = setTimeout(step, 10);
            else setTimeout(step, 10);

            return;
        }

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

function skipTextTyping() {
    const section = SECTIONS[currentSectionIndex];
    const id = section.id + "-text";

    clearTimeout(typingTimeoutText);
    isTypingText = false;

    const el = document.getElementById(id);
    el.innerHTML = section.text;

    sectionTextIndices[currentSectionIndex] = section.text.length;
}


//  uscire dalla modalità team 
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

// avvio animazione team
function startTeamAnimation() {
    document.getElementById('navigation-bullets').style.display = 'none';
    const currentSectionId = SECTIONS[currentSectionIndex].id;
    document.getElementById(currentSectionId).style.display = 'none';

    document.getElementById('team-content').style.opacity = '1';
    
    document.getElementById('return-button').style.opacity = '1';
    document.getElementById('return-button').style.pointerEvents = 'auto'; 
    
    isTeamAnimationMode = true;
    
    // reset dei pallini per l'animazione team (sparsi in tutta la finestra)
    dots.forEach(dot => {
        // posizione iniziale casuale che poi variera in base al mouse
        dot.initialPos = createVector(random(width), random(height)); 
        dot.vel.mult(0);
        dot.acc.mult(0);
    });
}

function draw() {
    background(25); 

    let targetPositions = [];
    let centerX = width / 2;
    let centerY = height / 3; 
    
    
    if (isTeamAnimationMode) {
        // i pallini seguono il mouseTarget
        for (let i = 0; i < dots.length; i++) {
            // se il mouse si muove, usa la posizione del mouse come target,
            // altrimenti, i pallini si muovono verso la loro posizione casuale iniziale
            
            // i pallini seguono il mouse
            dots[i].update(mouseTarget); 
            dots[i].display();
        }
        
    } else {
        switch (currentSectionIndex) {
            case 0: // random
                for (let i = 0; i < DOT_COUNT; i++) {
                    targetPositions.push(createVector(random(width * 0.2, width * 0.8), random(height * 0.1, height * 0.5)));
                }
                break;
            case 1: // riga orizzontale
                for (let i = 0; i < DOT_COUNT; i++) {
                    let x = map(i, 0, DOT_COUNT - 1, width * 0.2, width * 0.8);
                    targetPositions.push(createVector(x, centerY));
                }
                break;
            case 2: // tre righe
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
            case 3: // cerchio
                for (let i = 0; i < DOT_COUNT; i++) {
                    const radius = 150;
                    let angle = map(i, 0, DOT_COUNT, 0, TWO_PI);
                    let x = centerX + cos(angle) * radius;
                    let y = centerY + sin(angle) * radius;
                    targetPositions.push(createVector(x, y));
                }
                break;
        }
        
        // aggiorna e disegna i pallini
        for (let i = 0; i < dots.length; i++) {
            let target = targetPositions[i % targetPositions.length]; 
            dots[i].update(target);
            dots[i].display();
        }
    }
}

// windowResized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}