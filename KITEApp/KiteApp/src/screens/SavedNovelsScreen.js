import { NovelService } from "../services/NovelService.js";
import { repository } from "../services/DataRepository.js";
import { BookmarkService } from "../services/BookmarkService.js";

import "../components/NovelHexagon.js";

class SavedNovelsScreen extends HTMLElement {
    constructor() {
        super();
        this.savedNovels = [];
    }

    connectedCallback() {
        this.renderSkeleton();
        this.loadSavedNovels();
    }

    async loadSavedNovels() {
        await repository.init();

        const savedIds = BookmarkService.getSaved();
        const allNovels = NovelService.getSelectableNovels();

        this.savedNovels = allNovels.filter(novel => savedIds.includes(novel.id));
        this.savedNovels = this.savedNovels.sort((a, b) => a.id - b.id);

        this.render();
    }

    renderSkeleton() {
        this.replaceChildren();
        this.className = "saved-novels-screen";

        const content = document.createElement("div");
        content.className = "saved-novels-content";

        const icon = document.createElement("div");
        icon.className = "saved-novels-icon";

        const title = document.createElement("h1");
        title.className = "saved-novels-title";
        title.textContent = "GEMERKTE NOVELS";

        const layer = document.createElement("div");
        layer.className = "saved-novels-hex-layer";
        layer.id = "saved-novels-layer";

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(layer);

        this.appendChild(content);
    }

    render() {
        const layer = this.querySelector("#saved-novels-layer");
        layer.replaceChildren();

        this.savedNovels.forEach((novel, index) => {
            const hex = document.createElement("novel-hexagon");

            // Apply manual CSS class for positioning
            hex.classList.add("saved-novel", `saved-novel--${index + 1}`);

            hex.setAttribute("novel-id", novel.id);
            hex.setAttribute("content", novel.title);
            hex.setAttribute("color-inner", novel.novelColor);
            hex.setAttribute("color-outer", novel.novelFrameColor);

            hex.addEventListener("click", () => {
                window.dispatchEvent(
                    new CustomEvent("app-navigate", {
                        bubbles: true,
                        detail: { path: `/novel/${novel.id}` }
                    })
                );
            });
            layer.appendChild(hex);
        });
    }
}

if (!customElements.get("saved-novels-screen")) {
    customElements.define("saved-novels-screen", SavedNovelsScreen);
}

