import { applyTypingEffect } from "../services/TypingEffectService.js";
import { novelSession } from "../controllers/undo/novelSession.js";
class DialogueBox extends HTMLElement {
  connectedCallback() {
    this.className =
      "absolute bottom-1\/2 left-4 right-4 z-20 flex max-h-[375px] min-h-[220px] flex-col gap-3 text-sm";

    this.innerHTML = `
      <div class="vn-dialogue-history flex-1 overflow-y-auto pr-1"></div>
    `;

    this.historyElement = this.querySelector(".vn-dialogue-history");
    this._actionNodes = [];

    this.historyElement = this.querySelector(".vn-dialogue-history");
    this._actionNodes = [];
    this.messages = [];
    this._isTyping = false;
  }

  get isTyping() {
    return !!this._isTyping;
  }

  setSpeaker(name) {
    if (!this.speakerElement) {
      return;
    }
    this.speakerElement.textContent = name;
  }

  async addMessage(
    speaker,
    text,
    isPlayer = false,
    variant = "npc",
    eventId = null
  ) {
    if (!text || text.trim().length === 0) {
      return;
    }

    const message = {
      speaker,
      text,
      isPlayer,
      variant,
      eventId,
    };

    this.messages.push(message);

    // First, create the message without text.
    const messageBubble = this.renderMessage(message, false);

    // mark typing start
    this._isTyping = true;
    await applyTypingEffect(
      messageBubble,
      text,
      30,
      () => this.scrollToBottom()
    );

    // typing finished
    this._isTyping = false;
    this.scrollToBottom();
  }

  renderMessage(message, showText = true) {
    const messageWrapper = document.createElement("div");

    messageWrapper.className = message.isPlayer ? "chat-message mb-1 text-right" : "chat-message mb-1 text-left";

    const messageBubble = document.createElement("p");
    messageBubble.classList.add("font-adjustable", "message-text");

    if (message.isPlayer) {
      messageBubble.classList.add(
          "ml-1", "block", "w-70p", "rounded", "bg-blue-900",
          "px-4", "py-2", "text-2sm", "leading-relaxed", "text-left", "text-white"
      );
    } else if (message.variant === "intro") {
      messageBubble.classList.add(
          "block", "w-70p", "rounded", "bg-0e7f90",
          "px-4", "py-2", "text-2sm", "leading-relaxed", "text-left", "text-white"
      );
    } else {
      messageBubble.classList.add(
          "block", "w-70p", "rounded", "bg-4c4a4b",
          "px-4", "py-2", "text-2sm", "leading-relaxed", "text-left", "text-white"
      );
    }

    messageBubble.textContent = showText ? message.text : "";
    // attach data-event-id for potential undo detection
    if (message.eventId) {
      messageBubble.dataset.eventId = message.eventId;
    }

    // If this is a player message that corresponds to a choice selection, allow clicking to trigger undo
    if (message.isPlayer && message.eventId && message.eventId.includes(":choice")) {
      const handler = (evt) => {
        try {
          evt.stopPropagation();
          const eventId = messageBubble.dataset.eventId;
          if (!eventId) return;
          const parts = eventId.split(":choice:");
          const choiceId = parts.length > 1 ? parts[1] : null;
          const lastChoiceId = novelSession.getLastChoice();
          // eslint-disable-next-line no-console
          console.debug('DialogueBox:playerClick', { eventId, choiceId, lastChoiceId });
          if (choiceId && lastChoiceId && lastChoiceId === choiceId) {
            const PopupClass = customElements.get("novel-action-popup");
            if (PopupClass && typeof PopupClass.showUndoDecision === "function") {
              const playerParent = this.closest && this.closest("novel-player-view") ? this.closest("novel-player-view") : document.body;
              PopupClass.showUndoDecision({ parent: playerParent, novelId: playerParent?.getAttribute?.('novel-id') ?? '', colorInner: playerParent?.getAttribute?.('color-inner') ?? '' });
            }
          }
        } catch (e) {
          // noop
        }
      };

      // Use pointerdown capture for responsiveness
      messageBubble.addEventListener('pointerdown', handler, { capture: true });
      // store reference so clearHistory can remove if needed
      messageBubble._undoHandler = handler;
    }

    messageWrapper.appendChild(messageBubble);
    this.historyElement.appendChild(messageWrapper);
    return messageBubble;
  }

  appendActionNode(node) {
    if (!node) {
      return;
    }
    this.historyElement.appendChild(node);
    this._actionNodes.push(node);
    this.scrollToBottom();
  }

  clearActionNodes() {
    for (const node of this._actionNodes) {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    this._actionNodes = [];
  }

  clearHistory() {
    this.messages = [];
    // remove any attached undo handlers on bubbles
    const bubbles = Array.from(this.historyElement.querySelectorAll('.message-text'));
    for (const b of bubbles) {
      if (b._undoHandler) {
        b.removeEventListener('pointerdown', b._undoHandler, { capture: true });
        b._undoHandler = null;
      }
    }
    this.historyElement.innerHTML = "";
    this._actionNodes = [];
    // also reset typing flag
    this._isTyping = false;
  }

  getHistory() {
    return [   ...this.messages];
  }

  setHistory(messages = []) {
    this.clearHistory();

    if(!Array.isArray(messages)){
      return;
    }

    this.messages = [...messages];
    for (const message of this.messages) {
      this.renderMessage(message);
    }

    this.scrollToBottom();
  }

  hasMessageForEvent(eventId) {
    return this.messages.some((message) => message.eventId === eventId);
  }
  scrollToBottom() {
    this.historyElement.scrollTop = this.historyElement.scrollHeight;
  }
}

if (!customElements.get("vn-dialogue-box")) {
  customElements.define("vn-dialogue-box", DialogueBox);
}
