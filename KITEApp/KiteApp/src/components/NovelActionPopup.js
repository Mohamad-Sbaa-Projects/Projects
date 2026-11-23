import { BookmarkService } from "../services/BookmarkService.js";

const PLAY_BUTTON_IMAGE = new URL(
    "../../public_assets/images/_Images/Buttons/button_play.png",
    import.meta.url
).href;

const REMEMBER_BUTTON_IMAGE = new URL(
    "../../public_assets/images/_Images/Buttons/Button_Remeber.png",
    import.meta.url
).href;

const REMEMBER_ICON_WHITE = new URL(
    "../../public_assets/images/_Images/Buttons/Bookmark.png",
    import.meta.url
).href;

class NovelActionPopup extends HTMLElement {
    static get observedAttributes() {
        return ["novel-id", "color-inner", "popup-text"];
    }

    constructor() {
        super();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this._config = null;
    }

    set config(value) {
        this._config = value && typeof value === "object" ? value : null;
        if (this.isConnected) this.render();
    }

    get config() {
        return this._config;
    }

    connectedCallback() {
        this.render();
        document.addEventListener("keydown", this.handleKeyDown);
    }

    disconnectedCallback() {
        document.removeEventListener("keydown", this.handleKeyDown);
        if (this._handleFocusTrap) {
            this.removeEventListener("keydown", this._handleFocusTrap);
            this._handleFocusTrap = null;
        }
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    handleKeyDown(event) {
        if (event.key === "Escape") this.closePopup();
    }

    closePopup() {
        this.dispatchEvent(new CustomEvent("popup-closed", { bubbles: true }));
        if (this.parentElement) this.parentElement.removeChild(this);
    }

    dispatchPopupAction(eventName, novelId, detail = {}) {
        const shouldBubble = eventName !== "novel-remembered";
        this.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: shouldBubble,
                detail: { novelId, ...detail },
            })
        );
    }

    /* ---------------------------------------------------------
       MERKEN/GEMERKT LOGIC
    --------------------------------------------------------- */
    createImageButton({ className, label, src, eventName, novelId, textColor, detail = {} }) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;

        const image = document.createElement("img");
        image.className = "novel-action-popup__button-image";
        image.src = src;

        const text = document.createElement("span");
        text.className = "novel-action-popup__button-text";
        text.textContent = label;
        if (textColor) text.style.color = textColor;

        button.appendChild(image);
        button.appendChild(text);

        button.addEventListener("click", (evt) => {
            evt.stopPropagation();

            if (eventName === "novel-remembered") {
                const gem = this.createGemerktButton({ novelId });
                button.replaceWith(gem);
            }

            this.dispatchPopupAction(eventName, novelId, detail);

            if (eventName === "novel-remembered") {
                window.dispatchEvent(
                    new CustomEvent("novel-remembered", {
                        detail: { novelId, saved: BookmarkService.isSaved(novelId) }
                    })
                );
            }
        });

        return button;
    }

    createGemerktButton({ novelId }) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "remember-btn remembered";

        const icon = document.createElement("img");
        icon.src = REMEMBER_ICON_WHITE;
        icon.className = "remembered-icon";

        const text = document.createElement("span");
        text.textContent = "GEMERKT";
        text.className = "remembered-text";

        button.appendChild(icon);
        button.appendChild(text);

        button.addEventListener("click", (evt) => {
            evt.stopPropagation();

            const rememberBtn = this.createImageButton({
                className: "novel-action-popup__button novel-action-popup__button--remember",
                label: "MERKEN",
                src: REMEMBER_BUTTON_IMAGE,
                eventName: "novel-remembered",
                novelId,
                textColor: null,
                detail: { saved: false },
            });

            button.replaceWith(rememberBtn);

            this.dispatchPopupAction("novel-remembered", novelId, { saved: false });

            window.dispatchEvent(
                new CustomEvent("novel-remembered", {
                    detail: { novelId, saved: BookmarkService.isSaved(novelId) }
                })
            );
        });

        return button;
    }

    appendSafeRichText(target, input) {
        const allowedTags = new Set(["BR", "STRONG"]);
        const template = document.createElement("template");
        template.innerHTML = typeof input === "string" ? input : "";

        const fragment = document.createDocumentFragment();
        template.content.childNodes.forEach((node) => {
            const sanitized = this.sanitizeNode(node, allowedTags);
            if (sanitized) {
                fragment.appendChild(sanitized);
            }
        });

        target.replaceChildren(fragment);
    }

    sanitizeNode(node, allowedTags) {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent ?? "");
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const tagName = node.tagName.toUpperCase();
        const childFragment = document.createDocumentFragment();

        node.childNodes.forEach((child) => {
            const sanitizedChild = this.sanitizeNode(child, allowedTags);
            if (sanitizedChild) {
                childFragment.appendChild(sanitizedChild);
            }
        });

        if (!allowedTags.has(tagName)) {
            return childFragment;
        }

        const element = document.createElement(tagName.toLowerCase());
        if (tagName !== "BR") {
            element.appendChild(childFragment);
        }

        return element;
    }

    /* ---------------------------------------------------------
       RENDER
    --------------------------------------------------------- */
    render() {
        this.replaceChildren();

        const novelId = this.getAttribute("novel-id");
        const config = this._config;
        const accentColor = config?.theme?.accent ?? this.getAttribute("color-inner") ?? "#14305D";
        const popupText = config?.text ?? "";
        const isSaved = BookmarkService.isSaved(novelId);

        const overlay = document.createElement("div");
        overlay.className = "novel-action-popup";
        overlay.addEventListener("click", (event) => {
            if (this._config?.modal) {
                event.stopPropagation();
                return;
            }

            if (event.target === overlay) {
                this.closePopup();
            }
        });

        const container = document.createElement("div");
        container.className = "novel-action-popup__container";

        const dialog = document.createElement("div");
        dialog.className = "novel-action-popup__dialog";
        dialog.style.setProperty("--novel-action-popup-accent", accentColor);

        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", config?.modal ? "true" : "false");
        dialog.tabIndex = -1;

        const title = document.createElement("h2");
        title.className = "novel-action-popup__title";
        title.textContent = config?.title || "";
        if (!config?.title) title.style.display = "none";

        const idBase = novelId || Math.random().toString(36).slice(2, 8);
        if (config?.title) {
            title.id = `novel-action-popup-title-${idBase}`;
            dialog.setAttribute("aria-labelledby", title.id);
        }

        const description = document.createElement("p");
        description.className = "font-adjustable novel-action-popup__text";
        this.appendSafeRichText(description, popupText);

        const actions = document.createElement("div");
        actions.className = "novel-action-popup__actions";

        /* ---------------------------------------------------------
           CONFIG-DRIVEN MODE (resume popup, leave popup, back button)
        --------------------------------------------------------- */
        if (config?.actions && Array.isArray(config.actions)) {

            if (config.layout === "vertical") {
                actions.classList.add("novel-action-popup__actions--vertical");
            } else if (config.layout === "grid" || config.actions.length > 2) {
                actions.classList.add("novel-action-popup__actions--grid");
            }

            if (config.showCharacter) {
                this.classList.add("has-character");

                const charImg = document.createElement("img");
                charImg.src = "./public_assets/images/_Images/Character/exampleChar.png";
                charImg.className = "novel-action-popup__character";
                charImg.alt = "Character";
                container.appendChild(charImg);

                dialog.classList.add("novel-action-popup__dialog--with-character");
            }

            config.actions.forEach((action) => {
                if (action.type === "text") {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = action.className;
                    btn.textContent = action.label;
                    btn.addEventListener("click", () => {
                        this.dispatchPopupAction(action.eventName, novelId, action.detail);
                    });
                    actions.appendChild(btn);
                } else {
                    actions.appendChild(
                        this.createImageButton({
                            className: action.className,
                            label: action.label,
                            src: action.src,
                            eventName: action.eventName,
                            novelId,
                            textColor: action.textColor,
                            detail: action.detail,
                        })
                    );
                }
            });

            dialog.appendChild(title);
            dialog.appendChild(description);
            dialog.appendChild(actions);

            container.appendChild(dialog);
            overlay.appendChild(container);
            this.appendChild(overlay);

            if (config?.modal) {
                const firstFocusable = this.querySelector(".novel-action-popup__actions button, .novel-action-popup__actions [tabindex]") || dialog;
                (firstFocusable).focus();

                this._handleFocusTrap = (e) => {
                    if (e.key !== "Tab") return;
                    const focusable = Array.from(this.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
                        .filter(el => !el.disabled && el.offsetParent !== null);
                    if (focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                };

                this.addEventListener("keydown", this._handleFocusTrap);
            }
            return;
        }

        /* ---------------------------------------------------------
           DEFAULT MODE (selection screen popup)
        --------------------------------------------------------- */
        actions.appendChild(
            this.createImageButton({
                className: "novel-action-popup__button novel-action-popup__button--play",
                label: "SPIELEN",
                src: PLAY_BUTTON_IMAGE,
                eventName: "novel-play-selected",
                novelId,
                textColor: accentColor,
            })
        );

        if (!isSaved) {
            actions.appendChild(
                this.createImageButton({
                    className: "novel-action-popup__button novel-action-popup__button--remember",
                    label: "MERKEN",
                    src: REMEMBER_BUTTON_IMAGE,
                    eventName: "novel-remembered",
                    novelId,
                    textColor: accentColor,
                    detail: { saved: true },
                })
            );
        } else {
            actions.appendChild(this.createGemerktButton({ novelId }));
        }

        dialog.appendChild(title);
        dialog.appendChild(description);
        dialog.appendChild(actions);

        container.appendChild(dialog);
        overlay.appendChild(container);
        this.appendChild(overlay);

        if (config?.modal) {
            const firstFocusable = this.querySelector(".novel-action-popup__actions button, .novel-action-popup__actions [tabindex]") || dialog;
            (firstFocusable).focus();

            this._handleFocusTrap = (e) => {
                if (e.key !== "Tab") return;
                const focusable = Array.from(this.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
                    .filter(el => !el.disabled && el.offsetParent !== null);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            };

            this.addEventListener("keydown", this._handleFocusTrap);
        }
    }
}

if (!customElements.get("novel-action-popup")) {
    customElements.define("novel-action-popup", NovelActionPopup);
}

/* ---------------------------------------------------------
   STATIC HELPERS (resume popup + leave popup + undo popup)
--------------------------------------------------------- */
NovelActionPopup.showResume = function ({ parent = document.body, novelId, colorInner = "" } = {}) {
    const popup = document.createElement("novel-action-popup");
    popup.setAttribute("novel-id", novelId);
    popup.setAttribute("color-inner", colorInner);

    popup.config = {
        showCharacter: true,
        modal: true,
        theme: { accent: "#0E1A2D" },
        title: "",
        text:
            "Es gibt einen gespeicherten Spielstand. Möchtest du die Novel dort fortsetzen oder möchtest du die Novel neu starten? Wenn du neu startest, wird der pausierte Spielstand gelöscht und die Novel startet am Anfang.",
        actions: [
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--continue",
                label: "WEITERSPIELEN",
                eventName: "novel-continue-selected",
                detail: { novelId },
            },
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--restart",
                label: "NEU STARTEN",
                eventName: "novel-restart-selected",
                detail: { novelId },
            },
        ],
    };

    parent.appendChild(popup);
    return popup;
};

NovelActionPopup.showLeaveConfirmation = function ({ parent = document.body, novelId, colorInner = "" } = {}) {
    const popup = document.createElement("novel-action-popup");
    popup.setAttribute("novel-id", novelId);
    popup.setAttribute("color-inner", colorInner);

    popup.config = {
        showCharacter: true,
        modal: true,
        theme: { accent: colorInner || "#0E1A2D" },
        layout: "grid",
        title: "Was möchtest du tun?",
        text: `
      <strong>Weiterspielen:</strong> Die Story fortsetzen.<br><br>
      <strong>Pausieren:</strong> Später an dieser Stelle weitermachen.<br><br>
      <strong>Abbrechen:</strong> Die Story ohne Speicherung abbrechen.<br><br>
      <strong>Abschließen:</strong> Die Story hier beenden und als abgeschlossen werten.
    `,
        actions: [
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--leave novel-action-popup__button--leave-continue",
                label: "WEITERSPIELEN",
                eventName: "novel-leave-continue",
                detail: { novelId },
            },
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--leave novel-action-popup__button--leave-pause",
                label: "PAUSIEREN",
                eventName: "novel-leave-pause",
                detail: { novelId },
            },
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--leave novel-action-popup__button--leave-cancel",
                label: "ABBRECHEN",
                eventName: "novel-leave-cancel",
                detail: { novelId },
            },
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--leave novel-action-popup__button--leave-finish",
                label: "ABSCHLIESSEN",
                eventName: "novel-leave-finish",
                detail: { novelId },
            },
        ],
    };

    parent.appendChild(popup);
    return popup;
};

NovelActionPopup.showUndoDecision = function ({ parent = document.body, novelId, colorInner = "" } = {}) {
    const existing = parent.querySelector("novel-action-popup");
    if (existing) {
        existing.remove();
    }

    const popup = document.createElement("novel-action-popup");
    popup.setAttribute("novel-id", novelId);
    popup.setAttribute("color-inner", colorInner);

    popup.config = {
        showCharacter: true,
        modal: true,
        theme: { accent: colorInner || "#0E1A2D" },
        layout: "vertical",
        title: "",
        text: "Bist du sicher, dass Du deine Entscheidung rückgängig machen möchtest?",
        actions: [
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--continue",
                label: "WEITERSPIELEN",
                eventName: "novel-undo-cancel",
                detail: { novelId },
            },
            {
                type: "text",
                className: "novel-action-popup__button novel-action-popup__button--undo",
                label: "RÜCKGÄNGIG MACHEN",
                eventName: "novel-undo-confirmed",
                detail: { novelId },
            },
        ],
    };

    popup.classList.add("undo-popup");
    parent.appendChild(popup);
    return popup;
};