let titleText = "MEET THE TEAM";
let titleIndex = 0;

let typingSpeed = 70;   // velocità typing
let nameTypingSpeed = 70;

let titleElement;
let nameElements = [];


function typeTitle() {
    if (titleIndex < titleText.length) {
        titleElement.innerHTML += titleText.charAt(titleIndex);
        titleIndex++;
        setTimeout(typeTitle, typingSpeed);
    } else {
        // quando finisce il titolo partono i nomi
        startNamesTyping();
    }
}

function startNamesTyping() {
    nameElements.forEach(el => {
        let full = el.dataset.fullname;
        typeName(el, full, 0);
    });
}

function typeName(element, fullText, index) {
    if (index < fullText.length) {
        element.innerHTML += fullText.charAt(index);
        setTimeout(() => typeName(element, fullText, index + 1), nameTypingSpeed);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    titleElement = document.getElementById("team-title");

    nameElements = Array.from(document.querySelectorAll(".team-name"));

    titleElement.innerHTML = "";
    nameElements.forEach(el => el.innerHTML = "");

    // avvia animazione titolo
    typeTitle();
}

function draw() {
    background(25);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
