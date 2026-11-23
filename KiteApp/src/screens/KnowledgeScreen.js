import "../components/knowledge/KnowledgeSearch.js";
import "../components/knowledge/KnowledgeSection.js";
import "../components/knowledge/KnowledgeCard.js";
import { knowledgeData } from "../data/knowledgeData.js";
import { handleSearch, renderDropdowns} from "../services/KnowledgeService.js";

export class KnowledgeScreen extends HTMLElement {
    connectedCallback() {
        this.className = "knowledge-root";
        this.render();
        renderDropdowns(this);
    }

    render() {
        this.replaceChildren();

        const screen = document.createElement("div");
        screen.className = "knowledge-screen";

        const top = document.createElement("div");
        top.className = "knowledge-top";

        const icon = document.createElement("img");
        icon.src = "../../public_assets/images/_Images/IconsAndLogos/Icon_Knowledge.png";
        icon.className = "knowledge-icon";
        icon.alt = "Wissen Icon";

        const heading = document.createElement("h1");
        heading.textContent = "WISSEN";
        top.append(icon, heading);

        const searchComponent = document.createElement("knowledge-search");

        const intro = document.createElement("div");
        intro.className = "knowledge-intro";
        const introTitle = document.createElement("h2");
        introTitle.textContent = "Biases im Gründungsprozess";
        const introText = document.createElement("p");
        introText.textContent = "Wirst du anders bewertet, weil du eine Frau bist? Hier findest du die gängigsten Biases – einfach erklärt mit Beispielen aus echten Gründungssituationen.";
        intro.append(introTitle, introText);

        const searchResults = document.createElement("div");
        searchResults.className = "search-results";
        searchResults.style.display = "none";

        const dropdowns = document.createElement("div");
        dropdowns.className = "knowledge-dropdowns";

        screen.append(top, searchComponent, intro, searchResults, dropdowns);

        const footer = document.createElement("footer-nav");
        this.append(screen, footer);

        const search = this.querySelector("knowledge-search");
        search.addEventListener("search-changed", (e) => {
            this.handleSearch(e.detail.query || "");
        });
    }

    renderDropdowns() {
        const dropdowns = this.querySelector(".knowledge-dropdowns");
        if (!dropdowns) return;
        dropdowns.replaceChildren();

        knowledgeData.forEach((section) => {
            const sectionEl = document.createElement("knowledge-section");
            sectionEl.setAttribute("data-title", section.title);

            section.items.forEach((item) => {
                const card = document.createElement("knowledge-card");
                card.setAttribute("data-id", item.id);
                card.setAttribute("data-title", item.title);
                card.setAttribute("data-preview", item.preview);
                sectionEl.appendChild(card);
            });

            dropdowns.appendChild(sectionEl);
        });
    }

    handleSearch(query) {
        const q = query.toLowerCase().trim();
        const dropdownsEl = this.querySelector(".knowledge-dropdowns");
        const searchResultsEl = this.querySelector(".search-results");
        if (!dropdownsEl || !searchResultsEl) return;

        if (!q) {
            dropdownsEl.style.display = "";
            searchResultsEl.style.display = "none";
            searchResultsEl.replaceChildren();
            return;
        }

        dropdownsEl.style.display = "none";
        searchResultsEl.replaceChildren();
        searchResultsEl.style.display = "flex";
        searchResultsEl.style.flexDirection = "column";
        searchResultsEl.style.gap = "10px";

        const matches = [];
        knowledgeData.forEach((section) => {
            section.items.forEach((item) => {
                const text = `${item.title} ${item.preview} ${item.text}`.toLowerCase();
                if (text.includes(q)) matches.push(item);
            });
        });

        if (!matches.length) {
            const noRes = document.createElement("div");
            noRes.className = "no-results";
            noRes.textContent = "Keine Ergebnisse";
            searchResultsEl.appendChild(noRes);
            return;
        }

        const frag = document.createDocumentFragment();
        matches.forEach((item) => {
            const card = document.createElement("knowledge-card");
            card.setAttribute("data-id", item.id);
            card.setAttribute("data-title", item.title);
            card.setAttribute("data-preview", item.preview);
            frag.appendChild(card);
        });
        searchResultsEl.appendChild(frag);
    }
}

if (!customElements.get("knowledge-screen")) {
    customElements.define("knowledge-screen", KnowledgeScreen);
}



