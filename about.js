//queste non ci servono -> da togliere ma se si tolgono si sminchia tutto quindi capire
let DOT_COUNT = 80;         // totale pallini
let SECTION_DOT_COUNT = 80;
let DOT_RADIUS = 3;         // raggio pallino
let dots = []; 


let bullets; 

// variabili x animazione typing
let typingTimeoutText = null;
let isTypingText = false;


// sezioni contenuto
let SECTIONS = [
  { id: "why-this-project", title: "ABOUT THIS PROJECT", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { id: "why-this-metodology", title: "METODOLOGY", text: "Nunc id est ante. Ut in eleifend ex. Proin sed tortor non urna fringilla scelerisque. Vivamus quis magna sit amet urna consequat dictum. Sed luctus lacus nec tortor iaculis, at consectetur libero molestie. Curabitur vel justo sed libero pretium varius. Etiam in libero in orci vehicula rutrum vitae nec libero. Proin eu ipsum at quam varius cursus ac ut felis." },
  { id: "what-is-cpj", title: "WHAT IS CPJ", text: "The Committee to Protect Journalists (CPJ) is an independent, nonprofit organization based in New York, comprised of about 40 experts around the world. The organization promotes press freedom globally by defending the right of journalists to work safely and without fear of reprisal." },
  { id: "how-cpj-collected-this-dataset", title: "HOW CPJ COLLECTED DATA", text: "The CPJ has tracked journalist fatalities since 1992, investigating and verifying every case. They classify a death as work-related only if the cause is direct reprisal, crossfire, or a dangerous assignment. Cases with unclear motives are labeled as unconfirmed and remain under investigation." }
];

// dati team - DA TOGLIERE
let TEAM_NAMES = ["Sara Allegro", "Filippo Garbero", "Letizia Neri", "Vanessa Preite", "Enea Tramontana", "Cristina Zheng"];
let NAMES_PER_DOT = Math.ceil(DOT_COUNT / TEAM_NAMES.length);
let RED_DOT_RATIO = 0.2; 

// variabili di stato
let currentSectionIndex = 0;
let sectionTextIndices = new Array(SECTIONS.length).fill(0);
let sectionTitleIndices = new Array(SECTIONS.length).fill(0); 
let sectionStarted = new Array(SECTIONS.length).fill(false);



// dots da capire come togliere
class Dot {
}

function setup() {
    createCanvas(windowWidth, windowHeight); 
    
    // inizializza i pallini
    for (let i = 0; i < DOT_COUNT; i++) {
        dots.push(new Dot(i));
    }

    bullets = document.querySelectorAll(".bullet");

    document.addEventListener('keydown', handleKeyPress); 
    scrollToSection(currentSectionIndex); 
}

// eventi tastiera 
function handleKeyPress(event) {
    if (event.key === "ArrowRight") {
        // skip a testo completo
        if (isTypingText) {
            skipTextTyping();
            return;
        }

        // se non sta scrivendo passa alla sezione successiva
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

// scorrimento alla sezione ?????????
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


// animazione typing
function typeText(id, text, setIndex, getIndex, allowTags, speed) {
    let el = document.getElementById(id);
    el.style.opacity = 1;
    let idx = getIndex();

    if (id.endsWith("-text")) {
        isTypingText = true;
    }

    function step() {
        let i = getIndex();

        // skip
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

function draw() {
    background(25);        
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}