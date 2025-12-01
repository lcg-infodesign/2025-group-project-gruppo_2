let table;
let bubbles = [];
let sidebarWidth = 300;

let showLabels = false;

function preload() {
    table = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
    let mainWidth = windowWidth - sidebarWidth;
    let canvas = createCanvas(mainWidth, windowHeight);
    canvas.position(0, 30);

    buildBubbles();
}

function typeWriter(element, speed = 20, callback = null) {
    const html = element.innerHTML.trim();
    let output = "", buffer = "";
    let i = 0, insideTag = false;

    element.innerHTML = "";
    element.style.visibility = "visible";

    function type() {
        if (i >= html.length) {
            if (callback) callback();
            return;
        }

        const char = html[i];

        if (char === "<") {
            insideTag = true;
            buffer = "<";
        } else if (char === ">") {
            insideTag = false;
            buffer += ">";
            output += buffer;
            element.innerHTML = output;
            buffer = "";
        } else if (insideTag) {
            buffer += char;
        } else {
            output += char;
            element.innerHTML = output;
        }

        i++;
        setTimeout(type, speed);
    }
    type();
}

window.onload = () => {
    let headline = document.getElementById("headline");
    let arrow = document.getElementById("arrow");

    typeWriter(headline, 35, () => {
        arrow.style.opacity = "1";
    });
};

function activateSection(wrapperId, categoryFilter) {

    document.querySelectorAll(".section-wrapper").forEach(w => w.style.display = "none");

    const wrapper = document.getElementById(wrapperId);
    wrapper.style.display = "flex";

    for (let b of bubbles) {
        b.dimmed = b.category.toLowerCase() !== categoryFilter.toLowerCase();
    }

    let titleEl = wrapper.querySelector(".section-title");
    let bodyEl  = wrapper.querySelector(".section-body");
    let arrowEl = wrapper.querySelector(".arrow");

    titleEl.style.visibility = "hidden";
    bodyEl.style.visibility = "hidden";
    arrowEl.style.visibility = "hidden";
    arrowEl.style.opacity = "0";

    const titleHTML = titleEl.innerHTML;
    const bodyHTML  = bodyEl.innerHTML;

    titleEl.innerHTML = titleHTML;
    bodyEl.innerHTML = bodyHTML;

    typeWriter(titleEl, 35, () => {
        typeWriter(bodyEl, 15, () => {
            arrowEl.style.visibility = "visible";
            arrowEl.style.opacity = "1";
        });
    });
}

function activateClosure() {

    document.querySelectorAll(".section-wrapper").forEach(w => w.style.display = "none");

    const wrapper = document.getElementById("closure-wrapper");
    const bodyEl  = wrapper.querySelector(".section-body");

    wrapper.style.display = "flex";

    for (let b of bubbles) b.dimmed = false;
    showLabels = true;

    bodyEl.style.visibility = "hidden";

    const bodyHTML = bodyEl.innerHTML;

    bodyEl.innerHTML = bodyHTML;

    typeWriter(bodyEl, 20);
}



// primo click apre unknown
document.getElementById("arrow").addEventListener("click", () => {
    document.getElementById("headline-wrapper").style.display = "none";
    activateSection("unknown-wrapper", "Unknown");
});

// unknown → complete
document.getElementById("arrow-unknown").addEventListener("click", () => {
    activateSection("complete-wrapper", "Complete Impunity");
});

// complete → partial
document.getElementById("arrow-complete").addEventListener("click", () => {
    activateSection("partial-wrapper", "Partial Impunity");
});

// partial → full
document.getElementById("arrow-partial").addEventListener("click", () => {
    activateSection("full-wrapper", "Full Justice");
});

// full → closure
document.getElementById("arrow-full").addEventListener("click", () => {
    document.getElementById("full-wrapper").style.display = "none";
    activateClosure();
});


function draw() {
  let hoveringLabel = false;

    for (let b of bubbles) {
        if (showLabels && b.labelClicked(mouseX, mouseY)) {
            hoveringLabel = true;
            break;
        }
    }

    // pointer
    if (hoveringLabel) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    background(25);

    for (let b of bubbles) {
        let d = dist(mouseX, mouseY, b.x, b.y);
        b.isHovered = d < b.r;
    }

    for (let b of bubbles) {
        b.update();
        b.show();
    }

    // linea verticale sfumata
    let blurWidth = 10, maxAlpha = 200;
    for (let i = 0; i < blurWidth; i++) {
        stroke(128, 128, 128, map(i, 0, blurWidth - 1, maxAlpha, 0));
        line(width - i, 0, width - i, height);
    }
}

function buildBubbles() {
    if (!table) return;

    let impCol = -1;

    for (let c = 0; c < table.getColumnCount(); c++) {
        if (table.columns[c].toLowerCase().includes("impunity"))
            impCol = c;
    }

    if (impCol === -1) {
        console.error("Colonna impunity non trovata.");
        return;
    }

    let data = {};

    for (let r = 0; r < table.getRowCount(); r++) {
        let v = table.getString(r, impCol).trim();
        if (v === "") v = "Unknown";
        if (!data[v]) data[v] = [];
        data[v].push(r);
    }

    let order = ["Unknown", "Full Justice", "Complete Impunity", "Partial Impunity"];
    let cats = order.filter(c => data[c]);

    bubbles = [];

    let cx = width / 2;
    let cy = height / 2;
    let offset = 200;

    let positions = [
        { x: cx - offset, y: cy },
        { x: cx, y: cy - offset },
        { x: cx + offset, y: cy },
        { x: cx, y: cy + offset }
    ];

    cats.forEach((cat, i) => {
        let n = data[cat].length;
        let r = constrain(sqrt(n) * 4, 40, 220);

        bubbles.push(new Bubble(
            positions[i].x,
            positions[i].y,
            r,
            n,
            cat,
            n
        ));
    });
}

class Bubble {
    constructor(x, y, r, count, category, total) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.category = category;
        this.count = total;
        this.isHovered = false;
        this.dimmed = false;

        this.points = [];

        for (let i = 0; i < count; i++) {
            this.points.push({
                angle: random(TWO_PI),
                rad: this.r * sqrt(random()),
                offset: random(1000),
                speed: random(-0.003, 0.003)
            });
        }
    }

    update() {
        let speedFactor = this.isHovered ? 0.45 : 1;

        for (let p of this.points) {
            p.angle += p.speed * speedFactor;
            p.rad = constrain(
                p.rad + sin((frameCount + p.offset) * 0.01) * 0.2 * speedFactor,
                0,
                this.r
            );
        }
    }

    show() {
        noStroke();
        fill(this.dimmed ? "rgba(255,255,255,0.15)" : "white");

        for (let p of this.points) {
            let rr = p.rad + sin(frameCount * 0.01 + p.offset) * 0.8;
            circle(this.x + cos(p.angle) * rr, this.y + sin(p.angle) * rr, 3);
        }

        if (showLabels) {
            fill(255);
            textAlign(CENTER, BOTTOM);
            textSize(12);
            textFont("JetBrains Mono");
            text(this.category, this.x, this.y - this.r - 8);
        }
    }

    labelClicked(mx, my) {
        textSize(12);
        textFont("JetBrains Mono");
        let tw = textWidth(this.category);
        let th = 14;

        let lx = this.x - tw / 2;
        let ly = this.y - this.r - 8;

        return mx > lx && mx < lx + tw && my > ly - th && my < ly;
    }

}

function mousePressed() {
    for (let b of bubbles) {
        if (showLabels && b.labelClicked(mouseX, mouseY)) {
            triggerSectionFromLabel(b.category);
        }
    }
}

function triggerSectionFromLabel(cat) {
    const map = {
        "Unknown":      ["unknown-wrapper", "Unknown"],
        "Complete Impunity": ["complete-wrapper", "Complete Impunity"],
        "Partial Impunity":  ["partial-wrapper", "Partial Impunity"],
        "Full Justice":      ["full-wrapper", "Full Justice"]
    };

    if (!map[cat]) return;
    
    const [wrapperId, filter] = map[cat];

    activateSection(wrapperId, filter);
}


function windowResized() {
    resizeCanvas(windowWidth - sidebarWidth, windowHeight);
}
