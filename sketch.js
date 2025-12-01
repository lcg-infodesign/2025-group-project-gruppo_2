let data;

let titleText = "STOLEN VOICES";
let titleIndex = 0;

// singola sezione di testo
let introTextContent =
  "Every story deserves justice. Every year, dozens of journalists are killed for informing the world."
let typingIndex = 0;
let typingTimeout = null;
let isTyping = false;
let introStarted = false;

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  typeTitle();
  setupIntroTrigger();

  let countries = data.getColumn("country");
  let uniqueCountries = new Set(countries);
  console.log("Valori unici:", [...uniqueCountries]);
  console.log("Numero di valori unici:", uniqueCountries.size);

  document.getElementById("arrow").addEventListener("click", () => {
    let container = document.getElementById("intro-container");
    let rect = container.getBoundingClientRect();

    let scrollTarget = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;

    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
  });
}

// animazione titolo
function typeTitle() {
  let titleEl = document.getElementById("title");

  if (titleIndex < titleText.length) {
    titleEl.textContent += titleText.charAt(titleIndex);
    titleIndex++;
    setTimeout(typeTitle, 200);
  }
}

// attiva il typing quando il contenuto entra in viewport
function setupIntroTrigger() {
  let target = document.getElementById("intro-container");

  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !introStarted) {
          introStarted = true;
          typeIntro();
        }
      });
    },
    { root: null, threshold: 0.6 }
  );

  observer.observe(target);
}

// animazione typing singola sezione
function typeIntro() {
  const introEl = document.getElementById("intro-text");
  introEl.style.opacity = 1;

  typingIndex = 0;
  introEl.textContent = "";
  isTyping = true;

  function typeChar() {
    if (!isTyping) return;

    if (typingIndex < introTextContent.length) {
      introEl.textContent += introTextContent.charAt(typingIndex);
      typingIndex++;
      typingTimeout = setTimeout(typeChar, 50);
    } else {
      isTyping = false;
      showButton();
    }
  }

  typeChar();
}

// mostra il bottone alla fine dell'animazione
function showButton() {
  const btn = document.getElementById("button");
  if (btn) btn.style.opacity = "1";
}

function draw() {
  background(25);
}

function windowResized() {
  resizeCanvas(windowWidth, window.innerHeight);
}
