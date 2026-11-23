class SettingsSlider extends HTMLElement {
  static get observedAttributes() {
    return ["iconSrc"];
  }
  constructor() {
    super();
    this.iconSrc = "";
  }

  connectedCallback() {
    this.render(this.iconSrc);
  }

  render() {
    this.className = "flex items-center justify-between w-full";

    const smallVolumeIcon = document.createElement("img");
    smallVolumeIcon.src = this.getAttribute("iconSrc") || "";;
    smallVolumeIcon.className = "small-icon";

    const bigVolumeIcon = smallVolumeIcon.cloneNode();
    bigVolumeIcon.className = "big-icon";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.style.accentColor = "#0F1A2C";

    this.appendChild(smallVolumeIcon);
    this.appendChild(slider);
    this.appendChild(bigVolumeIcon);
  }
}

if (!customElements.get("settings-slider")) {
  customElements.define("settings-slider", SettingsSlider);
}