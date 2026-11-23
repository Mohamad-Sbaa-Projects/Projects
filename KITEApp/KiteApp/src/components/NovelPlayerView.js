import { setupUndoListeners } from "../controllers/undo/undoController.js";
import { StateManager } from "../services/StateManager.js";
import {
  createNovelPlayerState,
  loadNovelIntoState,
  initializeCharacterAppearances,
  getCurrentEvent,
  getSceneForEvent,
  moveToEvent,
  getVisibleCharactersForEvent,
  getPlayerCharacter,
} from "../services/DataRepository.js";

import {
  startFreshNovelState,
  getDialogueData,
  getChoicesForEvent,
  selectChoiceInState,
  getNextPlayableEventId,
  wasRestoredEvent,
  clearRestoredEvent,
  isDialogueEvent,
  isChoiceEvent,
  isFinalEvent,
} from "../services/ChoiceService.js";

import {
  getSavedProgressForState,
  applySavedProgressToState,
  saveNovelProgress,
  resetNovelProgress,
  finishNovelProgress,
  getIntroNovelSessionProgress,
  saveIntroNovelSessionProgress,
  clearIntroNovelSessionProgress,
} from "../services/StorageService.js";

import "./Background.js";
import "./PropsLayer.js";
import "./CharacterLayer.js";
import "./DialogueBox.js";
import "./NovelActionPopup.js";
import "./ChoiceList.js";

import { speak, stopSpeech, playSfx } from "../services/SettingsService.js";

const PARENTS_LAMP_IMAGES = {
  off:
    "./public_assets/images/_Images/EventAnimations/Lamp/BG parents_light off.png",
  on:
    "./public_assets/images/_Images/EventAnimations/Lamp/BG parents_light on.png",
};

class NovelPlayerView extends HTMLElement {
  constructor() {
    super();

    this.state = null;
    this.finishTimeoutId = null;
    this.resumePopup = null;
    this.leavePopup = null;
    this.initialProgress = null;
    this.isAborted = false;

    this.backgroundElement = null;
    this.backPropsLayerElement = null;
    this.characterLayerElement = null;
    this.frontPropsLayerElement = null;
    this.dialogueBoxElement = null;
    this.actionsElement = null;

    this._onBackSelected = this._onBackSelected.bind(this);
    this._onScenePropActivated =
      this._onScenePropActivated.bind(this);
  }

  static get observedAttributes() {
    return ["novel-id"];
  }

  get rawNovelId() {
    return this.getAttribute("novel-id");
  }

  get isIntroNovel() {
    return String(this.rawNovelId) === "einstieg";
  }

  get novelViewModifierClass() {
    const novelId = String(this.rawNovelId ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

    return novelId ? `novel-player-view--${novelId}` : "";
  }

  connectedCallback() {
    setupUndoListeners();
    this.renderLayout();
    this.startNovel();
    this.addEventListener("app-back-selected", this._onBackSelected);
    this.addEventListener(
      "scene-prop-activated",
      this._onScenePropActivated
    );
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.renderLayout();
      this.startNovel();
    }
  }

  disconnectedCallback() {
    stopSpeech();
    this.saveIntroSessionProgressIfNeeded();
    this.clearFinishTimeout();
    this.closeResumePopup();
    this.closeLeavePopup();
    this.removeEventListener("app-back-selected", this._onBackSelected);
    this.removeEventListener(
      "scene-prop-activated",
      this._onScenePropActivated
    );
  }
  renderLayout() {
    this.className = [
      "novel-player-view",
      "relative block h-full w-full overflow-hidden",
      this.novelViewModifierClass,
      this.isIntroNovel ? "novel-player-view--intro" : "",
    ]
      .filter(Boolean)
      .join(" ");

    this.replaceChildren();


    const background = document.createElement("vn-background");

    const backPropsLayer = document.createElement("vn-props-layer");
    backPropsLayer.setAttribute("layer", "back");

    const characterLayer = document.createElement("character-layer");

    const frontPropsLayer = document.createElement("vn-props-layer");
    frontPropsLayer.setAttribute("layer", "front");

    const dialogueBox = document.createElement("vn-dialogue-box");

    const actions = document.createElement("div");
    actions.className = "novel-actions absolute bottom-12 left-4 right-4 z-30 flex flex-col gap-2";

    this.append(
      background,
      backPropsLayer,
      characterLayer,
      frontPropsLayer,
      dialogueBox,
      actions
    );

    if (this.isIntroNovel) {
      const introFooter = document.createElement("footer");
      introFooter.className = "intro-novel-footer";
      introFooter.setAttribute("aria-hidden", "true");
      this.appendChild(introFooter);
    }

    this.backgroundElement = background;
    this.backPropsLayerElement = backPropsLayer;
    this.characterLayerElement = characterLayer;
    this.frontPropsLayerElement = frontPropsLayer;
    this.dialogueBoxElement = dialogueBox;
    this.actionsElement = actions;
  }

  startNovel() {
    try {
      this.state = createNovelPlayerState(this.rawNovelId);

      const { scene } = loadNovelIntoState(this.state);
      const savedProgress = this.isIntroNovel
        ? getIntroNovelSessionProgress()
        : getSavedProgressForState(this.state);

      this.initialProgress = savedProgress ? JSON.parse(JSON.stringify(savedProgress)) : null;
      this.isAborted = false;
      if (this.backgroundElement) {
        this.backgroundElement.setBackground(scene.background);
      }

      if (this.backPropsLayerElement) {
        this.backPropsLayerElement.setProps(scene.backProps);
      }

      if (this.frontPropsLayerElement) {
        this.frontPropsLayerElement.setProps(scene.frontProps);
      }

      if (savedProgress) {
        const chatHistory = applySavedProgressToState(this.state, savedProgress);
        initializeCharacterAppearances(this.state, { randomize: false });

        this.dialogueBoxElement.clearHistory();
        this.dialogueBoxElement.setHistory(chatHistory);

        this.renderCurrentCharacters();

        if (this.isIntroNovel) {
          this.renderCurrentEvent();
          return;
        }

        this.showResumePopup();
        return;
      }
      initializeCharacterAppearances(this.state, { randomize: true });
      this.startFreshNovel();
    } catch (error) {
      this.showError(error.message);
    }
  }

  startFreshNovel() {
    this.dialogueBoxElement.clearHistory();
    if (String(this.rawNovelId) === "notarin") {
      playSfx("public_assets/_AudioResources/TelephoneCall.wav");
    }
    startFreshNovelState(this.state);
    this.renderCurrentEvent();
  }

  renderCurrentCharacters() {
    const event = getCurrentEvent(this.state);

    if (!event) {
      return;
    }

    this.updateSceneForEvent(event);

    const visibleCharacters = getVisibleCharactersForEvent(this.state, event);
    this.characterLayerElement.setCharacters(visibleCharacters);
  }

  renderCurrentEvent() {
    const event = getCurrentEvent(this.state);

    if (!event) {
      this.finishNovel();
      return;
    }

    this.setSceneInteractionsEnabled(false);
    this.updateSceneForEvent(event);

    const visibleCharacters = getVisibleCharactersForEvent(this.state, event);
    this.characterLayerElement.setCharacters(visibleCharacters);

    if (isDialogueEvent(event)) {
      this.renderDialogueEvent(event);
      return;
    }

    if (isChoiceEvent(event)) {
      playSfx('public_assets/_AudioResources/SFX_SelectionLoad.wav');
      this.renderChoiceEvent(event);
      return;
    }

    if (isFinalEvent(event)) {
      this.finishNovel();
      return;
    }

    const nextPlayableEventId = getNextPlayableEventId(this.state, event);

    if (!nextPlayableEventId) {
      this.finishNovel();
      return;
    }

    moveToEvent(this.state, nextPlayableEventId);
    this.renderCurrentEvent();
  }

  updateSceneForEvent(event) {
    const scene = getSceneForEvent(this.state, event);
    if (this.backgroundElement) {
      this.backgroundElement.setBackground(scene.background);
      this.applySceneInteractionStates();
    }

    if (this.backPropsLayerElement) {
      this.backPropsLayerElement.setProps(scene.backProps);
    }

    if (this.frontPropsLayerElement) {
      this.frontPropsLayerElement.setProps(scene.frontProps);
    }
  }

  async renderDialogueEvent(event) {
    playSfx('public_assets/_AudioResources/SFX_Textpopup_1.wav');
    
    const { speaker, messageVariant, nextEventId } = getDialogueData(
      this.state,
      event
    );

    this.dialogueBoxElement.setSpeaker(speaker.name);

    const hasMessageForEvent = this.dialogueBoxElement.hasMessageForEvent(
      event.id
    );

    const eventWasRestored =
      wasRestoredEvent(this.state, event.id) && hasMessageForEvent;

    if (!eventWasRestored) {
      const shouldTalk =
        !speaker.isPlayer &&
        Number(event.character) > 1;

      const stopTalking = shouldTalk
        ? this.characterLayerElement.redenAnimation(
          event.character
        )
        : () => { };

      try {
        await this.dialogueBoxElement.addMessage(
          speaker.name,
          event.text,
          speaker.isPlayer,
          messageVariant,
          event.id
        );
      } finally {
        stopTalking();
      }

      await speak(event.text);
      this.saveCurrentProgress();
    }

    clearRestoredEvent(this.state);
    this.clearActions();

    if (!nextEventId) {
      this.finishNovel();
      return;
    }

    moveToEvent(this.state, nextEventId);
    this.renderCurrentEvent();
  }

  async renderChoiceEvent(event) {
    const choices = getChoicesForEvent(this.state, event);

    // eslint-disable-next-line no-console
    console.debug('NovelPlayerView:renderChoiceEvent', { eventId: event?.id, choicesCount: Array.isArray(choices) ? choices.length : 0 });

    this.dialogueBoxElement.setSpeaker("Du");
    this.clearActions();
    this.saveCurrentProgress();

    const renderChoices = () => {
      const choiceList = document.createElement("choice-list");
      choiceList.choices = choices;
    choiceList.setAttribute("novel-id", String(this.state.novelId));
    choiceList.setAttribute("color-inner", this.state?.novel?.novelColor ?? "");

      choiceList.addEventListener("choice-selected", (choiceEvent) => {
        playSfx('public_assets/_AudioResources/SFX_SelectionDescision.wav');
        this.handleChoiceSelected(event, choiceEvent.detail.choice, choiceEvent.detail.choiceId);
      });

      if (typeof this.dialogueBoxElement.appendActionNode === "function") {
        this.dialogueBoxElement.appendActionNode(choiceList);
      } else {
        this.actionsElement.appendChild(choiceList);
      }
    this.setSceneInteractionsEnabled(true);
    }; 
    renderChoices();
    await speak("Folgende Antwortmöglichkeiten stehen dir zur Auswahl");
    const choiceText = choices.map((choice, index) => `${index + 1}. Option: ${choice.text}`).join(". ");
    await speak(choiceText);
  }

  async handleChoiceSelected(event, choice) {
    const choiceId = arguments.length > 2 ? arguments[2] : undefined;
    this.setSceneInteractionsEnabled(false);
    const player = getPlayerCharacter();
    this.clearActions();
    // include the choiceId in the eventId so the DialogueBox can attach undo handlers
    const messageEventId = choiceId ? `${event.id}:choice:${choiceId}` : `${event.id}:choice`;
    await this.dialogueBoxElement.addMessage(
      player.name,
      choice.text,
      true,
      "player",
      messageEventId
    );

    selectChoiceInState(this.state, event, choice);
    this.clearActions();

    if (!choice.nextId) {
      this.finishNovel();
      return;
    }

    this.saveCurrentProgress();
    this.renderCurrentEvent();
  }

  saveCurrentProgress() {
    if (this.isIntroNovel) {
      this.saveIntroSessionProgress();
      return;
    }

    saveNovelProgress(this.state, this.dialogueBoxElement.getHistory());
  }

  finishNovel() {
    if (this.isIntroNovel) {
      this.clearIntroSessionProgress();
    }

    finishNovelProgress(this.state);
    this.showEnd();
  }

  showEnd() {
    this.dialogueBoxElement.setSpeaker("System");
    this.clearActions();
    this.clearFinishTimeout();

    this.finishTimeoutId = setTimeout(() => {
      this.dispatchNovelFinished();
      this.finishTimeoutId = null;
    }, 2000);
  }

  showError(message) {
    if (!this.dialogueBoxElement) {
      return;
    }

    this.dialogueBoxElement.setSpeaker("Fehler");
    this.dialogueBoxElement.addMessage("Fehler", message, false, "npc");
    this.clearActions();
    this.clearFinishTimeout();

    this.finishTimeoutId = setTimeout(() => {
      this.dispatchNovelFinished();
      this.finishTimeoutId = null;
    }, 2000);
  }

  dispatchNovelFinished() {
    this.dispatchEvent(
      new CustomEvent("novel-finished", {
        bubbles: true,
        detail: {
          novelId: this.state?.novelId,
        },
      })
    );
  }

  clearActions() {
    this.actionsElement.innerHTML = "";

    if (
      this.dialogueBoxElement &&
      typeof this.dialogueBoxElement.clearActionNodes === "function"
    ) {
      this.dialogueBoxElement.clearActionNodes();
    }
  }

  showResumePopup() {
    const PopupClass = customElements.get("novel-action-popup");

    if (!PopupClass || typeof PopupClass.showResume !== "function") {
      this.renderCurrentEvent();
      return;
    }

    const popup = PopupClass.showResume({
      parent: this,
      novelId: this.state.novelId,
      novelTitle: this.state.novel.title,
      colorInner: this.state.novel.novelColor,
      colorOuter: this.state.novel.novelFrameColor,
    });

    popup.addEventListener("novel-continue-selected", () => {
      this.closeResumePopup();
      this.renderCurrentEvent();
    });

    popup.addEventListener("novel-restart-selected", () => {
      resetNovelProgress(this.state);
      this.closeResumePopup();
      this.startFreshNovel();
    });

    popup.addEventListener("popup-closed", () => {
      this.closeResumePopup();
    });

    this.resumePopup = popup;
  }

  closeResumePopup() {
    if (!this.resumePopup) {
      return;
    }

    this.resumePopup.remove();
    this.resumePopup = null;
  }

  _onBackSelected(event) {
    event.preventDefault();
    event.stopPropagation();
    this.showLeavePopup();
  }

  showLeavePopup() {
    this.closeLeavePopup();

    const PopupClass = customElements.get("novel-action-popup");
    if (!PopupClass || typeof PopupClass.showLeaveConfirmation !== "function") {
      this.dispatchEvent(
        new CustomEvent("app-navigate", {
          bubbles: true,
          composed: true,
          detail: { path: "/auswahl" },
        })
      );
      return;
    }

    const popup = PopupClass.showLeaveConfirmation({
      parent: this,
      novelId: this.state?.novelId,
      colorInner: this.state?.novel?.novelColor,
      colorOuter: this.state?.novel?.novelFrameColor,
    });

    popup.addEventListener("novel-leave-continue", () => {
      this.closeLeavePopup();
    });

    popup.addEventListener("novel-leave-pause", () => {
      this.saveCurrentProgress();
      this.closeLeavePopup();
      this.dispatchEvent(
        new CustomEvent("app-navigate", {
          bubbles: true,
          composed: true,
          detail: { path: "/auswahl" },
        })
      );
    });

    popup.addEventListener("novel-leave-cancel", () => {
      this.isAborted = true;
      if (this.isIntroNovel) {
        this.clearIntroSessionProgress();
      } else {
        resetNovelProgress(this.state);
      }

      this.closeLeavePopup();
      this.dispatchEvent(
        new CustomEvent("app-navigate", {
          bubbles: true,
          composed: true,
          detail: { path: "/auswahl" },
        })
      );
    });

    popup.addEventListener("novel-leave-finish", () => {
      this.isAborted = true;
      this.closeLeavePopup();
      this.finishNovel();
    });

    popup.addEventListener("popup-closed", () => {
      this.closeLeavePopup();
    });

    this.leavePopup = popup;
  }

  closeLeavePopup() {
    if (!this.leavePopup) {
      return;
    }

    this.leavePopup.remove();
    this.leavePopup = null;
  }

  clearFinishTimeout() {
    if (!this.finishTimeoutId) {
      return;
    }

    clearTimeout(this.finishTimeoutId);
    this.finishTimeoutId = null;
  }

  saveIntroSessionProgressIfNeeded() {
    if (this.isAborted) {
      return;
    }
    if (!this.isIntroNovel || !this.state || !this.dialogueBoxElement) {
      return;
    }

    this.saveIntroSessionProgress();
  }

  saveIntroSessionProgress() {
    if (!this.state || !this.dialogueBoxElement) {
      return;
    }

    saveIntroNovelSessionProgress({
      novelId: this.state.novelId,
      currentEventId: this.state.currentEventId,
      chatHistory: this.dialogueBoxElement.getHistory(),

      selectedChoices: Array.isArray(
        this.state.selectedChoices
      )
        ? this.state.selectedChoices
        : [],

      flags: this.state.flags ?? {},

      visibleCharacterIds:
        this.state.visibleCharacterIds instanceof Set
          ? Array.from(this.state.visibleCharacterIds)
          : [],

      characterExpressionTypes:
        this.state.characterExpressionTypes &&
          typeof this.state.characterExpressionTypes === "object"
          ? { ...this.state.characterExpressionTypes }
          : {},

      characterAppearances:
        this.state.characterAppearances &&
          typeof this.state.characterAppearances === "object"
          ? { ...this.state.characterAppearances }
          : {},
    });
  }

  setSceneInteractionsEnabled(enabled) {
    this.backPropsLayerElement?.setInteractionsEnabled(
      enabled
    );

    this.frontPropsLayerElement?.setInteractionsEnabled(
      enabled
    );

    this.characterLayerElement?.setInteractionsEnabled(
      enabled
    );
  }

  _onScenePropActivated(event) {
    if (
      event.detail?.interactionType !== "lamp" ||
      !this.state
    ) {
      return;
    }

    if (
      !this.state.sceneInteractionStates ||
      typeof this.state.sceneInteractionStates !== "object"
    ) {
      this.state.sceneInteractionStates = {};
    }

    const nextLampState = !this.state.sceneInteractionStates.lampOn;

    playSfx(
      nextLampState
        ? "public_assets/_AudioResources/LightSwitch_on.wav"
        : "public_assets/_AudioResources/LightSwitch_off.wav"
    );

    this.state.sceneInteractionStates.lampOn = nextLampState;

    this.applySceneInteractionStates();
    this.saveCurrentProgress();
  }

  applySceneInteractionStates() {
    if (
      String(this.state?.novel?.backgroundId) !==
      "eltern"
    ) {
      return;
    }

    const lampOn = Boolean(
      this.state?.sceneInteractionStates?.lampOn
    );

    if (this.backgroundElement?.imageElement) {
      this.backgroundElement.imageElement.src =
        lampOn
          ? PARENTS_LAMP_IMAGES.on
          : PARENTS_LAMP_IMAGES.off;
    }
  }

  clearIntroSessionProgress() {
    clearIntroNovelSessionProgress();
  }

  renderFromState() {
    // Re-sync UI from the current state object after undo restore
    if (!this.state) return;

    // Update background
    try {
      const { background } = loadNovelIntoState(this.state);
      if (this.backgroundElement && typeof this.backgroundElement.setBackground === "function") {
        this.backgroundElement.setBackground(background.imageUrl);
      }
    } catch (err) {
      // ignore if novel not loaded
    }

    // Restore dialogue history if present in state (StateManager.restoreSnapshot sets it)
    if (this.dialogueBoxElement && typeof this.dialogueBoxElement.setHistory === "function") {
      // If the StateManager.restoreSnapshot has already set history directly on the dialogueBoxElement,
      // we should not clear it here (that would remove restored messages). Only replace history when
      // the restored history was stored on the state object as `savedHistory`.
      if (this.state && this.state.savedHistory) {
        this.dialogueBoxElement.clearHistory();
        this.dialogueBoxElement.setHistory(this.state.savedHistory);
      }
    }

    // Re-render characters and current event
    this.renderCurrentCharacters();
    this.renderCurrentEvent();
  }

}

if (!customElements.get("novel-player-view")) {
  customElements.define("novel-player-view", NovelPlayerView);
}