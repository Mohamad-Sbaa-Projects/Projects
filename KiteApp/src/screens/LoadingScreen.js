import { startLoading } from "../services/LoadingService.js";

class LoadingScreen extends HTMLElement {
  constructor() {
    super();
    this.state = "loading";
    this.progress = 0;
  }

  connectedCallback() {
    this.render();
    startLoading(this);
  }

  render() {
    if (this.state === "loading") {
      this.style.background = "linear-gradient(to bottom, #14305d 0%, #0c1a2e 100%)";
    } else {
      this.style.background = "url('public_assets/images/_Images/SceneBase/Background_Blue_upside_down.png')";
      this.style.backgroundSize = "cover";
      this.style.backgroundPosition = "center";
    }

    this.className = "justify-center items-center p-4 text-white";

    if (this.state === "loading") {
      this.renderLoadingProgress();
    } else {
      this.renderStartScreen();
    }
  }

  createContentContainer() {
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.maxWidth = "360px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.gap = "1.5rem";
    return container;
  }

  createLogoCircle() {
    const logoCircle = document.createElement("div");
    logoCircle.id = "logo-circle";
    logoCircle.style.width = "240px";
    logoCircle.style.height = "240px";
    logoCircle.style.borderRadius = "50%";
    logoCircle.style.display = "flex";
    logoCircle.style.alignItems = "center";
    logoCircle.style.justifyContent = "center";
    logoCircle.style.background = "#ffffff";
    logoCircle.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
    logoCircle.style.overflow = "hidden";

    const logoImg = document.createElement("img");
    logoImg.id = "logo-img";
    logoImg.src = "public_assets/images/_Images/IconsAndLogos/Logo_Kite.png";
    logoImg.alt = "Kite Logo";
    logoImg.style.width = "260px";
    logoImg.style.height = "260px";
    logoImg.style.objectFit = "contain";
    logoImg.style.display = "block";

    logoCircle.appendChild(logoImg);
    return logoCircle;
  }

  createLetteringImage() {
    const lettering = document.createElement("img");
    lettering.id = "lettering";
    lettering.src = "public_assets/images/_Images/IconsAndLogos/Logo_Kite_Lettering_White.png";
    lettering.alt = "kite";
    lettering.style.width = "300px";
    lettering.style.height = "auto";
    lettering.style.objectFit = "contain";
    lettering.style.display = "block";
    return lettering;
  }

  renderLoadingProgress() {
    this.replaceChildren();

    const container = this.createContentContainer();
    const logoCircle = this.createLogoCircle();
    const lettering = this.createLetteringImage();

    const progressContainer = document.createElement("div");
    progressContainer.style.marginTop = "8px";
    progressContainer.style.height = "12px";
    progressContainer.style.width = "100%";
    progressContainer.style.borderRadius = "999px";
    progressContainer.style.background = "rgba(255,255,255,0.12)";
    progressContainer.style.padding = "2px";

    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    progressBar.style.height = "100%";
    progressBar.style.borderRadius = "999px";
    progressBar.style.background = "#f97316";
    progressBar.style.transition = "width 300ms ease";
    progressBar.style.width = "0%";

    progressContainer.appendChild(progressBar);
    container.append(logoCircle, lettering, progressContainer);
    this.appendChild(container);

    this.progressBar = progressBar;
  }

  renderStartScreen() {
    this.replaceChildren();

    const container = this.createContentContainer();
    const logoCircle = this.createLogoCircle();
    const lettering = this.createLetteringImage();

    const startButton = document.createElement("button");
    startButton.id = "start-btn";
    startButton.type = "button";
    startButton.textContent = "Starten";
    startButton.style.marginTop = "30px";
    startButton.style.padding = "10px 36px";
    startButton.style.border = "2px solid rgba(255,255,255,0.9)";
    startButton.style.background = "transparent";
    startButton.style.color = "white";
    startButton.style.fontWeight = "500";
    startButton.style.letterSpacing = "0.12em";
    startButton.style.textTransform = "uppercase";
    startButton.style.cursor = "pointer";

    container.append(logoCircle, lettering, startButton);
    this.appendChild(container);

    startButton.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("loading-complete", { bubbles: true, composed: true }));
    });
  }
}

if (!customElements.get("loading-screen")) {
  customElements.define("loading-screen", LoadingScreen);
}
