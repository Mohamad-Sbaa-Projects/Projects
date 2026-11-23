import "./SettingsSlider.js";
import "./SwitchBtn.js";
import "./InformationBox.js";
import { toggleInfoBox, saveAndLoadSettings, saveAndLoadText, saveAndLoadSound } from "../services/SettingsService.js";

class SettingsBox extends HTMLElement {
  constructor() {
    super();
    this.btnId = "";
    this.iconSrc = "";
    this.headlineText = "";
    this.descriptionText = "";
    this.soundSlider = false;
    this.textCustomization = false;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const btnId = this.btnId;
    const iconSrc = this.iconSrc;
    const headlineText = this.headlineText;
    const descriptionText = this.descriptionText;
    const soundSlider = this.soundSlider;
    const textCustomization = this.textCustomization;
    this.className = "settings-box box flex flex-row items-center justify-between rounded px-3 bg-white";

    const dialogueIcon = document.createElement("img");
    dialogueIcon.src = iconSrc;
    dialogueIcon.alt = "Dialogue Icon";
    dialogueIcon.style.height = "25px";
    dialogueIcon.className = "main-icon";

    const dialogueHeadline = document.createElement("h3");
    dialogueHeadline.textContent = headlineText;
    dialogueHeadline.style.flexGrow = "0.8";
    dialogueHeadline.style.fontWeight = "600";

    const dialogueText = document.createElement("p");
    dialogueText.textContent = descriptionText;
    dialogueText.className = "font-adjustable w-full mt-2 text-slate-900 font-extralight";
    dialogueText.style.flexBasis = "100%";

    this.appendChild(dialogueIcon);
    this.appendChild(dialogueHeadline);

    const switchBtn = document.createElement("switch-btn");
    const btn = document.createElement("button");
    btn.textContent = "SCHRIFTGRÖSSE FESTLEGEN";
    btn.className = "font-adjustable text-white w-full submit-text-size";

    const TextCustSlider = document.createElement("settings-slider");
    TextCustSlider.setAttribute("iconSrc", "./public_assets/images/_Images/Buttons/BurgerMenu/typesize_big_A.png");
     
    const exampleText = document.createElement("p");
    exampleText.textContent = "Beispieltext";
    exampleText.id = "example-text";
    exampleText.className = "flex items-center justify-center w-full text-slate-900";
    exampleText.style.fontSize = "24px";

    // each Box has different Layout
    if (textCustomization) {
      this.appendChild(TextCustSlider);
      this.appendChild(exampleText);
      const textSizeSlider = TextCustSlider.querySelector("input[type='range']");
      textSizeSlider
        ? saveAndLoadText(btnId, textSizeSlider, exampleText)
        : console.warn("Range input not found in text customization slider");
    }
    else {
      this.appendChild(switchBtn);
    }
    this.appendChild(dialogueText);

    soundSlider && saveAndLoadSound(btnId, this);

    if (textCustomization) {
      this.appendChild(btn);
    }
    switchBtn.addEventListener("click", () => {
      toggleInfoBox(this, btnId, switchBtn);
    });

    //text customization Box
    btn.addEventListener("click", () => {
      toggleInfoBox(this, btnId, switchBtn);
    });

    const checkbox = switchBtn.querySelector("input[type='checkbox']");
    checkbox && saveAndLoadSettings(btnId, checkbox, this);
  }
}

if (!customElements.get("settings-box")) {
  customElements.define("settings-box", SettingsBox);
}