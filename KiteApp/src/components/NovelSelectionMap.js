import "./NovelHexagon.js";
import {
  setupHorizontalDragScroll,
  smoothScrollElementIntoCenter,
} from "../core/utils/scrollUtils.js";

const LANDSCAPE_BACKGROUND_PATH = new URL(
  "../../public_assets/images/_Images/FoundersBubble/ScrollingBehavior/Panorama_Landschaft.png",
  import.meta.url
).href;

const FOREGROUND_FRAME_PATH = new URL(
  "../../public_assets/images/_Images/FoundersBubble/ScrollingBehavior/Panorama.png",
  import.meta.url
).href;

const MIN_SCROLL_LEFT = 100;
const MAX_SCROLL_LEFT = 608;

const HEXAGON_POSITION_CLASS_BY_NOVEL_ID = {
  eltern: "novel-selection-hexagon--eltern",
  honorar: "novel-selection-hexagon--honorar",
  investor: "novel-selection-hexagon--investor",
  bank: "novel-selection-hexagon--bank",
  kreditantrag: "novel-selection-hexagon--bank",
  notarin: "novel-selection-hexagon--notarin",
  presse: "novel-selection-hexagon--presse",
  interview: "novel-selection-hexagon--presse",
  vermieter: "novel-selection-hexagon--vermieter",
};

class NovelSelectionMap extends HTMLElement {
  constructor() {
    super();
    this._onGlobalRemembered = this._onGlobalRemembered.bind(this);
    this._onScroll = this._onScroll.bind(this);

    this._novels = [];
    this._cleanupScroll = null;
    this._initialScrollFrame = null;
    this._scrollRaf = null;
    this._selectionClickToken = 0;
  }

  set novels(value) {
    this._novels = Array.isArray(value) ? value : [];

    if (this.isConnected) {
      this.render();
      this.setupScroll();
    }
  }

  get novels() {
    return this._novels;
  }

  connectedCallback() {
    this.render();
    this.setupScroll();
    window.addEventListener("novel-remembered", this._onGlobalRemembered);
  }

  disconnectedCallback() {
    this.cleanupScroll();
    this.cleanupParallax();
   // window.removeEventListener("novel-remembered", this._onGlobalRemembered);
  }

  _onGlobalRemembered(event) {
    const {novelId, id, saved} = event.detail || {};
    const targetId = novelId ?? id;
    if (!targetId) return;

    const hex = this.querySelector(`novel-hexagon[novel-id="${targetId}"]`);
    if (!hex) return;

    if (saved) {
      hex.setAttribute('saved', 'true');
    } else {
      hex.removeAttribute('saved');
    }

    requestAnimationFrame(() => {
      const btn = hex.querySelector('.novel-hexagon__button');
      if (!btn) return;

      if (saved) {
        btn.classList.add('bookmarked');
      } else {
        btn.classList.remove('bookmarked');
      }
    });
  }

  setupScroll() {
    this.cleanupScroll();
    this.cleanupParallax();

    const scrollViewport = this.querySelector(
      ".novel-selection-scroll-viewport"
    );

    if (!scrollViewport) {
      return;
    }

    this._cleanupScroll =
      setupHorizontalDragScroll(scrollViewport);

    scrollViewport.addEventListener(
      "scroll",
      this._onScroll,
      { passive: true }
    );

    this._scrollViewport = scrollViewport;

    this._scrollStage = this.querySelector(
      ".novel-selection-scroll-stage"
    );

    this._landscapeImage = this.querySelector(
      ".novel-selection-screen__landscape"
    );

    this._foregroundImage = this.querySelector(
      ".novel-selection-screen__foreground"
    );

    this._hexagonLayer = this.querySelector(
      ".novel-selection-screen__hexagon-layer"
    );

    this._initialScrollFrame =
      window.requestAnimationFrame(() => {
        if (!this.isConnected) {
          return;
        }

        const maxScroll = Math.max(
          scrollViewport.scrollWidth -
            scrollViewport.clientWidth,
          0
        );

        const minScrollLeft = Math.min(
          MIN_SCROLL_LEFT,
          maxScroll
        );

        const maxScrollLeft = Math.max(
          minScrollLeft,
          Math.min(MAX_SCROLL_LEFT, maxScroll)
        );

        const initialScrollLeft =
          (minScrollLeft + maxScrollLeft) / 2;

        scrollViewport.scrollLeft = initialScrollLeft;

        this.applyParallax(initialScrollLeft);

        this._initialScrollFrame = null;
      });
  }

  cleanupScroll() {
    if (this._cleanupScroll) {
      this._cleanupScroll();
      this._cleanupScroll = null;
    }

    if (this._initialScrollFrame) {
      window.cancelAnimationFrame(
        this._initialScrollFrame
      );

      this._initialScrollFrame = null;
    }

    if (this._scrollViewport) {
      this._scrollViewport.removeEventListener(
        "scroll",
        this._onScroll
      );
    }
  }

  cleanupParallax() {
    if (this._scrollRaf) {
      window.cancelAnimationFrame(this._scrollRaf);
      this._scrollRaf = null;
    }

    this._scrollViewport = null;
    this._scrollStage = null;
    this._landscapeImage = null;
    this._foregroundImage = null;
    this._hexagonLayer = null;
  }

  _onScroll() {
    if (this._scrollRaf) {
      return;
    }

    this._scrollRaf = window.requestAnimationFrame(() => {
      this._scrollRaf = null;

      if (!this._scrollViewport) {
        return;
      }

      const clampedScrollLeft = Math.max(
        MIN_SCROLL_LEFT,
        Math.min(
          this._scrollViewport.scrollLeft,
          MAX_SCROLL_LEFT
        )
      );

      if (
        clampedScrollLeft !==
        this._scrollViewport.scrollLeft
      ) {
        this._scrollViewport.scrollLeft =
          clampedScrollLeft;
      }

      this.applyParallax(clampedScrollLeft);
    });
  }

  applyParallax(scrollLeft) {
    const landscape = this._landscapeImage;
    const foreground = this._foregroundImage;
    const hexagonLayer = this._hexagonLayer;

    if (!landscape || !foreground || !hexagonLayer) {
      return;
    }

    const landscapeOffset = scrollLeft * 0.25;
    const foregroundOffset = scrollLeft * 0.6;
    const hexagonOffset = scrollLeft;

    landscape.style.transform = `translateX(${-landscapeOffset}px)`;
    foreground.style.transform = `translateX(${-foregroundOffset}px)`;
    hexagonLayer.style.transform = `translateX(${-hexagonOffset}px)`;
  }

  render() {
    this.replaceChildren();

    const scrollViewport = document.createElement("section");
    scrollViewport.className = "novel-selection-scroll-viewport";

    const scrollStage = document.createElement("div");
    scrollStage.className = "novel-selection-scroll-stage";

    const landscapeImage = document.createElement("img");
    landscapeImage.className = "novel-selection-screen__landscape";
    landscapeImage.src = LANDSCAPE_BACKGROUND_PATH;
    landscapeImage.alt = "KITE landscape background";

    const foregroundImage = document.createElement("img");
    foregroundImage.className = "novel-selection-screen__foreground";
    foregroundImage.src = FOREGROUND_FRAME_PATH;
    foregroundImage.alt = "KITE window foreground";

    const dragLayer = document.createElement("div");
    dragLayer.className = "novel-selection-drag-layer";

    const hexagonLayer = document.createElement("div");
    hexagonLayer.className = "novel-selection-screen__hexagon-layer";

    this._novels.forEach((novel) => {
      const hexagon = this.createNovelHexagon(novel, scrollViewport);
      hexagonLayer.appendChild(hexagon);
    });

    scrollStage.appendChild(landscapeImage);
    scrollStage.appendChild(foregroundImage);
    scrollStage.appendChild(dragLayer);
    scrollStage.appendChild(hexagonLayer);

    scrollViewport.appendChild(scrollStage);
    this.appendChild(scrollViewport);
  }

  createNovelHexagon(novel, scrollViewport) {
    const hexagon = document.createElement("novel-hexagon");

    const positionClass =
      HEXAGON_POSITION_CLASS_BY_NOVEL_ID[novel.id] ??
      "novel-selection-hexagon--fallback";

    hexagon.className = `novel-selection-hexagon ${positionClass}`;

    hexagon.setAttribute("novel-id", novel.id);
    hexagon.setAttribute("content", novel.title);
    hexagon.setAttribute("color-outer", novel.novelFrameColor);
    hexagon.setAttribute("color-inner", novel.novelColor);

    try {
      const savedIds = BookmarkService.getSaved?.() || [];
      if (savedIds.includes(novel.id)) {
        hexagon.setAttribute('saved', 'true');
        requestAnimationFrame(() => {
          const btn = hexagon.querySelector('.novel-hexagon__button');
          if (btn) btn.classList.add('bookmarked');
        });
      }
    } catch (e) {
      // silent fail if BookmarkService isn't available synchronously
    }

    hexagon.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      /*
        Center the selected hexagon before opening the popup.
        This keeps the popup visually aligned with the current selection.
      */

      const duration = 300;
      const absoluteHexLeft = hexagon.offsetLeft; 
      const hexWidth = hexagon.offsetWidth || 120; // Breite des Hexagons
      const absoluteHexMiddle = absoluteHexLeft + (hexWidth / 2);
      const viewportWidth = scrollViewport.clientWidth;
      const halfViewport = viewportWidth / 2;

      let targetScrollLeft = absoluteHexMiddle - halfViewport;

      targetScrollLeft = targetScrollLeft / 2;
      targetScrollLeft = targetScrollLeft - 33; 

      const maxPossibleScroll = Math.max(scrollViewport.scrollWidth - scrollViewport.clientWidth, 0);

      targetScrollLeft = Math.max(
        MIN_SCROLL_LEFT,
        Math.min(targetScrollLeft, maxPossibleScroll)
      );

      scrollViewport.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth"
      });

      window.setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent("novel-clicked", {
            bubbles: true,
            detail: { novel },
          })
        );
      }, duration);
    });
    return hexagon;
  }
}

if (!customElements.get("novel-selection-map")) {
  customElements.define("novel-selection-map", NovelSelectionMap);
}
