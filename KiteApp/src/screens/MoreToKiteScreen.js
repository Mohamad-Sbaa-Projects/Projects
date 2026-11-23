import "../components/LegalDynamic.js";

class MoreToKiteScreen extends HTMLElement {
    connectedCallback(){
        this.render();
    }

    render(){
        this.className = "more-to-kite-screen";
        this.replaceChildren();

        const container = document.createElement("section");
        container.className = "legal-screen-container more-to-kite-container";
        const legalDynamic = document.createElement("legal-dynamic");
        legalDynamic.setAttribute("page", "moretokite");
        container.appendChild(legalDynamic);

        this.appendChild(container);
    }
}

if(!customElements.get("more-to-kite-screen")){
    customElements.define("more-to-kite-screen", MoreToKiteScreen);
}