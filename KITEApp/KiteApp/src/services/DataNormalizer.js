import { getNovelSettingsByNumericId } from "../data/novelIndex.js";

function normalizeBackgroundId(value) {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();

  return normalizedValue || "";
}

function getEventBackgroundId(rawEvent) {
  const directValue =
    rawEvent.backgroundId || rawEvent.background || rawEvent.bgId || rawEvent.bg;

  if (directValue) {
    return normalizeBackgroundId(directValue);
  }

  if (
    String(rawEvent.key ?? "")
      .trim()
      .toLowerCase() === "backgroundid"
  ) {
    return normalizeBackgroundId(rawEvent.value);
  }

  return "";
}

function getEventBackgroundVariant(rawEvent) {
  const directValue =
    rawEvent.backgroundVariant ||
    rawEvent.backgroundState ||
    rawEvent.bgVariant ||
    rawEvent.bgState;

  if (directValue) {
    return String(directValue).trim();
  }

  if (
    String(rawEvent.key ?? "")
      .trim()
      .toLowerCase() === "backgroundvariant"
  ) {
    return String(rawEvent.value ?? "").trim();
  }

  return "";
}

function normalizeAppearanceId(value) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function getEventAppearanceId(rawEvent) {
  const directAppearanceId = normalizeAppearanceId(
    rawEvent.appearanceId || rawEvent.characterAppearanceId || rawEvent.lookId
  );

  if (directAppearanceId) {
    return directAppearanceId;
  }

  const spriteAppearanceId = [
    rawEvent.clotheSpriteId,
    rawEvent.hairSpriteId,
    rawEvent.skinSpriteId,
    rawEvent.faceSpriteId,
  ]
    .map((value) => normalizeAppearanceId(value))
    .find(Boolean);

  return spriteAppearanceId || 0;
}

function normalizeVisibleCharacter(rawCharacter) {
  if (!rawCharacter || typeof rawCharacter !== "object") {
    return null;
  }

  const id = Number(
    rawCharacter.id ?? rawCharacter.characterId ?? rawCharacter.character
  );

  if (!Number.isFinite(id)) {
    return null;
  }

  return {
    ...rawCharacter,
    id,
    position: rawCharacter.position ?? rawCharacter.characterPosition ?? null,
    expressionType: rawCharacter.expressionType ?? null,
    appearanceId: getEventAppearanceId(rawCharacter),
  };
}

export class DataNormalizer {
  normalizeNovel(rawNovel) {
    const settings = getNovelSettingsByNumericId(rawNovel.id) || {
      id: rawNovel.id,
      backgroundId: "einstieg",
      showInSelection: true,
      defaultVisibleCharacterIds: [2],
      characterPosition: "center",
      defaultCharacterAppearances: {},
    };

    const rawEvents = Array.isArray(rawNovel.novelEvents)
      ? rawNovel.novelEvents
      : [];

    return {
      id: settings.id || rawNovel.id,
      numericId: Number.isFinite(Number(settings.numericId ?? rawNovel.id))
        ? Number(settings.numericId ?? rawNovel.id)
        : null,
      title: rawNovel.title,
      novelColor: rawNovel.novelColor || "#111827",
      novelFrameColor: rawNovel.novelFrameColor || "#111827",
      description: rawNovel.description || "",
      feedback: rawNovel.feedback || "",
      context: rawNovel.context || "",

      backgroundId: settings.backgroundId,
      showInSelection: settings.showInSelection,
      startEventId: rawEvents[0]?.id || null,
      defaultVisibleCharacterIds: settings.defaultVisibleCharacterIds,
      defaultCharacterAppearances: settings.defaultCharacterAppearances || {},
      characterAppearanceByEvent: settings.characterAppearanceByEvent || {},
      characterPosition: settings.characterPosition || "center",
      props: Array.isArray(rawNovel.props) ? rawNovel.props : [],

      characters: rawNovel.characters || [],
      playedPath: rawNovel.playedPath || [],
      isKiteNovel: rawNovel.isKiteNovel || false,

      events: rawEvents.map((event) => this.normalizeEvent(event)),
    };
  }

  normalizeEvent(rawEvent) {
    return {
      id: rawEvent.id,
      nextId: rawEvent.nextId || "",
      onChoice: rawEvent.onChoice || "",
      eventType: rawEvent.eventType,
      waitForUserConfirmation: rawEvent.waitForUserConfirmation,
      character: rawEvent.character,
      text: rawEvent.text || "",
      expressionType: rawEvent.expressionType || 0,
      backgroundId: getEventBackgroundId(rawEvent),
      backgroundVariant: getEventBackgroundVariant(rawEvent),
      appearanceId: getEventAppearanceId(rawEvent),
      visibleCharacters: Array.isArray(rawEvent.visibleCharacters)
        ? rawEvent.visibleCharacters
            .map((character) => normalizeVisibleCharacter(character))
            .filter(Boolean)
        : [],

      skinSpriteId: rawEvent.skinSpriteId || 0,
      clotheSpriteId: rawEvent.clotheSpriteId || 0,
      hairSpriteId: rawEvent.hairSpriteId || 0,
      faceSpriteId: rawEvent.faceSpriteId || 0,

      xPosition: rawEvent.xPosition || 0,
      yPosition: rawEvent.yPosition || 0,

      animationType: rawEvent.animationType || 0,
      animationToPlay: rawEvent.animationToPlay || "",
      audioClipToPlay: rawEvent.audioClipToPlay || "",

      show: rawEvent.show !== false,

      opinionChoiceNumber: rawEvent.opinionChoiceNumber || 0,
      questionForFreeTextInput: rawEvent.questionForFreeTextInput || "",

      variablesName: rawEvent.variablesName || "",
      gptPrompt: rawEvent.gptPrompt || "",
      variablesNameForGptPrompt: rawEvent.variablesNameForGptPrompt || "",
      gptCompletionHandler: rawEvent.gptCompletionHandler || "",

      key: rawEvent.key || "",
      value: rawEvent.value || "",
      relevantBias: rawEvent.relevantBias || "",
    };
  }
}
