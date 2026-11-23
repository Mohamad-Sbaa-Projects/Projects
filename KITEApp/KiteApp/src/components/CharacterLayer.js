import {
  preloadBlinkAssets,
  startBlink,
  stopAllBlinkAnimations,
  startCharacterSpeakingReaction,
  stopCharacterSpeakingReaction,
  appendAttachedProps,
  getCharacterLayout,
} from "../services/CharacterAnimationService.js";
const CHARACTER_LAYER_ORDER = [
  "head",
  "face",
  "eyes",
  "glasses",
  "hair",
  "clothes",
  "hands",
];

const CHARACTER_LAYER_Z_INDEX = {
  head: 10,
  face: 20,
  eyes: 30,
  glasses: 40,
  hair: 50,
  clothes: 60,
  hands: 70,
};

const TWO_CHARACTER_CONFIG = {
  height: "850px",
  width: "350px",
  bottomOffset: "-25rem",
  leftOffset: "-50px",
  rightOffset: "-50px",
};

const SINGLE_CHARACTER_CONFIG = {
  height: "950px",
  width: "350px",
  bottomOffset: "-29rem",
  offset: "50px",
};
class CharacterLayer extends HTMLElement {
  constructor() {
    super();

    this.talkingIntervalId = null;
    this.talkingCharacterId = null;
    this.interactionsEnabled = false;
    this.scenePropAnimationCleanups = [];
  }

  connectedCallback() {
    this.className = "pointer-events-none absolute inset-0 z-10";
    this.dataset.interactionsEnabled = String(this.interactionsEnabled);
    preloadBlinkAssets();
  }

  setInteractionsEnabled(enabled) {
    this.interactionsEnabled = Boolean(enabled);
    this.dataset.interactionsEnabled = String(this.interactionsEnabled);
  }

  cleanupAttachedPropAnimations() {
    this.scenePropAnimationCleanups.forEach((cleanup) => cleanup());
    this.scenePropAnimationCleanups = [];
  }

  setCharacters(characters) {
    this.stopRedenAnimation();
    stopAllBlinkAnimations();
    this.cleanupAttachedPropAnimations();
    this.replaceChildren();

    const normalizedCharacters = Array.isArray(characters)
      ? characters
      : characters
        ? [characters]
        : [];

    const useTwoCharacterLayout = normalizedCharacters.length === 2;

    const charactersToRender = useTwoCharacterLayout
      ? [...normalizedCharacters].sort((left, right) => {
          const positionRank = {
            left: 0,
            center: 1,
            right: 2,
          };

          return (
            (positionRank[left?.position] ?? 1) -
            (positionRank[right?.position] ?? 1)
          );
        })
      : normalizedCharacters;

    charactersToRender.forEach((character, index) => {
      const characterElement = document.createElement("div");
      const characterId = character.id ?? character.characterId;

      const config = useTwoCharacterLayout
        ? TWO_CHARACTER_CONFIG
        : SINGLE_CHARACTER_CONFIG;

      const layout = getCharacterLayout(character);

      characterElement.className =
        "absolute transition-all duration-300";

      characterElement.dataset.characterId = String(characterId);
      characterElement.dataset.expressionType = String(
        character.expressionType ?? "default"
      );

      characterElement.style.height = layout.height ?? config.height;
      characterElement.style.width = layout.width ?? config.width;
      characterElement.style.top = layout.top ?? "auto";
      characterElement.style.bottom =
        layout.bottom ??
        (layout.top != null ? "auto" : config.bottomOffset);

      characterElement.style.left = "auto";
      characterElement.style.right = "auto";
      characterElement.style.transform = layout.transform ?? "none";

      if (layout.left != null || layout.right != null) {
        if (layout.left != null) {
          characterElement.style.left = layout.left;
        }

        if (layout.right != null) {
          characterElement.style.right = layout.right;
        }
      } else if (useTwoCharacterLayout) {
        if (index === 0) {
          characterElement.style.left = config.leftOffset;
        } else {
          characterElement.style.right = config.rightOffset;
        }
      } else if (character.position === "left") {
        characterElement.style.left = config.offset;
      } else if (character.position === "right") {
        characterElement.style.right = config.offset;
      } else {
        characterElement.style.left = "50%";
        characterElement.style.transform =
          layout.transform ?? "translateX(-50%)";
      }

      if (character.zIndex != null) {
        characterElement.style.zIndex = String(character.zIndex);
      }

      const imageParts = character?.imageParts;

      const hasLayeredParts =
        imageParts &&
        typeof imageParts === "object" &&
        !Array.isArray(imageParts);

      if (hasLayeredParts) {
        for (const layerName of CHARACTER_LAYER_ORDER) {
          const imagePath = imageParts[layerName];

          if (!imagePath) continue;

          const image = document.createElement("img");

          image.src = imagePath;
          image.alt = `${character?.name ?? "Character"} ${layerName}`;
          image.className =
            "absolute inset-0 h-full w-full object-cover object-top";
          image.draggable = false;

          image.dataset.layer = layerName;

          image.style.zIndex = String(
            CHARACTER_LAYER_Z_INDEX[layerName] ?? 0
          );

          if (layerName === "face" && character.faceAnimation) {
            image.dataset.idleFace =
              character.faceAnimation.idle ?? imagePath;

            image.dataset.speakingFace =
              character.faceAnimation.speaking ??
              character.faceAnimation.idle ??
              imagePath;
          }

          if (layerName === "eyes") {
            image.dataset.openEyes = imagePath;
          }

          characterElement.appendChild(image);
        }
      } else {
        const singleImagePath =
          character?.imagePath ||
          character?.imageUrl ||
          character?.image ||
          character?.src;

        if (singleImagePath) {
          const image = document.createElement("img");

          image.src = singleImagePath;
          image.alt = character?.name ?? "Character";
          image.className =
            "absolute inset-0 h-full w-full object-cover object-top";
          image.draggable = false;
          image.style.zIndex = "1";

          characterElement.appendChild(image);
        }
      }

      appendAttachedProps(
        characterElement,
        character?.attachedProps,
        () => this.interactionsEnabled,
        this.scenePropAnimationCleanups
      );

      if (characterElement.childElementCount === 0) return;

      this.appendChild(characterElement);

      startBlink(characterId, (id) =>
        this.getCharacterPart(id, "eyes")
      );
    });
  }

  getCharacterPart(characterId, layerName) {
    return this.querySelector(
      `[data-character-id="${characterId}"] [data-layer="${layerName}"]`
    );
  }

  getCharacterElement(characterId) {
    return this.querySelector(
      `[data-character-id="${characterId}"]`
    );
  }

  redenAnimation(characterId) {
    this.stopRedenAnimation();

    const characterElement =
      this.getCharacterElement(characterId);

    const face =
      this.getCharacterPart(characterId, "face");

    if (!characterElement || !face?.dataset.speakingFace) {
      return () => {};
    }

    this.talkingCharacterId = characterId;

    startCharacterSpeakingReaction(
      characterElement,
      characterElement.dataset.expressionType
    );

    let speaking = false;

    this.talkingIntervalId = window.setInterval(() => {
      const currentFace =
        this.getCharacterPart(characterId, "face");

      if (!currentFace) {
        this.stopRedenAnimation();
        return;
      }

      speaking = !speaking;

      currentFace.src = speaking
        ? currentFace.dataset.speakingFace
        : currentFace.dataset.idleFace;
    }, 300);

    return () => this.stopRedenAnimation();
  }

  stopRedenAnimation() {
    if (this.talkingIntervalId !== null) {
      window.clearInterval(this.talkingIntervalId);
      this.talkingIntervalId = null;
    }

    if (this.talkingCharacterId !== null) {
      const characterElement =
        this.getCharacterElement(this.talkingCharacterId);

      const face =
        this.getCharacterPart(this.talkingCharacterId, "face");

      if (face?.dataset.idleFace) {
        face.src = face.dataset.idleFace;
      }

      stopCharacterSpeakingReaction(characterElement);
    }

    this.talkingCharacterId = null;
  }

  disconnectedCallback() {
    this.stopRedenAnimation();
    stopAllBlinkAnimations();
    this.cleanupAttachedPropAnimations();
  }
}

if (!customElements.get("character-layer")) {
  customElements.define("character-layer", CharacterLayer);
}
