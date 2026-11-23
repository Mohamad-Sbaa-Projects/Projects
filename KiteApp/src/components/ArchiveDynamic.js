import { createArchiveService } from "../services/ArchiveService.js";
import "./ArchiveDropdownList.js";

class ArchiveDynamic extends HTMLElement {
  constructor() {
  super();
  this.handleAppDataReset = this.handleAppDataReset.bind(this);
}

  connectedCallback() {
    this.service ??= createArchiveService();
    this.toastTimer ??= null;
    this.addEventListener("click", this);
    this.render();
    void this.loadArchives();
    window.addEventListener(
      "kite-app-data-reset",
      this.handleAppDataReset
    );
  }

  disconnectedCallback() {
    this.removeEventListener("click", this);
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    window.removeEventListener(
      "kite-app-data-reset",
      this.handleAppDataReset
    );
  }

  async handleAppDataReset() {
    this.service = createArchiveService();
    this.render();
    await this.loadArchives();
  }

  async loadArchives() {
    try {
      const result = await this.service.loadArchives();
      if (result.shouldRender && this.isConnected) {
        this.render();
      }
    } catch (error) {
      console.error("[ArchiveDynamic] Failed to load archives:", error);
    }
  }

  async handleEvent(event) {
    const result = await this.service.handleEvent(event);

    if (result.shouldRender && this.isConnected) {
      this.render();
    }

    if (result.selection) {
      this.dispatchEvent(
        new CustomEvent("archive-selected", {
          bubbles: true,
          detail: result.selection,
        })
      );
    }

    if (result.toastMessage) {
      this.showToast(result.toastMessage);
    }
  }

  showToast(message) {
    const existingToast = this.querySelector(".archive-toast");
    if (existingToast) {
      existingToast.remove();
    }

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }

    const toast = document.createElement("div");
    toast.className = "archive-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;

    this.appendChild(toast);

    this.toastTimer = window.setTimeout(() => {
      if (toast.isConnected) {
        toast.remove();
      }
      this.toastTimer = null;
    }, 2200);
  }

  createHero(heroModel) {
    const fragment = document.createDocumentFragment();

    const hero = document.createElement("div");
    hero.className = "archive-hero";

    const iconWrap = document.createElement("div");
    iconWrap.className = "archive-hero__icon-wrap";

    const icon = document.createElement("img");
    icon.className = "archive-hero__icon";
    icon.alt = "Archiv Icon";
    icon.src = heroModel.iconPath;

    const heading = document.createElement("h1");
    heading.textContent = heroModel.heading;

    const intro = document.createElement("p");
    intro.className = "font-adjustable archive-intro";
    intro.textContent = heroModel.intro;

    iconWrap.appendChild(icon);
    hero.append(iconWrap, heading);
    fragment.append(hero, intro);

    return fragment;
  }

  createStateMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "archive-state-message";
    paragraph.textContent = message;
    return paragraph;
  }

  render() {
    const viewModel = this.service.getViewModel();

    this.replaceChildren();

    const fragment = document.createDocumentFragment();
    fragment.appendChild(this.createHero(viewModel.hero));

    if (viewModel.stateMessage) {
      fragment.appendChild(this.createStateMessage(viewModel.stateMessage));
    }

    if (viewModel.entries.length) {
      const dropdownList = document.createElement("archive-dropdown-list");
      dropdownList.entries = viewModel.entries;
      fragment.appendChild(dropdownList);
    }

    this.appendChild(fragment);
  }
}

if (!customElements.get("archive-dynamic")) {
  customElements.define("archive-dynamic", ArchiveDynamic);
}

export { ArchiveDynamic };