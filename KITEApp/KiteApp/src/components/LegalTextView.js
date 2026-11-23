import {
  getLegalPageConfig,
  loadLegalText,
} from "../services/LegalService.js";

class LegalTextView extends HTMLElement {
  static get observedAttributes() {
    return ["page"];
  }

  connectedCallback() {
    this.loadAndRenderText();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadAndRenderText();
    }
  }

  get page() {
    return this.getAttribute("page");
  }

  async loadAndRenderText() {
    const page = this.page;
    const pageConfig = getLegalPageConfig(page);

    this.className = "legal-text-view";
    this.textContent = "Text wird geladen ...";

    try {
      const blocks = await loadLegalText(page);

      if (!this.isConnected || this.page !== page) {
        return;
      }

      this.renderBlocks(blocks);
    } catch (error) {
      console.error("[LegalTextView] Could not load legal text:", error);
      this.textContent = pageConfig.errorText;
    }
  }

  appendTextParts(parent, parts) {
    parts.forEach((part) => {
      if (part.type === "link") {
        const link = document.createElement("a");
        link.className = "legal-text-view__link";
        link.href = part.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = part.text;

        parent.appendChild(link);
        return;
      }

      parent.appendChild(document.createTextNode(part.text));
    });
  }

  renderBlocks(blocks) {
    this.replaceChildren();

    let list = null;

    blocks.forEach((block) => {
      if (block.type !== "list-item") {
        list = null;
      }

      if (block.type === "empty") {
        this.appendChild(document.createElement("br"));
        return;
      }

      if (block.type === "heading") {
        const heading = document.createElement("h6");
        heading.className = "font-adjustable legal-text-view__heading";
        heading.textContent = block.text;
        this.appendChild(heading);
        return;
      }

      if (block.type === "subheading") {
        const subheading = document.createElement("h6");
        subheading.className = "legal-text-view__subheading";
        subheading.textContent = block.text;
        this.appendChild(subheading);
        return;
      }

      if (block.type === "paragraph") {
        const paragraph = document.createElement("p");
        paragraph.className = "font-adjustable legal-text-view__paragraph";

        this.appendTextParts(paragraph, block.parts);

        this.appendChild(paragraph);
        return;
      }

      if (block.type === "list-item") {
        if (!list) {
          list = document.createElement("ul");
          list.className = "legal-text-view__list";
          this.appendChild(list);
        }

        const item = document.createElement("li");
        item.className = "legal-text-view__list-item";
        this.appendTextParts(item, block.parts);

        list.appendChild(item);
      }
    });
  }
}

if (!customElements.get("legal-text-view")) {
  customElements.define("legal-text-view", LegalTextView);
}