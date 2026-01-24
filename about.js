const CONTENT = {
    it: [
        { 
            title: "PERCHÉ QUESTO PROGETTO", 
            text: "Ogni giornalista ucciso è una voce rubata, una verità che rischia di essere sepolta. Troppo spesso, chi commette questi crimini rimane impunito e il mondo continua a ignorarlo. Stolen Voices è il nostro manifesto contro l'oppressione: vogliamo che il mondo veda, clicchi e rifletta." 
        },
        { 
            title: "METODOLOGIA", 
            text: "Il dataset è stato utilizzato nella sua totalità. A partire da questo insieme completo di dati, l’analisi si è poi concentrata su alcuni elementi chiave, come il grado di impunità, i responsabili degli omicidi e i Paesi maggiormente colpiti.\n\nCONTESTUALIZZAZIONE STORICA\nPoiché il dataset non includeva informazioni sui conflitti specifici in cui sono avvenute le uccisioni, abbiamo identificato i principali picchi attraverso una ricerca storica e geopolitica.\n\nPULIZIA E INTEGRAZIONE DEL DATASET\nAbbiamo lavorato sul dataset originale, che presentava diverse lacune, in particolare nelle variabili “source_of_fire” e “impunity_status”. Nei casi in cui il dato non era disponibile, abbiamo inserito la voce “Unknown”.\n\nINTERAZIONE\nL’obiettivo del progetto non è solo presentare dati numerici, ma creare una visualizzazione chiara e interattiva. Cliccando su ciascun punto, è possibile accedere alla scheda personale di ogni giornalista. Ogni immagine è stata poi convertita in bianco e nero, garantendo così coerenza visiva." 
        },
        { 
            title: "COS'È IL CPJ", 
            text: "Il Committee to Protect Journalists (CPJ) è un'organizzazione indipendente e senza scopo di lucro con sede a New York, composta da circa 40 esperti in tutto il mondo. L'organizzazione promuove la libertà di stampa a livello globale difendendo il diritto dei giornalisti a lavorare in sicurezza e senza timore di rappresaglie." 
        },
        { 
            title: "COME IL CPJ RACCOGLIE I DATI", 
            text: "Il CPJ monitora le vittime di incidenti giornalistici dal 1992, indagando e verificando ogni caso. Un decesso è classificato come correlato al lavoro solo se causato da rappresaglia diretta, fuoco incrociato o un incarico pericoloso. I casi con motivazioni poco chiare sono etichettati come \"non confermati\" e rimangono sotto inchiesta." 
        },
        { 
            title: "CREDITS", 
            text: "Laboratorio di Computer Grafica per l'Information Design\nA.A. 2025/2026\nLaurea Triennale in Design della Comunicazione\n\nPROGETTO A CURA DI:\nSara Allegro, Filippo Garbero, Letizia Neri, Vanessa Preite, Enea Tramontana e Cristina Zheng\n\n© CC BY 4.0 GLI AUTORI\nSalvo diversa indicazione, tutti i contenuti di questo sito web sono concessi in licenza Creative Commons Attribution 4.0 International (CC BY 4.0).\n\nDOCENTI\nMichele Mauri\nDavide Conficconi\n\nCULTORI DELLA MATERIA\nAlessandra Facchin\nAlessandro Nazzari" 
        }
    ],
    en: [
        { 
            title: "WHY THIS PROJECT", 
            text: "Every killed journalist is a stolen voice, a truth that risks being buried. Far too often, those who commit these crimes go unpunished, and the world continues to ignore. Stolen Voices is our manifesto against oppression: we want the world to see, click, and reflect." 
        },
        { 
            title: "METHODOLOGY", 
            text: "The dataset was used in its entirety. Starting from this complete set of data, the analysis then focused on several key aspects, such as the level of impunity and the countries most affected.\n\nHISTORICAL CONTEXTUALIZATION\nSince the dataset did not include information on the specific conflicts, we identified the main peaks through historical research.\n\nDATASET CLEANING AND INTEGRATION\nWe worked on the original dataset, which contained several gaps. Where data was missing, we entered the value “Unknown”.\n\nINTERACTION\nThe goal is to create a clear and interactive visualization. By clicking on each point, it is possible to access the personal profile of each journalist. Each image was then converted to black and white." 
        },
        { 
            title: "WHAT IS CPJ", 
            text: "The Committee to Protect Journalists (CPJ) is an independent, nonprofit organization based in New York. The organization promotes press freedom globally by defending journalists’ right to work safely." 
        },
        { 
            title: "HOW CPJ COLLECTED DATA", 
            text: "CPJ has tracked journalist fatalities since 1992, investigating and verifying each case. A death is classified as work-related only if caused by direct reprisal, crossfire, or a dangerous assignment." 
        },
        { 
            title: "CREDITS", 
            text: "Computer Graphics Studio for Information Design\nA.Y. 2025/2026\nBachelor's Degree in Communication Design\n\nPROJECT BY:\nSara Allegro, Filippo Garbero, Letizia Neri, Vanessa Preite, Enea Tramontana e Cristina Zheng\n\n© CC BY 4.0 THE AUTHORS\nExcept where otherwise noted, all content on this website is licensed under CC BY 4.0.\n\nFACULTY\nMichele Mauri\nDavide Conficconi\n\nTEACHING ASSISTANTS\nAlessandra Facchin\nAlessandro Nazzari" 
        }
    ]
};

let currentLang = 'it';

function setup() {
    createCanvas(windowWidth, windowHeight);
    initLanguageSwitcher();
    renderAccordion();
}

function draw() { background(25); }

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function initLanguageSwitcher() {
    document.getElementById('btn-it').addEventListener('click', () => switchLang('it'));
    document.getElementById('btn-en').addEventListener('click', () => switchLang('en'));
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    renderAccordion();
}

function renderAccordion() {
    const wrapper = document.getElementById('accordion-wrapper');
    wrapper.innerHTML = ''; 

    CONTENT[currentLang].forEach(section => {
        const div = document.createElement('div');
        div.className = 'accordion-section';
        div.innerHTML = `
            <h2 class="accordion-header">${section.title}</h2>
            <div class="accordion-content">
                <p class="about-text">${section.text}</p>
            </div>
        `;
        wrapper.appendChild(div);
    });

    setupAccordionLogic();
}

function setupAccordionLogic() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            const content = section.querySelector('.accordion-content');
            
            document.querySelectorAll('.accordion-section').forEach(item => {
                if (item !== section) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            section.classList.toggle('active');
            content.style.maxHeight = section.classList.contains('active') ? "50vh" : null;
        });
    });
}