import "../core/screen_router.js";
import "../components/AppHeader.js";
import "../components/AppFooter.js";
import "../components/NovelBurgerMenu.js";

import "../screens/LoadingScreen.js";
import "../screens/TermsOfUseScreen.js";
import "../screens/AiFeedbackScreen.js";
import "../screens/NovelPlayerScreen.js";
import "../screens/NovelSelectionScreen.js";
import "../screens/MoreToKiteScreen.js";
import "../screens/KnowledgeScreen.js";
import "../screens/KnowledgeDetailScreen.js";
import "../screens/ArchiveScreen.js";
import "../screens/LegalScreens.js";
import "../screens/SavedNovelsScreen.js";

import { createAppLayoutController } from "../services/AppLayoutService.js";
import { repository } from "../services/DataRepository.js";
import { NovelService } from "../services/NovelService.js";
import "../screens/LinksScreen.js";

class KiteApp extends HTMLElement {
  constructor() {
    super();
    this.layoutController = null;
    this.novelService = NovelService;

    NovelService.initRepository().catch(err => console.warn("init repo failed", err));

    this._onMenuSelected = this._onMenuSelected.bind(this);
    this._onNovelSelected = this._onNovelSelected.bind(this);
    this._onLegalSelected = this._onLegalSelected.bind(this);
    this._onSettingsSelected = this._onSettingsSelected.bind(this);
  }

  connectedCallback() {
    this.replaceChildren();

    const viewportElement = document.createElement("div");
    viewportElement.className = "kite-app-viewport";

    const stageElement = document.createElement("div");
    stageElement.className = "kite-app-stage";

    const header = document.createElement("app-header");
    const router = document.createElement("screen-router");
    const burgerMenu = document.createElement("novel-burger-menu");
    burgerMenu.id = "app-burger-menu";
    const footer = document.createElement("app-footer");

    stageElement.appendChild(header);
    stageElement.appendChild(router);
    stageElement.appendChild(burgerMenu);
    stageElement.appendChild(footer);
    viewportElement.appendChild(stageElement);
    this.appendChild(viewportElement);

    this.layoutController = createAppLayoutController({
      viewportElement,
      stageElement,
      designWidth: 450,
      designHeight: 932,
    });

    // Listen to global menu events from the header
    this.addEventListener("app-menu-selected", this._onMenuSelected);

    // Listen for events from the burger menu
    const burgerMenuElement = this.querySelector("#app-burger-menu");
    if (burgerMenuElement) {
      burgerMenuElement.addEventListener("novel-selected", this._onNovelSelected);
      burgerMenuElement.addEventListener("legal-information-selected", this._onLegalSelected);
      burgerMenuElement.addEventListener("settings-selected", this._onSettingsSelected);
    }

    // Pre-load novels into the burger menu
    this._loadBurgerMenuNovels().catch(err => console.warn("load burger novels failed", err));
  }

  disconnectedCallback() {
    this.removeEventListener("app-menu-selected", this._onMenuSelected);
    this.layoutController?.destroy();
    this.layoutController = null;
  }

  async _loadBurgerMenuNovels() {
    try {
      await repository.init();
      const burgerMenu = this.querySelector("#app-burger-menu");
      if (burgerMenu) {
        burgerMenu.novels = this.novelService.getSelectableNovels();
      }
    } catch (error) {
      console.warn("[KiteApp] Could not load novels for burger menu:", error);
    }
  }

  async _onMenuSelected(event) {
    // Prevent the event from also being handled by NovelSelectionScreen
    event.stopPropagation();

    const burgerMenu = this.querySelector("#app-burger-menu");
    if (!burgerMenu) return;
    if (burgerMenu.hasAttribute("open")) {
      burgerMenu.close();
      return;
     }

    // ensure data is loaded before opening the menu
    try {
      await this._loadBurgerMenuNovels();
      burgerMenu.open();
    } catch (err) {
      console.warn("[KiteApp] Failed to load novels before opening menu:", err);
      // fallback: still open the menu so user can interact, or keep closed if preferred
          burgerMenu.open();
    }
  }

  _onNovelSelected(event) {
    event.stopPropagation();
    const novelId = event.detail?.novelId;
    if (novelId) {
      window.location.hash = `/novel/${novelId}`;
    }
  }

  _onLegalSelected(event) {
    event.stopPropagation();
    window.location.hash = "/legal";
  }

  _onSettingsSelected(event) {
    event.stopPropagation();
    window.location.hash = "/einstellungen";
  }
}

if (!customElements.get("kite-app")) {
  customElements.define("kite-app", KiteApp);
}