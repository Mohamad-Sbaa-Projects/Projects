import { getDescriptionText, hideInfoBox } from "../services/SettingsService.js";

class InformationBox extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const btnId = this.btnId;
    const switchBtn = this.switchBtn;

    const overlay = document.createElement("div");
    overlay.className = "settings-overlay";

    const box = document.createElement("div");
    box.className = "information-box flex flex-col rounded text-white";

    const headline = document.createElement("h4");
    headline.textContent = "INFORMATION";
    headline.className = "flex items-center justify-center w-full";

    const switchInput = switchBtn?.querySelector("input[type='checkbox']");

    const description = document.createElement("p");
    getDescriptionText(btnId, switchInput, description);
    description.className = "font-adjustable";

    const btn = document.createElement("button");
    btn.textContent = "OK";
    btn.className = "text-white border";
    btn.id = btnId;

    hideInfoBox(btn, overlay);

    box.appendChild(headline);
    box.appendChild(description);
    box.appendChild(btn);

    overlay.appendChild(box);

    this.replaceWith(overlay);
  }
}

if (!customElements.get("information-box")) {
  customElements.define("information-box", InformationBox);
}
