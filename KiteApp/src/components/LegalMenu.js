import { getLegalMenuItems } from "../services/LegalService.js";

class LegalMenu extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.className = "legal-menu";
    this.replaceChildren();

    const legalLogo = document.createElement("img");
    legalLogo.src =
      "public_assets/images/_Images/IconsAndLogos/Icon_Legal_Big.png";
    legalLogo.alt = "Legal Information";
    legalLogo.className = "legal-menu__icon";

    const headline = document.createElement("h5");
    headline.className = "legal-menu__headline";
    headline.textContent = "Rechtliche Informationen";

    const sponsorLogo = document.createElement("img");
    sponsorLogo.src =
      "public_assets/images/_Images/IconsAndLogos/Logo_Sponsor.png";
    sponsorLogo.alt = "Sponsor Logo";
    sponsorLogo.className = "legal-menu__sponsor-logo";

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "legal-menu__buttons";

    getLegalMenuItems().forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "font-adjustable legal-button";
      button.textContent = item.menuLabel;

      button.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("legal-route-selected", {
            bubbles: true,
            composed: true,
            detail: {
              path: item.route,
            },
          })
        );
      });

      buttonContainer.appendChild(button);
    });

    const versionInfo = document.createElement("p");
    versionInfo.className = "legal-menu__version";
    versionInfo.textContent = "Version: 1.6.3";

    this.append(
      legalLogo,
      headline,
      sponsorLogo,
      buttonContainer,
      versionInfo
    );
  }
}

if (!customElements.get("legal-menu")) {
  customElements.define("legal-menu", LegalMenu);
}