import { NovelController } from "../controllers/NovelController.js";
import { BookmarkService} from "../services/BookmarkService.js";

import "../components/NovelActionPopup.js";
import "../components/NovelBurgerMenu.js";
import "../components/NovelHexagon.js";
import "../components/NovelSelectionMap.js";

class NovelSelectionScreen extends HTMLElement {
  constructor() {
    super();
    this.novels = [];
    this.controller = new NovelController(this);
  }

  connectedCallback() {
    this.render();
    this.controller.loadNovels();

    this.addEventListener("novel-remembered", (event) => {
      BookmarkService.toggleSaved(event.detail.novelId);
      if (!event.detail || !event.detail.fromPopup) {
        this.render();
      }
    });
  }

  render() {
    this.className = "novel-selection-screen";
    this.replaceChildren();

    const selectionMap = document.createElement("novel-selection-map");
    selectionMap.novels = this.novels;

    selectionMap.addEventListener("novel-clicked", (event) => {
      this.controller.openNovelActionPopup(event.detail.novel, event.detail.anchor);
    });

    const bottomArea = this.createBottomArea();
    const burgerMenu = this.createBurgerMenu();

    this.appendChild(selectionMap);
    this.appendChild(bottomArea);
    this.appendChild(burgerMenu);
  }

  createBurgerMenu() {
    const burgerMenu = document.createElement("novel-burger-menu");
    burgerMenu.novels = this.novels;

    this.controller.addBurgerMenuListener(burgerMenu, "novel-menu-selected");
    this.controller.addBurgerMenuListener(burgerMenu, "legal-information-selected");
    this.controller.addBurgerMenuListener(burgerMenu, "settings-selected");

    return burgerMenu;
  }

  createBottomArea() {
    const bottomArea = document.createElement("section");
    bottomArea.className = "novel-selection-bottom";

    const moreHexagon = document.createElement("novel-hexagon");
    moreHexagon.className = "novel-selection-more-hexagon";
    moreHexagon.setAttribute("content", "Mehr zu KITE");
    moreHexagon.setAttribute("color-outer", "#D04C03");
    moreHexagon.setAttribute("color-inner", "#AA1C02");

    moreHexagon.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("more-to-kite-selected", {
          bubbles: true,
          composed: true,
        })
      );
    });

    bottomArea.appendChild(moreHexagon);

    return bottomArea;
  }
}

if (!customElements.get("novel-selection-screen")) {
  customElements.define("novel-selection-screen", NovelSelectionScreen);
}