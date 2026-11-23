class NovelBurgerMenu extends HTMLElement {
  constructor() {
    super();

    this._novels = [];
  }

  set novels(value) {
    this._novels = Array.isArray(value) ? value : [];

    if (this.isConnected) {
      this.render();
    }
  }

  get novels() {
    return this._novels;
  }

  connectedCallback() {
    this.render();
  }

  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }

  render() {
    this.replaceChildren();

    const menu = document.createElement("section");
    menu.className = "novel-burger-menu";

    const header = this.createHeader();
    const content = this.createContent();

    menu.appendChild(header);
    menu.appendChild(content);

    this.appendChild(menu);
  }

  createHeader() {
    const header = document.createElement("header");
    header.className = "novel-burger-menu__header";

    const leftArea = document.createElement("div");
    leftArea.className = "novel-burger-menu__side novel-burger-menu__side--left";

    const centerSpacer = document.createElement("div");
    centerSpacer.className = "novel-burger-menu__side";

    const rightArea = document.createElement("div");
    rightArea.className = "novel-burger-menu__side novel-burger-menu__side--right";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "header-icon-button novel-burger-menu__close";
    closeButton.setAttribute("aria-label", "Menü schließen");
    // use asset for close icon
    const closeImg = document.createElement("img");
    closeImg.src = "public_assets/images/_Images/Buttons/BurgerMenu/close_2x.png";
    closeImg.alt = "Schließen";
    closeImg.className = "header-icon-image";
    closeButton.appendChild(closeImg);

    closeButton.addEventListener("click", () => {
      this.close();
    });

    leftArea.appendChild(closeButton);

    const rightActions = document.createElement("div");
    rightActions.className = "novel-burger-menu__actions header-icon-group";

    const legalButton = document.createElement("button");
    legalButton.type = "button";
    legalButton.className =
      "header-icon-button header-icon-button--legal";
    legalButton.setAttribute("aria-label", "Rechtliche Informationen");
    const legalImg = document.createElement("img");
    legalImg.src = "public_assets/images/_Images/IconsAndLogos/Icon_Legal_Small.png";
    legalImg.alt = "Rechtliches";
    legalImg.className = "header-icon-image";
    legalButton.appendChild(legalImg);

    legalButton.addEventListener("click", () => {
      this.close();

      this.dispatchEvent(
        new CustomEvent("legal-information-selected", {
          bubbles: true,
        })
      );
    });

    const settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className =
      "header-icon-button header-icon-button--settings";
    settingsButton.setAttribute("aria-label", "Einstellungen");
    const settingsImg = document.createElement("img");
    settingsImg.src = "public_assets/images/_Images/Buttons/settings.png";
    settingsImg.alt = "Einstellungen";
    settingsImg.className = "header-icon-image";
    settingsButton.appendChild(settingsImg);

    settingsButton.addEventListener("click", () => {
      this.close();

      this.dispatchEvent(
        new CustomEvent("settings-selected", {
          bubbles: true,
        })
      );
    });

    rightActions.appendChild(legalButton);
    rightActions.appendChild(settingsButton);

    rightArea.appendChild(rightActions);

    header.appendChild(leftArea);
    header.appendChild(centerSpacer);
    header.appendChild(rightArea);

    return header;
  }

  createContent() {
    const content = document.createElement("div");
    content.className = "novel-burger-menu__content";

    const title = document.createElement("h2");
    title.className = "novel-burger-menu__title";
    title.textContent = "NOVELS";

    const list = document.createElement("nav");
    list.className = "novel-burger-menu__list";
    list.setAttribute("aria-label", "Novel-Auswahl");

    this._novels.forEach((novel) => {
      const item = this.createNovelItem(novel);
      list.appendChild(item);
    });

    content.appendChild(title);
    content.appendChild(list);

    return content;
  }

  createNovelItem(novel) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "novel-burger-menu__item";
    item.textContent = novel.title;

    item.addEventListener("click", () => {
      this.close();

      this.dispatchEvent(
        new CustomEvent("novel-selected", {
          bubbles: true,
          detail: {
            novelId: novel.id,
          },
        })
      );
    });

    return item;
  }
  
  open() {
    this.setAttribute("open", "");

    window.dispatchEvent(
      new CustomEvent("burger-menu-state", {
        detail: { open: true },
      })
    );
  }
  close() {
    this.removeAttribute("open");

    window.dispatchEvent(
      new CustomEvent("burger-menu-state", {
        detail: { open: false },
      })
    );
  }
}

if (!customElements.get("novel-burger-menu")) {
  customElements.define("novel-burger-menu", NovelBurgerMenu);
}