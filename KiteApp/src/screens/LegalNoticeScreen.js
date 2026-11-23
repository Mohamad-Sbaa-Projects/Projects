import "../components/LegalDynamic.js";
import "../components/AppHeader.js";

class LegalNoticeScreen extends HTMLElement {
    connectedCallback(){
        this.render();
    }

    render(){
        this.className = "legal-notice-screen";
        this.replaceChildren();

        const header = document.createElement("app-header");
        header.setAttribute("show-back", "");
        header.setAttribute("show-legal", "");
        header.setAttribute("show-settings", "");

        const container = document.createElement("section");
        container.className = "legal-screen-container";
        const legalDynamic = document.createElement("legal-dynamic");
        legalDynamic.setAttribute("page", "impressum");
        container.appendChild(legalDynamic);

        this.appendChild(header);
        this.appendChild(container);
    }
}

if(!customElements.get("legal-notice-screen")){
    customElements.define("legal-notice-screen", LegalNoticeScreen);
}