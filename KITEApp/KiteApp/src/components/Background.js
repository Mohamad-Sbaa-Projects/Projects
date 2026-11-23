class VnBackground extends HTMLElement {
  connectedCallback() {
    if (this._initialized) {
      return;
    }

    this._initialized = true;
    this.className = "vn-background";

    const image = document.createElement("img");
    image.className = "vn-background__image";
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;

    const overlay = document.createElement("div");
    overlay.className = "vn-background__overlay";
    overlay.setAttribute("aria-hidden", "true");

    this.replaceChildren(image, overlay);

    this.imageElement = image;
    this.overlayElement = overlay;
  }

  setBackground(background) {
    if (!this.isConnected) {
      this.connectedCallback();
    }

    const config =
      typeof background === "string"
        ? { imageUrl: background }
        : background && typeof background === "object"
          ? background
          : {};

    this.style.setProperty(
      "--vn-background-fit",
      config.objectFit || "cover"
    );
    this.style.setProperty(
      "--vn-background-position",
      config.objectPosition || "center center"
    );
    this.style.setProperty(
      "--vn-background-overlay",
      config.overlay || "transparent"
    );
    this.style.setProperty(
      "--vn-background-scale",
      String(config.scale || 1)
    );
    this.style.setProperty(
      "--vn-background-origin",
      config.scaleOrigin || "center top"
    );

    if (this.imageElement) {
      this.imageElement.src = config.imageUrl || "";
      this.imageElement.alt = config.alt || "Scene background";
    }
  }
}

if (!customElements.get("vn-background")) {
  customElements.define("vn-background", VnBackground);
}

