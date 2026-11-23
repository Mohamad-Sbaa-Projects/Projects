class AppHeader extends HTMLElement {
  static get observedAttributes() {
    return ["title", "show-menu", "show-back", "show-legal", "show-settings", "menu-open"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  createIconButton({ className, label, textContent, eventName, imageSrc }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);

    if (imageSrc) {
      const img = document.createElement("img");
      img.className = "header-icon-image";
      img.src = imageSrc;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");

      button.appendChild(img);
    } else if (textContent) {
      button.textContent = textContent;
    }

    button.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent(eventName, {
          bubbles: true,
          composed: true,
        })
      );
    });

    return button;
  }

  render() {
    this.replaceChildren();

    const titleText = this.getAttribute("title") || "";
    const showMenu = this.hasAttribute("show-menu");
    const showBack = this.hasAttribute("show-back");
    const showLegal = this.hasAttribute("show-legal");
    const showSettings = this.hasAttribute("show-settings");

    // Configurable labels (attributes) with sensible German defaults
    const menuLabel = this.getAttribute("menu-label") || "Menü öffnen";
    const backLabel = this.getAttribute("back-label") || "Zurück";
    const legalLabel = this.getAttribute("legal-label") || "Rechtliche Informationen";
    const settingsLabel = this.getAttribute("settings-label") || "Einstellungen";

    const header = document.createElement("header");
    header.className = "app-header";

    const leftArea = document.createElement("div");
    leftArea.className = "app-header__side app-header__side--left";

    const title = document.createElement("h1");
    title.className = "app-header__title";
    title.textContent = titleText;

    const rightArea = document.createElement("div");
    rightArea.className = "app-header__side app-header__side--right header-icon-group";

    const isMenuOpen = this.hasAttribute("menu-open");

    if (showMenu) {
      const menuButton = this.createIconButton({
        className: "header-icon-button header-icon-button--menu",
        label: menuLabel,
        eventName: "app-menu-selected",
        imageSrc: isMenuOpen
      ? "public_assets/images/_Images/Buttons/BurgerMenu/close_2x.png"
      : "public_assets/images/_Images/Buttons/BurgerMenu/menu_4x.png",
      });

      leftArea.appendChild(menuButton);
    } else if (showBack) {
      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "app-header__button app-header__button--back";
      backButton.setAttribute("aria-label", backLabel);

      const backIcon = document.createElement("span");
      backIcon.className = "app-header__back-icon";

      const backText = document.createElement("span");
      backText.className = "app-header__back-text";
      backText.textContent = backLabel;

      backButton.appendChild(backIcon);
      backButton.appendChild(backText);

      backButton.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("app-back-selected", {
            bubbles: true,
            composed: true,
          })
        );
      });

      leftArea.appendChild(backButton);
    }


    if (showLegal) {
      const legalButton = this.createIconButton({
        className: "header-icon-button header-icon-button--legal",
        label: legalLabel,
        eventName: "app-legal-selected",
        imageSrc:
          "public_assets/images/_Images/IconsAndLogos/Icon_Legal_Small.png",
      });

      rightArea.appendChild(legalButton);
    }

    if (showSettings) {
      const settingsButton = this.createIconButton({
        className: "header-icon-button header-icon-button--settings",
        label: settingsLabel,
        eventName: "app-settings-selected",
        imageSrc: "public_assets/images/_Images/Buttons/settings.png",
      });

      rightArea.appendChild(settingsButton);
    }

    header.appendChild(leftArea);
    header.appendChild(title);
    header.appendChild(rightArea);

    this.appendChild(header);
  }
}

if (!customElements.get("app-header")) {
  customElements.define("app-header", AppHeader);
}