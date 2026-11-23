import "../components/LegalDynamic.js";
import "../components/AppHeader.js";

class PrivacyPolicyScreen extends HTMLElement {
    connectedCallback(){
        this.render();
    }

    render(){
         this.className = "privacy-policy-screen";
         this.replaceChildren();

        const header = document.createElement("app-header");
        header.setAttribute("show-back", "");
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");

        const container = document.createElement("section");
        container.className = "legal-screen-container";
        container.innerHTML = `<legal-dynamic page="datenschutz"></legal-dynamic>`;

        this.appendChild(header);
        this.appendChild(container);
    }
}

if(!customElements.get("privacy-policy-screen")){
    customElements.define("privacy-policy-screen", PrivacyPolicyScreen);
}
    