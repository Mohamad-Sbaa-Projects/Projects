class SwitchBtn extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.className = "switch-container relative cursor-pointer ";

    const dialogueBtn = document.createElement("input");
    dialogueBtn.type = "checkbox";
    dialogueBtn.className = "w-full h-full cursor-pointer absolute";
    
    const inputImgchecked = document.createElement("img");
    inputImgchecked.className = "img-checked absolute w-full h-full";
    inputImgchecked.src = "./public_assets/images/_Images/IconsAndLogos/Icon_Settings_Active.png";
    
    const inputImgunchecked = document.createElement("img");
    inputImgunchecked.className = "img-unchecked absolute w-full h-full";
    inputImgunchecked.src = "./public_assets/images/_Images/IconsAndLogos/Icon_Settings_Inactive.png";

    this.appendChild(dialogueBtn);
    this.appendChild(inputImgchecked);
    this.appendChild(inputImgunchecked);
  }
}

if (!customElements.get("switch-btn")) {
  customElements.define("switch-btn", SwitchBtn);
}