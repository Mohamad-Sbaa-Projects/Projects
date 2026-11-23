import {
  attachScenePropAnimation,
  preloadScenePropAssets,
} from "../services/ScenePropAnimationService.js";

class PropsLayer extends HTMLElement {
  static get observedAttributes() {
    return ["layer"];
  }

  constructor() {
    super();

    this.interactionsEnabled = false;
    this.animationCleanups = [];
  }

  connectedCallback() {
    this.syncLayerClass();
    preloadScenePropAssets();
  }

  disconnectedCallback() {
    this.cleanupAnimations();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.syncLayerClass();
    }
  }

  syncLayerClass() {
    const layer =
      this.getAttribute("layer") === "back"
        ? "back"
        : "front";

    this.className = "vn-props-layer";
    this.dataset.layer = layer;
    this.dataset.interactionsEnabled = String(
      this.interactionsEnabled
    );
  }

  setInteractionsEnabled(enabled) {
    this.interactionsEnabled = Boolean(enabled);

    this.dataset.interactionsEnabled = String(
      this.interactionsEnabled
    );
  }

  cleanupAnimations() {
    this.animationCleanups.forEach((cleanup) => {
      cleanup();
    });

    this.animationCleanups = [];
  }

  setProps(props) {
    this.cleanupAnimations();
    this.replaceChildren();

    const normalizedProps = Array.isArray(props)
      ? props
      : [];

    normalizedProps.forEach((prop, index) => {
      const hasRenderableContent = Boolean(
        prop?.imageUrl || prop?.className
      );

      if (!hasRenderableContent) {
        return;
      }

      const element = prop.imageUrl
        ? document.createElement("img")
        : document.createElement("div");

      if (prop.imageUrl) {
        element.src = prop.imageUrl;
        element.alt = prop.alt || "Scene prop";
        element.decoding = "async";
        element.draggable = false;
      } else {
        element.setAttribute("aria-hidden", "true");
      }

      element.className =
        `vn-scene-prop${
          prop.className ? ` ${prop.className}` : ""
        }`;

      element.style.setProperty(
        "--scene-prop-left",
        prop.left ?? "auto"
      );

      element.style.setProperty(
        "--scene-prop-right",
        prop.right ?? "auto"
      );

      element.style.setProperty(
        "--scene-prop-top",
        prop.top ?? "auto"
      );

      element.style.setProperty(
        "--scene-prop-bottom",
        prop.bottom ?? "0px"
      );

      element.style.setProperty(
        "--scene-prop-width",
        prop.width ?? "auto"
      );

      element.style.setProperty(
        "--scene-prop-height",
        prop.height ?? "auto"
      );

      element.style.setProperty(
        "--scene-prop-fit",
        prop.objectFit || "contain"
      );

      element.style.setProperty(
        "--scene-prop-position",
        prop.objectPosition || "center bottom"
      );

      element.style.setProperty(
        "--scene-prop-z-index",
        String(prop.zIndex ?? index + 1)
      );

      element.style.setProperty(
        "--scene-prop-clip-path",
        prop.clipPath || "none"
      );

      const transforms = [];

      if (prop.translateX) {
        transforms.push(
          `translateX(${prop.translateX})`
        );
      }

      if (prop.translateY) {
        transforms.push(
          `translateY(${prop.translateY})`
        );
      }

      if (prop.rotate) {
        transforms.push(`rotate(${prop.rotate})`);
      }

      element.style.setProperty(
        "--scene-prop-transform",
        transforms.length
          ? transforms.join(" ")
          : "none"
      );

      if (prop.interactionType) {
        const cleanup = attachScenePropAnimation(
          element,
          prop,
          () => this.interactionsEnabled
        );

        this.animationCleanups.push(cleanup);
      }

      this.appendChild(element);
    });
  }
}

if (!customElements.get("vn-props-layer")) {
  customElements.define(
    "vn-props-layer",
    PropsLayer
  );
}