import { BookmarkService } from "../services/BookmarkService.js";

const NOVEL_SHAPE_PATH =
  "./public_assets/images/_Images/FoundersBubble/Novel_Shape.png";

class NovelHexagon extends HTMLElement {
  static get observedAttributes() {
    return ["content", "color-inner", "color-outer", "badge-number"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const content = this.getAttribute("content") || "";
    const colorInner = this.getAttribute("color-inner") || "#145c0f";
    const colorOuter = this.getAttribute("color-outer") || "#3f8f2f";
    const badgeNumber = Number(this.getAttribute("badge-number") || 0);

    this.replaceChildren();

    this.style.setProperty("--hexagon-inner-color", colorInner);
    this.style.setProperty("--hexagon-outer-color", colorOuter);
    this.style.setProperty("--novel-shape-image", `url(${NOVEL_SHAPE_PATH})`);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "novel-hexagon__button";

    const outerShape = document.createElement("span");
    outerShape.className = "novel-hexagon__outer";

    const innerShape = document.createElement("span");
    innerShape.className = "novel-hexagon__inner";

    const bookmarkOverlay = document.createElement("span");
    bookmarkOverlay.className = "novel-hexagon__bookmark";
    innerShape.appendChild(bookmarkOverlay);

    const text = document.createElement("span");
    text.className = "novel-hexagon__text";
    text.textContent = content;

    if (badgeNumber > 0) {
      const badge = document.createElement("span");
      badge.className = "novel-hexagon__badge";
      badge.textContent = String(badgeNumber);
      button.appendChild(badge);
    }

    button.appendChild(outerShape);
    button.appendChild(innerShape);
    button.appendChild(text);

    const novelId = this.getAttribute("novel-id");
    if (novelId && BookmarkService.isSaved(novelId)) {
      button.classList.add("bookmarked");
    }

    this.appendChild(button);
  }
}

if (!customElements.get("novel-hexagon")) {
  customElements.define("novel-hexagon", NovelHexagon);
}