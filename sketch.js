let data;

let titleText = "STOLEN VOICES";
let titleIndex = 0;


let introText =
  "This platform provides an interactive view of a dataset documenting journalists who have lost their lives in the pursuit of truth. Here, you can explore detailed data and personal stories that reveal the human and historical impact of these events.\n\nUse the right arrow key on your keyboard to navigate through the sections and discover the data in an intuitive, interactive way.";

let introIndex = 0;
let introStarted = false; //evita doppia animazione


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

//l animazione intro text appare solo quando il testo si trova al centro della pagina
function setupIntroTrigger() {
  let target = document.getElementById("intro-text");

  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !introStarted) {
        introStarted = true;
        typeIntroText();
      }
    });
  }, {
    root: null,
    threshold: 0.6     //60% dell'epigrafe visibile
  });

  observer.observe(target);
}

//animazione intro text
function typeIntroText() {
  let introEl = document.getElementById("intro-text");
  introEl.style.opacity = 1;

  if (introIndex < introText.length) {
    introEl.textContent += introText.charAt(introIndex);
    introIndex++;
    setTimeout(typeIntroText, 70);
  }
}


function draw() {
  background(25);
}


function windowResized() {
  let pageHeight = document.documentElement.scrollHeight;
  resizeCanvas(windowWidth, pageHeight);
}
