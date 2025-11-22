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


function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}


function setup() {
  let pageHeight = document.documentElement.scrollHeight;
  createCanvas(windowWidth, pageHeight);
  
  typeTitle();
  setupIntroTrigger();

  //estrae colonna country
  const countries = data.getColumn("country");

  //valori unici
  const uniqueCountries = new Set(countries);

  console.log("Valori unici:", [...uniqueCountries]);
  console.log("Numero di valori unici:", uniqueCountries.size);

  // pallini
  bullets = document.querySelectorAll(".bullet");

  // navigazione con freccia destra
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && introStarted && !isTyping) {
      nextSection();
    }
  });

  // scroll al testo quando clicchi la freccia
  document.getElementById("arrow").addEventListener("click", () => {
    let container = document.getElementById("intro-container");
    let rect = container.getBoundingClientRect();

    // posizione dell’elemento relativa all’intera pagina
    const scrollTarget = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth"
    });
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
    if (typingIndex < sectionsText[index].length) {
      introEl.textContent += sectionsText[index].charAt(typingIndex);
      typingIndex++;
      setTimeout(typeChar, 40);
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
  let pageHeight = document.documentElement.scrollHeight;
  resizeCanvas(windowWidth, pageHeight);
}
