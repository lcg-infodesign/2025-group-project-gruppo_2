// testi

let titleText = "ABOUT US";
let aboutIntroText =
  "We are students from Politecnico di Milano,\n" +
  "united by a shared passion for data analysis\n" +
  "and its power to <span class='red'>reveal complex realities</span>.\n" +
  "With this university project, we aim to shed\n" +
  "light on the <span class='red'>violence</span> faced by <span class='red'>journalists</span> around\n" +
  "the world. Through structured data and intuitive\n" +
  "visualizations, we highlight the severity,\n" +
  "geographic spread, and specific forms of threats,\n" +
  "torture, and killings that journalists endure in\n" +
  "the course of their work.";

let teamTitleText = "OUR TEAM";
let aboutTeamText =
  "Sara Allegro\n" +
  "Filippo Garbero\n" +
  "Letizia Neri\n" +
  "Vanessa Preite\n" +
  "Enea Tramontana\n" +
  "Cristina Zheng";

let projectTitleText = "OUR PROJECT";
let aboutProjectText = 
"Our goal is to make data clear, accessible, and\n" +
"meaningful—offering an understandable overview of\n" +
"the work carried out by the <span class='red'>Committee to Protect</span>\n" +
"<span class='red'>Journalists</span> (CPJ) in documenting <span class='red'>journalists and</span>\n" +
"<span class='red'>media workers killed</span> in conflict and high-risk\n" +
"environments.\n\n" + 
"We strive to enable <span class='red'>interactive exploration</span> through\n" +
"visualizations that help users grasp connections,\n" +
"trends, and dynamics across time and space.\n\n" +

"We aim to <span class='red'>restore the human value</span> behind each\n" +
"datapoint, recognizing that every entry represents a\n" +
"story, a name, and a commitment to truth.\n\n" +
 
"Ultimately, this project seeks to promote awareness\n" +
"of <span class='red'>press freedom</span> and reveal the real impact of\n" +
"violence on the <span class='red'>right to information.</span>";

let titleIndex = 0;

let introIndex = 0;
let introStarted = false;

let teamTitleIndex = 0;
let teamIndex = 0;
let teamStarted = false;

let projectTitleIndex = 0;
let projectIndex = 0;
let projectStarted = false;


// titolo

function setup() {
  createCanvas(windowWidth, document.documentElement.scrollHeight);
  typeTitle();
  initObservers();
}

function typeTitle() {
  let el = document.getElementById("title");

  if (titleIndex < titleText.length) {
    el.textContent += titleText.charAt(titleIndex);
    titleIndex++;
    setTimeout(typeTitle, 150);
  }
}


// intersection observers (calcola quando il testo diventa visibile x far partire l animazione)

function initObservers() {

  observeAndType(
    "about-intro",
    () => typeText("about-intro", aboutIntroText, () => introIndex++, () => introIndex),
    () => introStarted = true,
    () => introStarted
  );

  document.getElementById("our-team").textContent = "";
  observeAndType(
    "our-team",
    () => typeText("our-team", teamTitleText, () => teamTitleIndex++, () => teamTitleIndex),
    () => {}, () => false // parte subito
  );

  observeAndType(
    "about-team",
    () => typeText("about-team", aboutTeamText, () => teamIndex++, () => teamIndex),
    () => teamStarted = true,
    () => teamStarted
  );

  document.getElementById("our-project").textContent = "";
  observeAndType(
    "our-project",
    () => typeText("our-project", projectTitleText, () => projectTitleIndex++, () => projectTitleIndex),
    () => {}, () => false
  );

  observeAndType(
    "about-project",
    () => typeText("about-project", aboutProjectText, () => projectIndex++, () => projectIndex),
    () => projectStarted = true,
    () => projectStarted
  );
}


// funzione x animazione macchina da scrivere che si avvia con l observer

function observeAndType(id, typeCallback, setStarted, isStarted) {
  let element = document.getElementById(id);

  let observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isStarted()) {
        setStarted();
        typeCallback();
        observer.unobserve(element);
      }
    });
  }, {
    root: null,
    threshold: 0.6
  });

  observer.observe(element);
}


// animazione testo generale

function typeText(id, text, incrementIndex, getIndex) {
  let el = document.getElementById(id);
  el.style.opacity = 1;

  let idx = getIndex();

  // Fine testo → stop
  if (idx >= text.length) return;

  // --- Gestione tag HTML completi (come <span> e </span>) ---
  if (text[idx] === "<") {
    let closing = text.indexOf(">", idx); // trova la fine del tag
    let tag = text.substring(idx, closing + 1); // prende tutto il tag

    el.innerHTML += tag;

    // salta tutto il tag
    idx = closing + 1;
    while (getIndex() < idx) incrementIndex();

    setTimeout(() => typeText(id, text, incrementIndex, getIndex), 10);
    return;
  }

  // --- Gestione newline \n → <br> ---
  if (text[idx] === "\n") {
    el.innerHTML += "<br>";
    incrementIndex();
    setTimeout(() => typeText(id, text, incrementIndex, getIndex), 35);
    return;
  }

  // --- carattere normale ---
  el.innerHTML += text.charAt(idx);
  incrementIndex();
  setTimeout(() => typeText(id, text, incrementIndex, getIndex), 35);
}





function draw() {
  background(25);
}

function windowResized() {
  resizeCanvas(windowWidth, document.documentElement.scrollHeight);
}
