// src/components/knowledge/KnowledgeSection.js
export class KnowledgeSection extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("data-title") || "";
        this.className = "dropdown";

        const cards = Array.from(this.children);

        this.replaceChildren();

        // Create header
        const header = document.createElement("div");
        header.className = "dropdown-header";
        header.setAttribute('role', 'button');
        header.tabIndex = 0;
        header.setAttribute('aria-expanded', 'false');

        const span = document.createElement('span');
        span.textContent = title;

        const img = document.createElement('img');
        img.className = 'dropdown-arrow';
        img.src = './public_assets/images/_Images/DropDown/Arrow_Left.png';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        header.append(span, img);

        const content = document.createElement("div");
        content.className = "dropdown-content";

        // Rebuild structure
        this.appendChild(header);
        this.appendChild(content);

        // Move cards into content
        cards.forEach(card => content.appendChild(card));

        const toggle = () => {
            const isOpen = content.classList.toggle("open");
            img.style.transform = isOpen ? "rotate(-90deg)" : "rotate(0deg)";
            header.setAttribute('aria-expanded', String(isOpen));
        };

        header.addEventListener("click", toggle);
        header.addEventListener("keydown", (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    }
}

if (!customElements.get("knowledge-section")) {
    customElements.define("knowledge-section", KnowledgeSection);
}