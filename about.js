let SECTIONS = [
  { id: "why-this-project", title: "WHY THIS PROJECT", text: 'Every killed journalist is a stolen voice, a truth that risks being buried. Far too often, those who commit these crimes go unpunished, and the world continues to ignore. "Stolen Voices" is our manifesto against oppression: we want the world to see, click, and reflect.'},
  { id: "why-this-metodology", title: "METODOLOGY", text: 'The analysis focused on key elements such as the degree of impunity, the perpetrators, and the most affected countries, while also observing trends over time to identify conflicts and periods of particularly intense violence. The goal is not just to present numbers but to create a clear, interactive visualization that allows users to explore the data in detail: by clicking on each dot, it is possible to access the personal profile of each journalist. This way, alarming data becomes concrete and immediately understandable, bringing to light trends, responsibilities, and geographies of violence against the press.' },
  { id: "what-is-cpj", title: "WHAT IS CPJ", text: "The Committee to Protect Journalists (CPJ) is an independent, nonprofit organization based in New York, comprised of about 40 experts around the world. The organization promotes press freedom globally by defending the right of journalists to work safely and without fear of reprisal." },
  { id: "how-cpj-collected-this-dataset", title: "HOW CPJ COLLECTED DATA", text: "The CPJ has tracked journalist fatalities since 1992, investigating and verifying every case. They classify a death as work-related only if the cause is direct reprisal, crossfire, or a dangerous assignment. Cases with unclear motives are labeled as unconfirmed and remain under investigation." }
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    populateContent(); // 1. Popola i testi nell'HTML
    setupAccordion();  // 2. Attiva la logica click
}

function draw() {
    background(25);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function populateContent() {
    SECTIONS.forEach(section => {
        // Inserisce il titolo
        let titleEl = document.getElementById(`${section.id}-title`);
        if(titleEl) titleEl.innerText = section.title;
        // Inserisce il testo
        let textEl = document.getElementById(`${section.id}-text`);
        if(textEl) textEl.innerText = section.text;
    });
}

function setupAccordion() {
    // Seleziona tutti gli header
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', function() {
            // Trova la sezione genitore
            const section = this.parentElement;
            
            // Chiudi tutte le altre sezioni
            document.querySelectorAll('.accordion-section').forEach(item => {
                if (item !== section) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // Toggle della classe active
            section.classList.toggle('active');

            // Gestione altezza
            const content = section.querySelector('.accordion-content');
            if (section.classList.contains('active')) {
            // Imposto max-height
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
}