const CONTENT = [
    { 
        title: "WHY THIS PROJECT", 
        text: "Every killed journalist is a stolen voice, a truth that risks being buried. Far too often, those who commit these crimes go unpunished, and the world continues to ignore. Stolen Voices is our manifesto against oppression: we want the world to see, click, and reflect." 
    },
    { 
        title: "METHODOLOGY", 
        text: "The dataset was used in its entirety. Starting from this complete set of data, the analysis then focused on several key aspects, such as the level of impunity, the perpetrators of the killings, and the countries most affected. We also examined temporal trends in order to identify conflicts and periods marked by an escalation of violence.\n\nHISTORICAL CONTEXTUALIZATION\nSince the dataset did not include information on the specific conflicts in which the killings occurred, we identified the main peaks through historical and geopolitical research. This allowed us to connect what emerges from the visualization with the events that actually took place.\n\nDATASET CLEANING AND INTEGRATION\nWe worked on the original dataset, which contained several gaps, particularly in the variables “source_of_fire” and “impunity_status”. Where data was missing, we entered the value “Unknown”.\n\nINTERACTION\nThe goal of the project is not only to present numerical data, but to create a clear and interactive visualization. By clicking on each point, it is possible to access the personal profile of each journalist. Each image was then converted to black and white, ensuring visual consistency." 
    },
    { 
        title: "WHAT IS CPJ", 
        text: "The Committee to Protect Journalists (CPJ) is an independent, nonprofit organization based in New York, comprised of about 40 experts worldwide. The organization promotes press freedom globally by defending journalists’ right to work safely and without fear of reprisal." 
    },
    { 
        title: "HOW CPJ COLLECTED DATA", 
        text: "CPJ has tracked journalist fatalities since 1992, investigating and verifying each case. A death is classified as work-related only if caused by direct reprisal, crossfire, or a dangerous assignment. Cases with unclear motives are labeled “unconfirmed” and remain under investigation." 
    },
    { 
        title: "CREDITS", 
        text: "Computer Graphics Studio for Information Design\nA.Y. 2025/2026\nBachelor's Degree in Communication Design\n<img src='assets/logo_polimi-light.svg' class='credits-logo-polimi'>\nPROJECT BY:\nSara Allegro, Filippo Garbero, Letizia Neri, Vanessa Preite, Enea Tramontana and Cristina Zheng\n\n© CC BY 4.0 THE AUTHORS\nExcept where otherwise noted, all content on this website is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). You are free to share and adapt the material, including for commercial use, provided appropriate credit is given. For questions about attribution or reuse, contact us.\n\nPROFESSORS\nMichele Mauri\nDavide Conficconi\n\nTEACHING ASSISTANTS\nAlessandra Facchin\nAlessandro Nazzari\n<div class='logo-group'><img src='assets/logo_density.svg' class='credits-logo-bottom'><img src='assets/NECST_B.svg' class='credits-logo-bottom'></div>" 
    }
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    renderAccordion();
}

function draw() { background(25); }
function windowResized() { resizeCanvas(windowWidth, windowHeight); renderAccordion(); }

function renderAccordion() {
    const wrapper = document.getElementById('accordion-wrapper');
    wrapper.innerHTML = ''; 
    CONTENT.forEach(section => {
        const div = document.createElement('div');
        div.className = 'accordion-section';
        div.innerHTML = `<h2 class="accordion-header">${section.title}</h2><div class="accordion-content"><p class="about-text">${section.text}</p></div>`;
        wrapper.appendChild(div);
    });
    setupAccordionLogic();
}

function setupAccordionLogic() {
    const headers = document.querySelectorAll('.accordion-header');
    const container = document.getElementById('about-container');

    headers.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            const content = section.querySelector('.accordion-content');
            const isActive = section.classList.contains('active');

            // Se apro una sezione chiude l'altra aperta
            document.querySelectorAll('.accordion-section').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.maxHeight = null;
            });

            if (!isActive) {
                section.classList.add('active');
                
                // Calcolo lo spazio disponibile
                const allHeaders = document.querySelectorAll('.accordion-header');
                let headersTotalHeight = 0;
                allHeaders.forEach(h => headersTotalHeight += h.offsetHeight);
                
                // e ne lascio uno di sicurezza
                const availableSpace = container.offsetHeight - headersTotalHeight - 60;
                
                // sezione si espande fino a occupare lo spazio necessario 
                const targetHeight = Math.min(content.scrollHeight, availableSpace);
                
                content.style.maxHeight = targetHeight + "px";
            }
        });
    });
}