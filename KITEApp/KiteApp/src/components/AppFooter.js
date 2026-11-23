/**
 * <app-footer> – Main navigation footer component
 *
 * A reusable footer navigation component for the KITE app.
 * Displays navigation items and highlights the active route.
 * Does NOT use Shadow DOM.
 *
 * Navigation items:
 *   • Start   – Home / Selection screen
 *   • Archiv  – Archive of novels
 *   • Gemerkt – Bookmarked items
 *   • Links   – External links
 *   • Wissen  – Knowledge / Info
 *
 * Events dispatched:
 *   • app-navigate – Custom event with detail: { path: string }
 *
 * Attributes:
 *   • active-path – Current active route path (updates active state)
 *
 * Usage:
 *   <app-footer active-path="/auswahl"></app-footer>
 */

/** Image paths for footer nav icons (from project assets) */
const ICON_PATHS = {
  start:   "public_assets/images/_Images/Buttons/home.png",
  archiv:  "public_assets/images/_Images/Buttons/archive.png",
  gemerkt: "public_assets/images/_Images/Buttons/Bookmark.png",
  links:   "public_assets/images/_Images/Buttons/weblinks.png",
  wissen:  "public_assets/images/_Images/IconsAndLogos/Icon_Knowledge_White.png",
};

/** Routes that should NOT show the footer */
const HIDDEN_ROUTE_PREFIXES = ["/szenario/", "/novel/", "/loading", "/ki-feedback", "/legal/datenschutz", "/legal/nutzungsbedingungen", "/legal/impressum", "/terms", "/more"];

class AppFooter extends HTMLElement {
  constructor() {
    super();

    this.navItems = [
      { id: "start",   label: "Start",   path: "/auswahl", iconSrc: ICON_PATHS.start },
      { id: "archiv",  label: "Archiv",  path: "/archiv",  iconSrc: ICON_PATHS.archiv },
      { id: "gemerkt", label: "Gemerkt", path: "/gemerkt", iconSrc: ICON_PATHS.gemerkt },
      { id: "links",   label: "Links",   path: "/links",   iconSrc: ICON_PATHS.links },
      { id: "wissen",  label: "Wissen",  path: "/wissen",  iconSrc: ICON_PATHS.wissen },
    ];
  }

  static get observedAttributes() {
    return ["active-path"];
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
    this.updateVisibility(this.getActivePath());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "active-path" && oldValue !== newValue) {
      this.updateActiveState(newValue);
      this.updateVisibility(newValue);
    }
  }

  render() {
    this.className = "app-footer";

    const navHTML = this.navItems
      .map(
        (item) => `
        <button
          class="footer-nav-btn"
          data-path="${item.path}"
          data-id="${item.id}"
          id="footer-btn-${item.id}"
          aria-label="Navigate to ${item.label}"
          title="${item.label}"
        >
          <span class="footer-nav-icon">
            <img src="${item.iconSrc}" alt="${item.label}" class="footer-nav-icon-img" />
          </span>
          <span class="footer-nav-label">${item.label}</span>
        </button>`
      )
      .join("");

    this.innerHTML = `
      <nav class="footer-nav-container" aria-label="Main navigation">
        ${navHTML}
      </nav>
    `;
  }

  attachEventListeners() {
    this.querySelectorAll(".footer-nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const path = btn.getAttribute("data-path");
        this.navigateTo(path);
      });
    });


  }

  navigateTo(path) {
    // Dispatch custom event for router to listen to
    this.dispatchEvent(
      new CustomEvent("app-navigate", {
        bubbles: true,
        detail: { path },
      })
    );

    // Also update window hash directly
    window.location.hash = path;
  }

  updateActiveState(activePath) {
    const normalizedPath = activePath.split("/")[1] || "";

    this.querySelectorAll(".footer-nav-btn").forEach((btn) => {
      const btnPath = btn.getAttribute("data-path").split("/")[1];
      const isActive =
        btnPath === normalizedPath ||
        (normalizedPath === "" && btnPath === "auswahl");

      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  updateVisibility(path) {
    const shouldHide =
      HIDDEN_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
      path === "";

    this.classList.toggle("hidden", shouldHide);
  }

  /**
   * Manually set the active path.
   * Hides footer on novel / loading / AI feedback screens.
   * @param {string} path
   */
  setActivePath(path) {
    this.setAttribute("active-path", path);
    this.updateVisibility(path);
  }

  /**
   * Get the current active path
   * @returns {string}
   */
  getActivePath() {
    return this.getAttribute("active-path") || "/";
  }
}

if (!customElements.get("app-footer")) {
  customElements.define("app-footer", AppFooter);
}
