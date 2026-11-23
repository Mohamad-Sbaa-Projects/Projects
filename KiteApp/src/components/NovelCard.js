class NovelCard extends HTMLElement {

  static get observedAttributes() {
    return ["content", "color-inner", "color-outer"];
  }
  
  constructor() {
    super();
    this.content = "";
    this.colorInner = "#fff";
    this.colorOuter = "#000";
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.content = this.getAttribute("content");
    this.colorInner = this.getAttribute("color-inner");
    this.colorOuter = this.getAttribute("color-outer");

    this.innerHTML = "";

    const outerHexagon = document.createElement("div")
    outerHexagon.className = "hexagon outer-hex";
    outerHexagon.style.backgroundColor = this.colorOuter;

    const innerHexagon = document.createElement("div");
    innerHexagon.className = "hexagon inner-hex";
    innerHexagon.style.backgroundColor = this.colorInner;

    const text = document.createElement("p");
    text.textContent = this.content;
    innerHexagon.appendChild(text);

    outerHexagon.appendChild(innerHexagon);

    this.appendChild(outerHexagon);
  }
}

if (!customElements.get("novel-card")) {
  customElements.define("novel-card", NovelCard);
}
