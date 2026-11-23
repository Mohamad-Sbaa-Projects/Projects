import "../components/LegalDynamic.js";
import "../components/AppHeader.js";

class LegalInformationScreen extends HTMLElement {
    connectedCallback(){
        this.render();
    }

    render(){
        this.className = "legal-information-screen";
        this.replaceChildren();

        const header = document.createElement("app-header");
        header.setAttribute("show-back", "");
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");

        const container = document.createElement("section");
        container.className = "legal-screen-container";
        const legalDynamic = document.createElement("legal-dynamic");
        legalDynamic.setAttribute("page", "legal");
        container.appendChild(legalDynamic);

        this.appendChild(header);
        this.appendChild(container);
    }
}

if(!customElements.get("legal-information-screen")){
    customElements.define("legal-information-screen", LegalInformationScreen);
}