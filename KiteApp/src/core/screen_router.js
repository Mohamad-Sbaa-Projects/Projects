import { setLatestFeedback, getLatestFeedback, setFeedbackForNovel, setFeedbackForArchive, createPlaceholderFeedback } from "../services/AiFeedbackService.js";
import { hasAcceptedTerms } from "../services/LegalService.js";
import "../screens/SettingsScreen.js";
import "../screens/LegalScreens.js";
import "../screens/ArchiveScreen.js";
import { applyNewFontSize } from "../services/SettingsService.js";

/**
 * <screen-router> – hash-based router implemented as a Web Component.
 *
 * Renders one of the application screens (<loading-screen>, <novel-selection-screen>,
 * <novel-player>) based on the current URL hash.
 *
 * Events consumed (on `window`):
 *   • loading-complete  → navigate to the intro novel
 *   • terms-accepted    → navigate to the intro novel
 *   • novel-finished    → navigate to AI feedback screen (UI placeholder)
 *   • novel-finished    → navigate to the selection screen
 *   • novel-selected    → navigate to the chosen novel
 *
 * Usage:
 *   <screen-router></screen-router>
 */
class ScreenRouter extends HTMLElement {
  constructor() {
    super();

    this._onHashChange = this._onHashChange.bind(this);
    this._onAppNavigate = this._onAppNavigate.bind(this);
    this._onLoadingComplete = this._onLoadingComplete.bind(this);
    this._onTermsAccepted = this._onTermsAccepted.bind(this);
    this._onNovelFinished = this._onNovelFinished.bind(this);
    this._onNovelSelected = this._onNovelSelected.bind(this);
    this._onMoreToKiteSelected = this._onMoreToKiteSelected.bind(this);
    this._onLegalInformationSelected =
      this._onLegalInformationSelected.bind(this);
    this._onLegalRouteSelected = this._onLegalRouteSelected.bind(this);
    this._onSettingsSelected = this._onSettingsSelected.bind(this);
    this._onBackSelected = this._onBackSelected.bind(this);
    this._onBurgerMenuState = this._onBurgerMenuState.bind(this);
  }

  connectedCallback() {
    window.addEventListener("app-navigate", this._onAppNavigate);

    window.addEventListener("hashchange", this._onHashChange);
    window.addEventListener("loading-complete", this._onLoadingComplete);
    window.addEventListener("terms-accepted", this._onTermsAccepted);
    window.addEventListener("novel-finished", this._onNovelFinished);
    window.addEventListener("novel-selected", this._onNovelSelected);
    window.addEventListener("more-to-kite-selected", this._onMoreToKiteSelected);

    window.addEventListener(
      "legal-information-selected",
      this._onLegalInformationSelected
    );
    window.addEventListener("legal-route-selected", this._onLegalRouteSelected);
    window.addEventListener("settings-selected", this._onSettingsSelected);

    window.addEventListener("app-legal-selected", this._onLegalInformationSelected);
    window.addEventListener("app-settings-selected", this._onSettingsSelected);
    window.addEventListener("app-back-selected", this._onBackSelected);
    window.addEventListener("back-selected", this._onBackSelected);
    window.addEventListener("burger-menu-state", this._onBurgerMenuState);

    if (this.getCurrentPath() !== "/loading") {
      this.navigateTo("/loading");
      return;
    }

    this.handleHashChange();
  }

  disconnectedCallback() {
    window.removeEventListener("app-navigate", this._onAppNavigate);
    window.removeEventListener("hashchange", this._onHashChange);
    window.removeEventListener("loading-complete", this._onLoadingComplete);
    window.removeEventListener("terms-accepted", this._onTermsAccepted);
    window.removeEventListener("novel-finished", this._onNovelFinished);
    window.removeEventListener("novel-selected", this._onNovelSelected);
    window.removeEventListener("more-to-kite-selected", this._onMoreToKiteSelected);

    window.removeEventListener(
      "legal-information-selected",
      this._onLegalInformationSelected
    );
    window.removeEventListener("legal-route-selected", this._onLegalRouteSelected);
    window.removeEventListener("settings-selected", this._onSettingsSelected);

    window.removeEventListener(
      "app-legal-selected",
      this._onLegalInformationSelected
    );
    window.removeEventListener("app-settings-selected", this._onSettingsSelected);
    window.removeEventListener("app-back-selected", this._onBackSelected);
    window.removeEventListener("back-selected", this._onBackSelected);
    window.removeEventListener("burger-menu-state", this._onBurgerMenuState);
  }

  _onHashChange() {
    this.closeBurgerMenuIfOpen();
    // Ensure the full route handling and footer update run on hash changes
    this.handleHashChange();
  }

  _onAppNavigate(event) {
    // Proxy for legacy binding used elsewhere in the codebase
    this.handleAppNavigate(event);
  }

  _onLoadingComplete() {
    // After loading, show Terms of Use once, then continue to the intro novel.
    if (hasAcceptedTerms()) {
      this.navigateTo("/szenario/einstieg");
      return;
    }

    this.navigateTo("/terms");
  }

  _onTermsAccepted() {
    this.navigateTo("/szenario/einstieg");
  }

  _onNovelFinished(event) {
    // Default flow: after finishing a novel, show the (placeholder) AI feedback screen.
    // If the novel finished event was triggered as an error/exit, go back to selection.
    const reason = event?.detail?.reason ?? "finished";
    const novelId = event?.detail?.novelId;
    const archiveId = event?.detail?.archiveId;
    if (reason === "error" || reason === "exit") {
      this.navigateTo("/auswahl");
      return;
    }

    // Intro novel: do not show feedback screen.
    if (String(novelId) === "einstieg") {
      this.navigateTo("/auswahl");
      return;
    }

    // Store placeholder feedback via service so the screen can render it. 
    const feedbackText = createPlaceholderFeedback({ novelId });
    const payload = {
      novelId: String(novelId ?? ""),
      archiveId: String(archiveId ?? ""),
      text: feedbackText,
      createdAt: new Date().toISOString(),
      isPlaceholder: true,
    };
    setLatestFeedback(payload);
    
    if (archiveId) {
      setFeedbackForArchive(archiveId, payload);
    } else {
      setFeedbackForNovel(novelId, payload);
    }

    this.navigateTo("/ki-feedback");
  }

  _onNovelSelected(event) {
    const novelId = event.detail?.novelId;

    if (!novelId) {
      console.warn("[ScreenRouter] novel-selected event without novelId");
      return;
    }

    this.navigateTo(`/novel/${novelId}`);
  }

  _onMoreToKiteSelected() {
    this.navigateTo("/more-to-kite");
  }

  _onLegalRouteSelected(event) {
    const path = event?.detail?.path;
    if (typeof path === "string" && path.length) {
      this.navigateTo(path);
    }
  }

  _onLegalInformationSelected() {
    this.navigateTo("/legal");
  }

  _onSettingsSelected() {
    this.navigateTo("/einstellungen");
  }

  _onBackSelected(event) {
    const activeScreen = this.firstElementChild;
    if (activeScreen) {
      const target = activeScreen.querySelector("novel-player-view") || activeScreen;
      const backEvent = new CustomEvent("app-back-selected", {
        bubbles: false,
        cancelable: true,
      });
      target.dispatchEvent(backEvent);
      if (backEvent.defaultPrevented) {
        return;
      }
    }
  }
  _onBackSelected(event) {
    const activeScreen = this.firstElementChild;
    if (activeScreen) {
      const target = activeScreen.querySelector("novel-player-view") || activeScreen;
      const backEvent = new CustomEvent("app-back-selected", {
        bubbles: false,
        cancelable: true,
      });
      target.dispatchEvent(backEvent);
      if (backEvent.defaultPrevented) {
        return;
      }
    }
    this.navigateBack();
  }

  navigateTo(path) {
    this.closeBurgerMenuIfOpen();
    window.location.hash = path;
  }

  navigateBack() {
    this.closeBurgerMenuIfOpen();
    window.history.back();
  }

  getCurrentPath() {
    return window.location.hash.replace("#", "") || "/";
  }

  handleAppNavigate(event) {
  const path = event.detail?.path;

  if (typeof path === "string" && path.length > 0) {
    this.closeBurgerMenuIfOpen();
    this.navigateTo(path);
  }
}

handleHashChange() {
  const path = this.getCurrentPath();

  this.renderCurrentRoute(path);
  this.dispatchRouteChanged(path);
}

  /**
   * Update footer component and stage padding according to current route.
   * keeps footer visibility and active state in sync with the router.
   * @param {string} path
   */
  dispatchRouteChanged(path) {
    const footer = document.querySelector("app-footer");
    try {
      if (footer && typeof footer.setActivePath === "function") {
        footer.setActivePath(path);
      } else if (footer) {
        footer.setAttribute("active-path", path);
      }

      // Toggle stage class to make room for the footer when visible
      const stage = this.closest(".kite-app-stage") || document.querySelector(".kite-app-stage");
      const footerHidden = footer ? footer.classList.contains("hidden") : false;
      if (stage) {
        stage.classList.toggle("kite-app-stage--with-footer", !footerHidden);
      }
    } catch (err) {
      // Avoid breaking routing if footer has unexpected shape
      console.warn("dispatchRouteChanged error:", err);
    }

    try {
      this.updateHeaderForRoute(path);
    } catch (err) {
      console.warn("updateHeaderForRoute error:", err);
    }
  }

  /**
   * Update header component visibility and attributes based on route.
   * @param {string} path
   */
  updateHeaderForRoute(path) {
    const header = document.querySelector("app-header");
    if (!header) return;

    header.removeAttribute("show-menu");
    header.removeAttribute("show-back");
    header.removeAttribute("show-legal");
    header.removeAttribute("show-settings");
    header.removeAttribute("title");

    const cleanPath = path.split("?")[0].split("#")[0];

    const hiddenRoutes = ["/loading", "/terms", "/ki-feedback"];
    const isHidden = hiddenRoutes.includes(cleanPath) || cleanPath === "";

    if (isHidden) {
      header.classList.add("hidden");
      const stage = this.closest(".kite-app-stage") || document.querySelector(".kite-app-stage");
      if (stage) {
        stage.classList.remove("kite-app-stage--with-header");
      }
      return;
    }

    header.classList.remove("hidden");
    const stage = this.closest(".kite-app-stage") || document.querySelector(".kite-app-stage");
    if (stage) {
      stage.classList.add("kite-app-stage--with-header");
    }

    if (cleanPath === "/" || cleanPath === "/auswahl") {
      header.setAttribute("show-menu", "");
      header.setAttribute("show-legal", "");
      header.setAttribute("show-settings", "");
    } else if (cleanPath.startsWith("/novel/")) {
      const novelId = cleanPath.split("/")[2];
      if (novelId === "einstieg") {
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");
      } else {
        header.setAttribute("show-back", "");
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");
      }
    } else if (cleanPath.startsWith("/wissen")) {
      header.setAttribute("title", "");
      header.setAttribute("show-back", "");
      header.setAttribute("show-legal", "");
      header.setAttribute("show-settings", "");
    } else {
      const isMatched = [
        "/", "/auswahl", "/loading", "/terms", "/ki-feedback",
        "/einstellungen", "/wissen", "/archiv", "/more-to-kite",
        "/legal", "/legal/impressum", "/legal/datenschutz",
        "/legal/nutzungsbedingungen", "/links", "/gemerkt"
      ].includes(cleanPath) || cleanPath.startsWith("/novel/") || cleanPath.startsWith("/wissen");

      if (!isMatched) {
        header.setAttribute("title", "404 - Nicht gefunden");
      }
      header.setAttribute("show-back", "");
      header.setAttribute("show-legal", "");
      header.setAttribute("show-settings", "");
    }
  }

  renderCurrentRoute() {
    const path = this.getCurrentPath();

    if (path === "/loading") {
      this.renderLoadingScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/terms") {
      this.renderTermsOfUseScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/auswahl" || path === "/") {
      this.renderNovelSelectionScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/ki-feedback") {
      this.renderAiFeedbackScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path.startsWith("/novel/")) {
      const novelId = path.replace("/novel/", "");
      this.renderNovelScreen(novelId);
      this.applyGlobalSettings();
      return;
    }

    /*
     * Backwards compatibility:
     * Old routes still work, but are redirected to the new reviewer-required route.
     */
    if (path.startsWith("/szenario/")) {
      const novelId = path.replace("/szenario/", "");
      this.navigateTo(`/novel/${novelId}`);
      this.applyGlobalSettings();
      return;
    }

    if (path === "/rechtliches") {
      this.navigateTo("/legal");
      this.applyGlobalSettings();
      return;
    }

    if (path === "/einstellungen") {
      this.renderSettingsScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/wissen") {
      this.renderKnowledgeScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/archiv") {
      this.renderArchiveScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path.startsWith("/wissen/")) {
      const id = path.replace("/wissen/", "");
      this.renderKnowledgeDetailScreen(id);
      this.applyGlobalSettings();
      return;
    }

    if (path === "/more-to-kite") {
      this.renderMoreToKiteScreen();
      this.applyGlobalSettings();
      return;
    }

    if(path === "/legal") {
      this.renderLegalScreen("legal")
      this.applyGlobalSettings();
      return;
    }

    if(path === "/legal/impressum") {
      this.renderLegalScreen("impressum")
      this.applyGlobalSettings();
      return;
    }

    if(path === "/legal/datenschutz") {
      this.renderLegalScreen("datenschutz")
      this.applyGlobalSettings();
      return;
    }

    if(path === "/legal/nutzungsbedingungen") {
      this.renderLegalScreen("nutzungsbedingungen")
      this.applyGlobalSettings();
      return;
    }

    if(path === "/links") {
      this.renderLinksScreen();
      this.applyGlobalSettings();
      return;
    }

    if (path === "/gemerkt") {
      this.renderSavedNovelsScreen();
      this.applyGlobalSettings();
      return;
    }
    this.renderNotFoundScreen();
  }

  renderLoadingScreen() {
    this.replaceChildren();

    const loadingScreen = document.createElement("loading-screen");
    this.appendChild(loadingScreen);
  }

  renderTermsOfUseScreen() {
    this.replaceChildren();

    const termsOfUseScreen = document.createElement("terms-of-use-screen");
    this.appendChild(termsOfUseScreen);
  }

  renderNovelSelectionScreen() {
    this.replaceChildren();

    const selectionScreen = document.createElement("novel-selection-screen");
    this.appendChild(selectionScreen);
  }

  renderNovelScreen(novelId) {
    this.replaceChildren();

    const novelPlayer = document.createElement("novel-player-screen");
    novelPlayer.setAttribute("novel-id", novelId);

    this.appendChild(novelPlayer);
  }

  renderAiFeedbackScreen() {
    this.replaceChildren();

    const screen = document.createElement("ai-feedback-screen");
    this.appendChild(screen);

    if (!screen) {
      return;
    }

    const latest = getLatestFeedback();
    if (latest && typeof latest.text === "string") {
      screen.feedbackText = latest.text;
    }
  }

  renderLegalScreen(attr) {
    this.replaceChildren();

    const legalScreen = document.createElement("legal-screens");
    legalScreen.setAttribute("subpage", attr);

    this.appendChild(legalScreen);
  }

  renderKnowledgeScreen() {
    this.replaceChildren();

    const screen = document.createElement("knowledge-screen");
    this.appendChild(screen);
  }

  renderKnowledgeDetailScreen(id) {
    this.replaceChildren();

    const screen = document.createElement("knowledge-detail-screen");
    screen.setAttribute("knowledge-id", id);
    this.appendChild(screen);
  }

  renderArchiveScreen() {
    this.replaceChildren();

    const screen = document.createElement("archive-screen");
    this.appendChild(screen);
  }

  renderMoreToKiteScreen() {
    this.replaceChildren();

    const moreToKiteScreen = document.createElement("more-to-kite-screen");
    this.appendChild(moreToKiteScreen);
  }

renderSettingsScreen() {
  this.replaceChildren();

  const settingsScreen = document.createElement("settings-screen");
  this.appendChild(settingsScreen);
}

  renderLinksScreen() {
    this.replaceChildren();

    const screen = document.createElement("links-screen");
    this.appendChild(screen);
  }


  renderSavedNovelsScreen() {
    this.replaceChildren();
    const screen = document.createElement("saved-novels-screen");
    this.appendChild(screen);
  }

  renderPlaceholderScreen(title) {
    this.replaceChildren();

    const screen = document.createElement("section");
    screen.className = "placeholder-screen";

    const content = document.createElement("div");
    content.className = "placeholder-screen__content";

    const heading = document.createElement("h1");
    heading.className = "placeholder-screen__title";
    heading.textContent = title;

    const text = document.createElement("p");
    text.className = "placeholder-screen__text";
    text.textContent = "Diese Seite befindet sich noch im Aufbau.";

    content.appendChild(heading);
    content.appendChild(text);

    screen.appendChild(content);

    this.appendChild(screen);
  }

  renderNotFoundScreen() {
    this.renderPlaceholderScreen("404 - Nicht gefunden");
  }

  closeBurgerMenuIfOpen() {
    const burgerMenu = document.querySelector("#app-burger-menu");
    if (burgerMenu && burgerMenu.hasAttribute("open")) {
      burgerMenu.close();
    }
  }
  _onBurgerMenuState(event) {
    const header = document.querySelector("app-header");
    if (!header) return;

    if (event.detail?.open) {
      header.setAttribute("menu-open", "");
    } else {
      header.removeAttribute("menu-open");
    }
  }
  applyGlobalSettings() {
    applyNewFontSize();
  }
}

if (!customElements.get("screen-router")) {
  customElements.define("screen-router", ScreenRouter);
}

export { ScreenRouter };