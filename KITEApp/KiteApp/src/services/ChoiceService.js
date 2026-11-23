import { EVENT_TYPES } from "./DataRepository.js";
import { characterViewService } from "./CharacterViewService.js";

export const ChoiceService = {
  /**
   * Checks if an event is a "playable" event (Dialogue, Choice, or Final).
   * Non-playable events (like CHARACTER_JOIN) should be skipped during resolution.
   * 
   * @param {Object} event - The event to check.
   * @returns {boolean} True if playable.
   */
  isPlayableEvent(event) {
    if (!event) return false;

    return (
      event.eventType === EVENT_TYPES.DIALOGUE ||
      event.eventType === EVENT_TYPES.CHOICE ||
      event.eventType === EVENT_TYPES.FINAL
    );
  },

  /**
   * Recursively follows the 'nextId' chain until a playable event is found.
   * This ensures the UI doesn't have to deal with technical/hidden events.
   * 
   * @param {Object} novel - The current novel object.
   * @param {string} eventId - The ID to start resolving from.
   * @param {Set} visitedIds - To prevent infinite loops.
   * @returns {string|null} The ID of the first playable event found.
   */
  resolvePlayableEventId(novel, eventId, visitedIds = new Set()) {
    if (!eventId || visitedIds.has(eventId)) return null;
    visitedIds.add(eventId);

    const event = novel.events.find(e => e.id === eventId);
    if (!event) return null;

    if (this.isPlayableEvent(event)) {
      return event.id;
    }

    return this.resolvePlayableEventId(novel, event.nextId, visitedIds);
  },

  /**
   * Groups sequential CHOICE events into a single list of choices.
   * Resolves each choice's target to a playable event immediately.
   * 
   * @param {Object} novel - The current novel object.
   * @param {Object} firstChoiceEvent - The first choice event in a sequence.
   * @returns {Array} List of choice objects { text, nextId }.
   */
  getChoices(novel, firstChoiceEvent) {
    const choices = [];
    const visitedIds = new Set();
    let currentEvent = firstChoiceEvent;

    // Follow the chain of CHOICE events
    while (
      currentEvent &&
      currentEvent.eventType === EVENT_TYPES.CHOICE &&
      !visitedIds.has(currentEvent.id)
    ) {
      visitedIds.add(currentEvent.id);

      choices.push({
        text: currentEvent.text,
        // The 'onChoice' property tells us where this specific path leads.
        // We resolve it to a playable event so the UI gets a direct target.
        nextId: this.resolvePlayableEventId(novel, currentEvent.onChoice),
      });

      // Move to the next CHOICE event in the chain (linked via 'nextId')
      currentEvent = novel.events.find(e => e.id === currentEvent.nextId);
    }

    return choices;
  },

  /**
   * Resolves a selected choice event to its target playable event ID.
   * @param {Object} novel - The current novel object.
   * @param {Object} choiceEvent - The specific choice event that was clicked.
   * @returns {string|null} The ID of the playable event to jump to.
   */
  resolveChoice(novel, choiceEvent) {
    if (!choiceEvent || !choiceEvent.onChoice) {
      console.warn("ChoiceService: Attempted to resolve an invalid choice event.", choiceEvent);
      return null;
    }

    return this.resolvePlayableEventId(novel, choiceEvent.onChoice);
  }
};

export function getStartEventId(novel) {
  return ChoiceService.resolvePlayableEventId(novel, novel.startEventId);
}

export function startFreshNovelState(state) {
  state.selectedChoices = [];
  state.flags = {};
  state.restoredCurrentEventId = null;
  state.currentEventId = getStartEventId(state.novel);

  return state;
}

export function getNextPlayableEventId(state, event) {
  return ChoiceService.resolvePlayableEventId(state.novel, event.nextId);
}

export function getChoicesForEvent(state, event) {
  return ChoiceService.getChoices(state.novel, event);
}

export function selectChoiceInState(state, event, choice) {
  state.selectedChoices.push({
    eventId: event.id,
    choiceText: choice.text,
    nextEventId: choice.nextId,
    selectedAt: new Date().toISOString(),
  });

  state.currentEventId = choice.nextId;
}

export function getMessageVariant(state, event, speaker) {
  if (event.id === "Anfang") {
    return "intro";
  }

  if (String(state.novelId) === "einstieg" && !speaker.isPlayer) {
    return "intro";
  }

  return speaker.isPlayer ? "player" : "npc";
}

export function getDialogueData(state, event) {
  const speaker = characterViewService.getSpeakerForEvent(event);

  return {
    speaker,
    messageVariant: getMessageVariant(state, event, speaker),
    nextEventId: getNextPlayableEventId(state, event),
  };
}

export function wasRestoredEvent(state, eventId) {
  return state.restoredCurrentEventId === eventId;
}

export function clearRestoredEvent(state) {
  state.restoredCurrentEventId = null;
}

export function isDialogueEvent(event) {
  return event.eventType === EVENT_TYPES.DIALOGUE;
}

export function isChoiceEvent(event) {
  return event.eventType === EVENT_TYPES.CHOICE;
}

export function isFinalEvent(event) {
  return event.eventType === EVENT_TYPES.FINAL;
}
