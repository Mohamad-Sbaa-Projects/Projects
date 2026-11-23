import { repository } from "./DataRepository.js";
import { sceneAssetService } from "./SceneAssetService.js";

export class CharacterViewService {
  /**
   * Normalizes a position string to a standard value
   * @param {string} position - Position string (left, right, center, middle, centre)
   * @returns {string} Normalized position (left, right, or center)
   */
  normalizePosition(position) {
    const value = String(position ?? "").trim().toLowerCase();

    if (value === "left") {
      return "left";
    }

    if (value === "right") {
      return "right";
    }

    if (value === "middle" || value === "center" || value === "centre") {
      return "center";
    }

    return "center";
  }

  normalizeAppearanceId(value) {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
  }

  resolveCharacterAppearance(character, appearanceId) {
    if (!character || !character.appearanceVariants) {
      return null;
    }

    const normalizedAppearanceId =
      this.normalizeAppearanceId(appearanceId) ||
      this.normalizeAppearanceId(character.defaultAppearanceId);

    if (!normalizedAppearanceId) {
      return null;
    }

    return character.appearanceVariants[normalizedAppearanceId] || null;
  }

  cloneAttachedProps(props = []) {
    return Array.isArray(props) ? props.map((prop) => ({ ...prop })) : [];
  }

  applySceneCharacterConfig(characterView, sceneCharacterConfig) {
    if (!sceneCharacterConfig || typeof sceneCharacterConfig !== "object") {
      return characterView;
    }

    const mergedCharacterView = {
      ...characterView,
      ...sceneCharacterConfig,
    };

    if (sceneCharacterConfig.imageParts && typeof sceneCharacterConfig.imageParts === "object") {
      mergedCharacterView.imageParts = {
        ...(characterView.imageParts || {}),
        ...sceneCharacterConfig.imageParts,
      };
    }

    if (sceneCharacterConfig.layout && typeof sceneCharacterConfig.layout === "object") {
      mergedCharacterView.layout = {
        ...(characterView.layout || {}),
        ...sceneCharacterConfig.layout,
      };
    }

    if (sceneCharacterConfig.position != null) {
      mergedCharacterView.position = this.normalizePosition(sceneCharacterConfig.position);
    }

    if (sceneCharacterConfig.attachedProps !== undefined) {
      const overrideAttachedProps = this.cloneAttachedProps(
        sceneCharacterConfig.attachedProps
      );
      const attachedPropsMode =
        sceneCharacterConfig.attachedPropsMode === "append"
          ? "append"
          : "replace";

      mergedCharacterView.attachedProps =
        attachedPropsMode === "append"
          ? [
              ...this.cloneAttachedProps(characterView.attachedProps || []),
              ...overrideAttachedProps,
            ]
          : overrideAttachedProps;
    }

    delete mergedCharacterView.attachedPropsMode;

    return mergedCharacterView;
  }

  getNovelCharacterAppearanceId(state, event, characterId, itemOverride) {
    const overrideAppearanceId = this.normalizeAppearanceId(
      itemOverride?.appearanceId ?? itemOverride?.appearance ?? itemOverride?.lookId
    );

    if (overrideAppearanceId) {
      return overrideAppearanceId;
    }

    const sessionAppearanceId = this.normalizeAppearanceId(
      state?.characterAppearances?.[characterId]
    );

    if (sessionAppearanceId) {
      return sessionAppearanceId;
    }

    if (characterId === event.character) {
      const eventAppearanceId = this.normalizeAppearanceId(event.appearanceId);

      if (eventAppearanceId) {
        return eventAppearanceId;
      }
    }

    const perEventAppearanceId = this.normalizeAppearanceId(
      state?.novel?.characterAppearanceByEvent?.[event?.id]?.[characterId]
    );

    if (perEventAppearanceId) {
      return perEventAppearanceId;
    }

    return this.normalizeAppearanceId(
      state?.novel?.defaultCharacterAppearances?.[characterId]
    );
  }

  /**
   * Gets a character by ID from the repository
   * @param {number} characterId - Character ID
   * @returns {Object} Character object
   */
  getCharacterById(characterId) {
    return repository.getCharacter(characterId);
  }

  /**
   * Gets a character view with resolved expression and position
   * @param {number} characterId - Character ID
   * @param {string} expressionType - Expression type (e.g., "default", "happy")
   * @param {string} position - Position (left, right, center)
   * @param {number|string} appearanceId - Optional appearance override
   * @returns {Object} Character view object
   */
  getCharacterView(
    characterId,
    expressionType = "default",
    position = "center",
    appearanceId = 0
  ) {
    const character = this.getCharacterById(characterId);

    if (character.isPlayer) {
      return character;
    }

    const appearance = this.resolveCharacterAppearance(character, appearanceId);
    const imageParts = {
      ...(character.imageParts || {}),
      ...(appearance?.imageParts || {}),
    };

    const face =
      character.faces?.[expressionType] ??
      character.faces?.default ??
      null;

    const idleFace =
      typeof face === "string"
        ? face
        : face?.idle ?? null;

    const speakingFace =
      typeof face === "string"
        ? face
        : face?.speaking ?? idleFace;

    if (idleFace) {
      imageParts.face = idleFace;
    }

    const attachedPropsSource = appearance?.attachedProps ?? character.attachedProps ?? [];
    const attachedProps = Array.isArray(attachedPropsSource)
      ? attachedPropsSource.map((prop) => ({ ...prop }))
      : [];

    return {
      ...character,
      position,
      expressionType,
      imageParts,
      faceAnimation: idleFace
      ? {
          idle: idleFace,
          speaking: speakingFace,
        }
      : null,

      attachedProps,

      activeAppearanceId:
        this.normalizeAppearanceId(appearance?.id) ||
        this.normalizeAppearanceId(appearanceId) ||
        this.normalizeAppearanceId(
          character.defaultAppearanceId
        ),
    };
  }

  /**
   * Gets all visible characters for a given event
   * @param {Object} state - Game state
   * @param {Object} event - Event object
   * @returns {Array} Array of visible character views
   */
  getVisibleCharactersForEvent(state, event) {
    const visibleCharacters = [];
    const scene = sceneAssetService.getSceneForEvent(state, event);

    const visibleCharacterIds = new Set(
      Array.isArray(state.novel.defaultVisibleCharacterIds)
        ? state.novel.defaultVisibleCharacterIds
        : []
    );

    const visibleCharacterOverrides = new Map();

    if (Array.isArray(event.visibleCharacters)) {
      for (const item of event.visibleCharacters) {
        const id = Number(item.id);

        visibleCharacterIds.add(id);
        visibleCharacterOverrides.set(id, item);
      }
    }

    const nonPlayerCharacters = [];

    for (const characterId of visibleCharacterIds) {
      const character = this.getCharacterById(characterId);

      if (character.isPlayer) {
        continue;
      }

      nonPlayerCharacters.push({
        characterId,
        character,
      });
    }

    const useNovelPosition = nonPlayerCharacters.length === 1;
    const normalizedNovelPosition = this.normalizePosition(
      state.novel.characterPosition
    );

    for (const { characterId, character } of nonPlayerCharacters) {
      const itemOverride = visibleCharacterOverrides.get(characterId) || null;

      if (
        !state.characterExpressionTypes ||
        typeof state.characterExpressionTypes !== "object"
      ) {
        state.characterExpressionTypes = {};
      }

      const eventExpression =
        Number(characterId) === Number(event.character) &&
        event.expressionType != null
          ? event.expressionType
          : null;

      const overrideExpression =
        itemOverride?.expressionType != null
          ? itemOverride.expressionType
          : null;

      const rememberedExpression =
        state.characterExpressionTypes[characterId];

      const expressionType =
        eventExpression ??
        overrideExpression ??
        rememberedExpression ??
        "default";

      if (eventExpression != null || overrideExpression != null) {
        state.characterExpressionTypes[characterId] =
          expressionType;
      }

      const resolvedPosition =
        itemOverride?.position != null
          ? this.normalizePosition(itemOverride.position)
          : useNovelPosition
            ? normalizedNovelPosition
            : this.normalizePosition(character.defaultPosition);

      const appearanceId = this.getNovelCharacterAppearanceId(
        state,
        event,
        characterId,
        itemOverride
      );

      const characterView = this.getCharacterView(
        characterId,
        expressionType,
        resolvedPosition,
        appearanceId
      );

      visibleCharacters.push(
        this.applySceneCharacterConfig(
          characterView,
          scene?.sceneCharacters?.[characterId]
        )
      );
    }

    return visibleCharacters;
  }

  /**
   * Gets the speaking character for an event
   * @param {Object} event - Event object
   * @returns {Object} Character object
   */
  getSpeakerForEvent(event) {
    return this.getCharacterById(event.character);
  }
}

// Export as singleton
export const characterViewService = new CharacterViewService();
