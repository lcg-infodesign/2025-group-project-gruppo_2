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

// variabili di stato
let currentSectionIndex = 0;
let sectionTextIndices = new Array(SECTIONS.length).fill(0);
let sectionTitleIndices = new Array(SECTIONS.length).fill(0);
let sectionStarted = new Array(SECTIONS.length).fill(false);

function setup() {
    createCanvas(windowWidth, windowHeight);

    // gestione tasti
    document.addEventListener('keydown', handleKeyPress);

    scrollToSection(currentSectionIndex);
}

// eventi tastiera
function handleKeyPress(event) {

    // freccia destra x andare avanti
    if (event.key === "ArrowRight") {

        // se sta scrivendo il testo skippa al testo completo
        if (isTypingText) {
            skipTextTyping();
            return;
        }

        // sezione successiva
        if (currentSectionIndex < SECTIONS.length - 1) {
            currentSectionIndex++;
            scrollToSection(currentSectionIndex);
        }
    }

    // freccia sinistra x tornare indietro
    else if (event.key === "ArrowLeft") {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            scrollToSection(currentSectionIndex);
        }
    }
}

// mostra solo la sezione corretta
function scrollToSection(index) {

    let sectionId = SECTIONS[index].id;
    let allSections = document.querySelectorAll('.about-section');

    allSections.forEach(section => section.style.display = 'none');

    let targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    targetSection.style.display = 'flex';

    // animazione parte all apertura della pagina
    if (!sectionStarted[index]) {
        sectionStarted[index] = true;

        document.getElementById(`${sectionId}-title`).textContent = "";
        document.getElementById(`${sectionId}-text`).textContent = "";

        // typing titolo
        typeText(
            `${sectionId}-title`,
            SECTIONS[index].title,
            (idx) => sectionTitleIndices[index] = idx,
            () => sectionTitleIndices[index],
            false,
            50
        );

        // typing testo
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

// animazione typing
function typeText(id, text, setIndex, getIndex, allowTags, speed) {
    let el = document.getElementById(id);
    el.style.opacity = 1;

    if (id.endsWith("-text")) {
        isTypingText = true;
    }

    function step() {
        let i = getIndex();

        if (id.endsWith("-text") && !isTypingText) return;

        if (i >= text.length) {
            if (id.endsWith("-text")) isTypingText = false;
            return;
        }

        // markup
        if (allowTags && text[i] === "<") {
            let closing = text.indexOf(">", i);
            el.innerHTML += text.substring(i, closing + 1);
            setIndex(closing + 1);
            setTimeout(step, 10);
            return;
        }

        // newline
        if (text[i] === "\n") {
            el.innerHTML += "<br>";
            setIndex(i + 1);
            setTimeout(step, speed);
            return;
        }

        el.innerHTML += text.charAt(i);
        setIndex(i + 1);

        setTimeout(step, speed);
    }

    step();
}

// skip animazione testo
function skipTextTyping() {
    const section = SECTIONS[currentSectionIndex];
    const el = document.getElementById(section.id + "-text");

    clearTimeout(typingTimeoutText);
    isTypingText = false;

    el.innerHTML = section.text;
    sectionTextIndices[currentSectionIndex] = section.text.length;
}

function draw() {
    background(25);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}