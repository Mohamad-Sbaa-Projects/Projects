import "../components/knowledge/KnowledgeCard.js";
import {findItemById, linkifyQuelle, getKnowledgeId} from "../services/KnowledgeService.js";

export class KnowledgeDetailScreen extends HTMLElement {
    connectedCallback() {
        this.className = "knowledge-detail-root";
        this.render();
    }

    render() {
        const item = findItemById(getKnowledgeId(this));
        const wrapper = document.createElement("div");
        wrapper.className = "knowledge-detail";
       
        const content = document.createElement("div");
        content.className = "knowledge-detail-content";
        
        const topSection = document.createElement("div");
        topSection.className = "knowledge-top";

        const icon = document.createElement("img");
        icon.src = "../../public_assets/images/_Images/IconsAndLogos/Icon_Knowledge.png";
        icon.className = "knowledge-icon";
        icon.alt = "Wissen Icon";
        
        const title = document.createElement("h1");
        title.textContent = "WISSEN";

        topSection.appendChild(icon);
        topSection.appendChild(title);
        content.appendChild(topSection);

        if (item) {
          const box = document.createElement("div");
          box.className = "white-box detail-box";

          const title = document.createElement("div");
          title.className = "font-adjustable detail-title";
          title.textContent = item.title;

          const preview = document.createElement("div");
          preview.className = "font-adjustable detail-preview";
          preview.innerHTML = linkifyQuelle(item.preview || "");

          const text = document.createElement("div");
          text.className = "font-adjustable detail-text";
          text.innerHTML = linkifyQuelle(item.text || "");

          box.append(title, preview, text);
          content.appendChild(box);
        } 
        else {
          const message = document.createElement("p");
          message.className = "knowledge-text";
          message.textContent = "Inhalt nicht gefunden. Bitte gehe zurück zur Wissensübersicht.";
          content.appendChild(message);
        }

        wrapper.appendChild(content);
        this.appendChild(wrapper);
     }
}

if (!customElements.get("knowledge-detail-screen")) {
    customElements.define("knowledge-detail-screen", KnowledgeDetailScreen);
}
