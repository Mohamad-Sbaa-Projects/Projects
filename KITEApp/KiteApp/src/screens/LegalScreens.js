import "../components/LegalDynamic.js";

class LegalScreens extends HTMLElement {
  static get observedAttributes() {
    return ["subpage"];
  }

    connectedCallback(){
      this.render();
    }

    render(){
      this.subpage = this.getAttribute("subpage");

      switch(this.subpage) {
        case "legal":
          this.className = "legal-information-screen";
          break;
        case "impressum":
          this.className = "legal-notice-screen";
          break;
        case "datenschutz":
          this.className = "privacy-policy-screen";
          break;
        case "nutzungsbedingungen":
          this.className = "terms-of-use-legal-screen";
          break;
        default:
            this.className = "legal-information-screen";
      }
      
        this.replaceChildren();

        const container = document.createElement("section");
        container.className = "legal-screen-container";
        container.innerHTML = `<legal-dynamic page="${this.subpage}"></legal-dynamic>`;

        this.appendChild(container);
    }
}

if(!customElements.get("legal-screens")){
    customElements.define("legal-screens", LegalScreens);
}