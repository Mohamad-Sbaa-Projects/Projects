import { novelSession } from "../controllers/undo/novelSession.js";
import { StateManager } from "../services/StateManager.js"

export class ChoiceList extends HTMLElement {
    constructor() {
        super();
        this._choices = [];
        this._selectionPending = false;
    }

    connectedCallback(){
        // eslint-disable-next-line no-console
        console.debug('ChoiceList:connected', { novelId: this.getAttribute('novel-id') });
        this.render();
    }

    set choices(value) {
        this._choices = Array.isArray(value) ? value : [];
        this.render();
    }

    get choices() {
        return this._choices;
    }

    _dialogueIsTyping() {
        // prefer the dialogue box instance provided by the nearest novel-player-view
        const player = this.closest && this.closest('novel-player-view') ? this.closest('novel-player-view') : null;
        const dialogue = player && player.dialogueBoxElement ? player.dialogueBoxElement : document.querySelector('vn-dialogue-box');
        return dialogue && typeof dialogue.isTyping === 'function' ? dialogue.isTyping() : !!dialogue && !!dialogue.isTyping;
    }

    render() {
        // eslint-disable-next-line no-console
        console.debug('ChoiceList:render', { count: this._choices.length });
        this.replaceChildren();

        const container = document.createElement("div");
        container.id = "choices";

        this.choices.forEach((choice, index) => {
            const btn = document.createElement("button");
            btn.classList.add("font-adjustable", "choice-btn");
            btn.type = "button";
            btn.textContent = choice.text;
            btn.style.setProperty("--choice-index", index);
            //btn.dataset.id = choice.id;

            const choiceId = choice.id ?? choice.nextId ?? String(index);
            btn.dataset.id = choiceId;

           btn.addEventListener("click", () => {
            if (this._selectionPending) return;

            const lastChoiceId = novelSession.getLastChoice();
            if (lastChoiceId && lastChoiceId === choiceId) {
                // prevent undo while dialogue is typing
                if (this._dialogueIsTyping()) {
                    // eslint-disable-next-line no-console
                    console.debug('ChoiceList:undoBlockedWhileTyping');
                    return;
                }

                const PopupClass = customElements.get("novel-action-popup");
                if (PopupClass && typeof PopupClass.showUndoDecision === "function") {
                    const playerParent = this.closest && this.closest("novel-player-view") ? this.closest("novel-player-view") : document.body;

                    PopupClass.showUndoDecision({
                        parent: playerParent,
                        novelId: this.getAttribute("novel-id") ?? "",
                        colorInner: this.getAttribute("color-inner") ?? ""
                    });
                }
                this._selectionPending = false;
                return;
            }

            this._selectionPending = true;

            container.querySelectorAll(".choice-btn").forEach((button) => {
                button.disabled = true;
                button.classList.add(
                button === btn
                    ? "choice-btn--selected"
                    : "choice-btn--dismissed"
                );
            });

            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            const snapshot = {
                nodeId: StateManager.getCurrentNodeId(),
                variables: StateManager.getVariablesSnapshot(),
                selectedChoices: StateManager.getSelectedChoicesSnapshot ? StateManager.getSelectedChoicesSnapshot() : [],
                history: StateManager.getHistorySnapshot ? StateManager.getHistorySnapshot() : null
            };
            novelSession.recordChoice(choiceId, snapshot);

            window.setTimeout(() => {
                this.dispatchEvent(
                new CustomEvent("choice-selected", {
                    detail: { choiceId, choice },
                    bubbles: true,
                    composed: true,
                })
                );
            }, reduceMotion ? 0 : 500);
            });

            container.appendChild(btn);
        });

        this.appendChild(container);
    }
}

customElements.define("choice-list", ChoiceList);
