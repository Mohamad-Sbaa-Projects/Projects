import {
  getLegalPageConfig,
  getLegalResetActionConfig,
  getLegalResetInfoConfig,
  getLegalResetConfirmDialogConfig,
  handleLegalResetAction,
} from "../services/LegalService.js";
import {
  reset,
  clearIntroNovelSessionProgress,
} from "../services/StorageService.js";

import "./Background.js";
import "./LegalMenu.js";
import "./LegalTextView.js";
import "./NovelHexagon.js";

class LegalDynamic extends HTMLElement {
  static get observedAttributes() {
    return ["page"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  get page() {
    return this.getAttribute("page") ?? "legal";
  }

  render() {
    const pageConfig = getLegalPageConfig(this.page);

    this.className = `legal-screen legal-screen--${pageConfig.id}`;
    this.replaceChildren();

    const background = document.createElement("vn-background");
    background.setBackground(pageConfig.background);

    const content = document.createElement("section");
    content.className = "legal-screen__content";

    if (pageConfig.type === "menu") {
      const menu = document.createElement("legal-menu");
      content.appendChild(menu);
    }

    if (pageConfig.type === "text") {
      if (pageConfig.id === "moretokite") {
        const titleHexagon = document.createElement("novel-hexagon");
        titleHexagon.className = "legal-screen__title-hexagon legal-screen__title-hexagon--moretokite";
        titleHexagon.setAttribute("content", pageConfig.title);
        titleHexagon.setAttribute("color-outer", "#D04C03");
        titleHexagon.setAttribute("color-inner", "#AA1C02");

        content.appendChild(titleHexagon);
      } else {
        const headline = document.createElement("h5");
        headline.className = "legal-screen__headline";
        headline.textContent = pageConfig.title;

        content.appendChild(headline);
      }

      const textView = document.createElement("legal-text-view");
      textView.setAttribute("page", pageConfig.id);

      if (pageConfig.showResetAction) {
        const resetActions = this.createResetActions();
        content.appendChild(resetActions);
      }

      content.appendChild(textView);

      if (Array.isArray(pageConfig.footerActions) && pageConfig.footerActions.length) {
        const actions = document.createElement("section");
        actions.className = "legal-screen__actions";

        pageConfig.footerActions.forEach((action) => {
          let label = null;
          let path = null;

          if (typeof action === "string") {
            const cfg = getLegalPageConfig(action);
            label = cfg.menuLabel ?? cfg.title ?? action;
            path = cfg.route;
          } else if (typeof action === "object" && action !== null) {
            label = action.label ?? action.title ?? action.id ?? action.route;
            path = action.route ?? action.path;
          }

          if (!path) {
            return;
          }

          const button = document.createElement("button");
          button.type = "button";
          button.className = "font-adjustable legal-button legal-screen__action-button";
          button.textContent = label;

          button.addEventListener("click", () => {
            if (path === "/szenario/einstieg") {
              reset.resetProgress("einstieg");
              clearIntroNovelSessionProgress();
            }
            this.dispatchEvent(
              new CustomEvent("legal-route-selected", {
                bubbles: true,
                composed: true,
                detail: {
                  path,
                },
              })
            );
          });

          actions.appendChild(button);
        });

        content.appendChild(actions);
      }
    }

    this.append(background, content);
  }

  createResetActions() {
    const resetConfig = getLegalResetActionConfig();
    const infoConfig = getLegalResetInfoConfig();

    const actions = document.createElement("div");
    actions.className = "legal-reset-actions";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "legal-reset-button";
    resetButton.textContent = resetConfig.label;
    resetButton.setAttribute("aria-label", resetConfig.ariaLabel);

    resetButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.showResetConfirmPopup();
    });

    const infoButton = document.createElement("button");
    infoButton.type = "button";
    infoButton.className = "legal-reset-info-button";
    infoButton.setAttribute("aria-label", infoConfig.ariaLabel);

    const infoIcon = document.createElement("img");
    infoIcon.className = "legal-reset-info-button__icon";
    infoIcon.src = infoConfig.iconPath;
    infoIcon.alt = "";
    infoIcon.setAttribute("aria-hidden", "true");

    infoButton.appendChild(infoIcon);

    infoButton.addEventListener("click", () => {
      this.showResetInfoDialog();
    });

    actions.append(resetButton, infoButton);

    return actions;
  }

  showResetConfirmPopup() {
  const confirmConfig = getLegalResetConfirmDialogConfig();

  const existingPopup = this.querySelector(
    'novel-action-popup[data-popup-type="legal-reset"]'
  );

  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement("novel-action-popup");
  popup.dataset.popupType = "legal-reset";
  popup.setAttribute("novel-id", "legal-reset");
  popup.setAttribute("color-inner", "#132034");

  popup.config = {
    showCharacter: true,
    modal: true,
    theme: {
      accent: "#132034",
    },
    title: "",
    text: confirmConfig.text,
    actions: [
      {
        type: "text",
        className:
          "novel-action-popup__button novel-action-popup__button--reset-cancel",
        label: confirmConfig.cancelLabel,
        eventName: "legal-reset-cancel",
      },
      {
        type: "text",
        className:
          "novel-action-popup__button novel-action-popup__button--reset-confirm",
        label: confirmConfig.confirmLabel,
        eventName: "legal-reset-confirm",
      },
    ],
  };

  popup.addEventListener("legal-reset-cancel", () => {
    popup.remove();
  });

  popup.addEventListener("legal-reset-confirm", () => {
    const resetWasSuccessful = handleLegalResetAction();

    if (!resetWasSuccessful) {
      return;
    }

    clearIntroNovelSessionProgress();
    popup.remove();
    this.showResetSuccessDialog();
  });

  popup.addEventListener("popup-closed", () => {
    popup.remove();
  });

  this.appendChild(popup);
}

  showResetSuccessDialog() {
  const existingDialog = this.querySelector(".legal-info-dialog-overlay");

  if (existingDialog) {
    existingDialog.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "legal-info-dialog-overlay";
  overlay.setAttribute("role", "presentation");

  const dialog = document.createElement("section");
  dialog.className = "legal-info-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const title = document.createElement("h6");
  title.className = "legal-info-dialog__title";
  title.textContent = "INFORMATION";

  const divider = document.createElement("div");
  divider.className = "legal-info-dialog__divider";

  const text = document.createElement("p");
  text.className = "legal-info-dialog__text";
  text.textContent = "Die App-Daten wurden erfolgreich gelöscht.";

  const okButton = document.createElement("button");
  okButton.type = "button";
  okButton.className = "legal-info-dialog__button";
  okButton.textContent = "OK";

  const closeDialog = () => {
    overlay.remove();
  };

  okButton.addEventListener("click", closeDialog);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeDialog();
    }
  });

  dialog.append(title, divider, text, okButton);
  overlay.appendChild(dialog);
  this.appendChild(overlay);

  okButton.focus();
}

  showResetInfoDialog() {
    const infoConfig = getLegalResetInfoConfig();

    const existingDialog = this.querySelector(".legal-info-dialog-overlay");

    if (existingDialog) {
      existingDialog.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "legal-info-dialog-overlay";
    overlay.setAttribute("role", "presentation");

    const dialog = document.createElement("section");
    dialog.className = "legal-info-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "legal-reset-info-title");

    const title = document.createElement("h6");
    title.id = "legal-reset-info-title";
    title.className = "legal-info-dialog__title";
    title.textContent = infoConfig.dialogTitle;

    const divider = document.createElement("div");
    divider.className = "legal-info-dialog__divider";

    const text = document.createElement("p");
    text.className = "legal-info-dialog__text";
    text.textContent = infoConfig.dialogText;

    const okButton = document.createElement("button");
    okButton.type = "button";
    okButton.className = "legal-info-dialog__button";
    okButton.textContent = infoConfig.confirmLabel;

    const closeDialog = () => {
      overlay.remove();
    };

    okButton.addEventListener("click", closeDialog);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeDialog();
      }
    });

    dialog.append(title, divider, text, okButton);
    overlay.appendChild(dialog);
    this.appendChild(overlay);

    okButton.focus();
  }
}

if (!customElements.get("legal-dynamic")) {
  customElements.define("legal-dynamic", LegalDynamic);
}