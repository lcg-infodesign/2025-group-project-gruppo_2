let data;

let titleText = "STOLEN VOICES";
let titleIndex = 0;

// sezioni di testo
let sectionsText = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. >",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. >",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. >",
];

let currentSection = 0;
let bullets;
let typingIndex = 0;
let isTyping = false;

let introIndex = 0;
let introStarted = false; // evita doppia animazione
let typingTimeout = null;


function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}


function setup() {

  createCanvas(windowWidth, windowHeight);
  
  typeTitle();
  setupIntroTrigger();

  //estrae colonna country
  let countries = data.getColumn("country");

  //valori unici
  let uniqueCountries = new Set(countries);

  console.log("Valori unici:", [...uniqueCountries]);
  console.log("Numero di valori unici:", uniqueCountries.size);

  // pallini
  bullets = document.querySelectorAll(".bullet");

  // navigazione con freccia destra
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && introStarted) {

      // skip durante l animazione
      if (isTyping) {
        isTyping = false;      // ferma animazione
        clearTimeout(typingTimeout);

        // mostra subito tutto il testo della sezione completo
        document.getElementById("intro-text").textContent = sectionsText[currentSection];
        return;
      }

      // se si preme la freccetta non durante il typing passa alla prossima sezione
      nextSection();
    }

    if (e.key === "ArrowLeft") {
      prevSection();
    }
  });


  // scroll al testo quando clicchi la freccia
  document.getElementById("arrow").addEventListener("click", () => {
    let container = document.getElementById("intro-container");
    let rect = container.getBoundingClientRect();

    // posizione dell’elemento relativa all’intera pagina
    let scrollTarget = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth"
    });

    // mostra la scritta di navigazione
    const help = document.getElementById("navigation-help");
    help.style.opacity = 1;
    });
}


//animazione che scrive il titolo
function typeTitle() {
  let titleEl = document.getElementById("title");

  if (titleIndex < titleText.length) {
    titleEl.textContent += titleText.charAt(titleIndex);
    titleIndex++;
    setTimeout(typeTitle, 200);
  }
}


// l'animazione intro text appare solo quando il testo si trova al centro della pagina
function setupIntroTrigger() {
  let target = document.getElementById("intro-container");

  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !introStarted) {
        introStarted = true;

        // quando entra in viewport parte la prima sezione
        bullets[0].classList.add("active");
        typeSection(0);
      }
    });
  }, {
    root: null,
    threshold: 0.6 // 60% dell'epigrafe visibile
  });

  observer.observe(target);
}

// animazione per ogni sezione
function typeSection(index) {
  let introEl = document.getElementById("intro-text");
  introEl.style.opacity = 1;

  introEl.textContent = "";
  typingIndex = 0;
  isTyping = true;

  function typeChar() {
    // skip al testo gia completo
    if (!isTyping) return;

    if (typingIndex < sectionsText[index].length) {
      introEl.textContent += sectionsText[index].charAt(typingIndex);
      typingIndex++;
      typingTimeout = setTimeout(typeChar, 30);
    } else {
      isTyping = false;
    }
  }

  typeChar();
}



// cambio sezione e aggiornamento pallini
function nextSection() {
  bullets[currentSection].classList.remove("active");

  currentSection++;

  if (currentSection < sectionsText.length) {
    bullets[currentSection].classList.add("active");
    typeSection(currentSection);
  } else {
    // quando finiscono le sezioni mostra il bottone
    showButton();
  }
}

//possibilità di tornare indietro nelle sezioni
function prevSection() {
  if (currentSection === 0) return; // se siamo al primo blocco non fa nulla

  bullets[currentSection].classList.remove("active");
  currentSection--;

  bullets[currentSection].classList.add("active");
  typeSection(currentSection);

  // se torni indietro nasconde il bottone
  const btn = document.getElementById("button");
  if (btn) btn.style.opacity = "0";
}

// mostra il bottone
function showButton() {
  const btn = document.getElementById("button");
  if (btn) {
    btn.style.opacity = "1";
  }
}




function draw() {
  background(25);
}


function windowResized() {
  resizeCanvas(windowWidth, window.innerHeight);
}

