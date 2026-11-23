// src/components/knowledge/KnowledgeCard.js
export class KnowledgeCard extends HTMLElement {
    connectedCallback() {
        const id = this.getAttribute("data-id");
        const title = this.getAttribute("data-title") || "";
        const preview = this.getAttribute("data-preview") || "";

        this.className = "white-box";
        this.innerHTML = `
      <div class="font-adjustable white-title">${title}</div>
      <div class="font-adjustable white-preview">${preview}</div>
    `;

        this.addEventListener("click", () => {
            if (!id) return;
            window.location.hash = `/wissen/${id}`;
        });
    }
}

if (!customElements.get("knowledge-card")) {
    customElements.define("knowledge-card", KnowledgeCard);
}
