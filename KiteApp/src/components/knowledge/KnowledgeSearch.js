// src/components/knowledge/KnowledgeSearch.js
export class KnowledgeSearch extends HTMLElement {
    connectedCallback() {
        this.className = "knowledge-searchbar";
        this.innerHTML = `
      <input type="search" placeholder="SUCHE" />
      <span class="search-icon"></span>
    `;

        const input = this.querySelector("input");
        const icon = this.querySelector(".search-icon");

        const updateIcon = () => {
            const hasText = input.value.trim().length > 0;

            if (hasText) {
                icon.style.webkitMaskImage = "url('./public_assets/images/_Images/Buttons/BurgerMenu/close_2x.png')";
                icon.style.maskImage = "url('./public_assets/images/_Images/Buttons/BurgerMenu/close_2x.png')";
                icon.style.backgroundColor = "#ff1a09"; // red X
            } else {
                icon.style.webkitMaskImage = "url('./public_assets/images/_Images/IconsAndLogos/Icon_Search.png')";
                icon.style.maskImage = "url('./public_assets/images/_Images/IconsAndLogos/Icon_Search.png')";
                icon.style.backgroundColor = "#15315e"; // blue search icon
            }
        };

        input.addEventListener("input", (e) => {
            updateIcon();
            this.dispatchEvent(
                new CustomEvent("search-changed", {
                    bubbles: true,
                    detail: { query: e.target.value },
                })
            );
        });

        icon.addEventListener("click", () => {
            if (input.value.trim()) {
                input.value = "";
                updateIcon();
                this.dispatchEvent(
                    new CustomEvent("search-changed", {
                        bubbles: true,
                        detail: { query: "" },
                    })
                );
            }
        });

        updateIcon();
    }
}

if (!customElements.get("knowledge-search")) {
    customElements.define("knowledge-search", KnowledgeSearch);
}
