import { NovelService } from "../services/NovelService.js";

export class NovelController {
    constructor(hostElement) {
        this.host = hostElement;
    }

    async loadNovels() {
        try {
            await NovelService.initRepository();
            if (!this.host.isConnected) return;
            this.host.novels = NovelService.getSelectableNovels();
            if (typeof this.host.render === "function") this.host.render();
        } catch (error) {
            console.error("[NovelController] Failed to load novels:", error);
        }
    }

    createHeader() {
        const header = document.createElement("app-header");
        header.setAttribute("show-menu", "");
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");

        header.addEventListener("app-menu-selected", () => {
            const burgerMenu = this.host.querySelector("novel-burger-menu");
            if (burgerMenu) burgerMenu.open();
        });

        header.addEventListener("app-legal-selected", () => {
            this.host.dispatchEvent(new CustomEvent("legal-information-selected", { bubbles: true }));
        });

        header.addEventListener("app-settings-selected", () => {
            this.host.dispatchEvent(new CustomEvent("settings-selected", { bubbles: true }));
        });

        return header;
    }

    addBurgerMenuListener(menu, eventName) {
        if (eventName === "novel-selected" || eventName === "novel-menu-selected") {
            menu.addEventListener("novel-selected", (event) => {
                event.stopPropagation();
                const selectedNovelId = event.detail?.novelId;
                if (selectedNovelId) {
                    this.host.dispatchEvent(new CustomEvent("novel-selected", { bubbles: true, composed: true, detail: { novelId: selectedNovelId } }));
                    return;
                }
                if (event.detail?.novel) {
                    this.openNovelActionPopup(event.detail.novel, null);
                }
            });
            return;
        }

        if (eventName === "legal-information-selected") {
            menu.addEventListener(eventName, (event) => {
                event.stopPropagation();
                this.host.dispatchEvent(new CustomEvent("legal-information-selected", { bubbles: true }));
            });
            return;
        }

        if (eventName === "settings-selected") {
            menu.addEventListener(eventName, (event) => {
                event.stopPropagation();
                this.host.dispatchEvent(new CustomEvent("settings-selected", { bubbles: true }));
            });
        }
    }

    openNovelActionPopup(novel, anchor) {
        const element = this.host;
        const existingPopup = element.querySelector("novel-action-popup");

        const clearPopupOpenState = () => {
            const openButton = element.querySelector(".novel-hexagon__button.novel-hexagon__button--popup-open");
            if (openButton) openButton.classList.remove("novel-hexagon__button--popup-open");
            element.classList.remove("novel-selection-screen--popup-open");
        };

        if (existingPopup && existingPopup.getAttribute("novel-id") !== novel.id) {
            clearPopupOpenState();
            existingPopup.remove();
            return;
        }

        const popup = document.createElement("novel-action-popup");
        popup.setAttribute("novel-id", novel.id);
        popup.setAttribute("novel-title", novel.title);
        popup.setAttribute("color-inner", novel.novelColor);
        popup.setAttribute("color-outer", novel.novelFrameColor);

        popup.config = {
            ...popup.config,
            text: novel.description,
        };

        const popupOpenHexagon = element.querySelector(`novel-hexagon[novel-id="${novel.id}"] .novel-hexagon__button`);
        if (popupOpenHexagon) popupOpenHexagon.classList.add("novel-hexagon__button--popup-open");
        element.classList.add("novel-selection-screen--popup-open");

        popup.addEventListener("novel-play-selected", (event) => {
            event.stopPropagation();
            clearPopupOpenState();
            element.dispatchEvent(new CustomEvent("novel-selected", { bubbles: true, composed: true, detail: { novelId: event.detail.novelId } }));
            popup.remove();
        });

        popup.addEventListener("novel-remembered", (event) => {
            event.stopPropagation();
            element.dispatchEvent(new CustomEvent("novel-remembered", { bubbles: true, composed: true, detail: { novelId: event.detail.novelId, fromPopup: true } }));
        });

        popup.addEventListener("popup-closed", (event) => {
            event.stopPropagation();
            clearPopupOpenState();
            popup.remove();
        });

        element.appendChild(popup);
    }
}
