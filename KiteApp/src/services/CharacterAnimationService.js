import {
  attachScenePropAnimation,
} from "./ScenePropAnimationService.js";

const EYE_IMAGES = {
  open: "./public_assets/images/_Images/Character/EyesImages/Eyes_Open.png",
  halfOpen:
    "./public_assets/images/_Images/Character/EyesImages/Eyes_Half_Open.png",
  closed:
    "./public_assets/images/_Images/Character/EyesImages/Eyes_Closed.png",
};

const SPEAKING_REACTION_CLASSES = {
  0: "character-speaking-scared",
  4: "character-speaking-amazed",
  5: "character-speaking-questioning",
  12: "character-speaking-proud",
};

const ALL_SPEAKING_REACTION_CLASSES = Object.values(
  SPEAKING_REACTION_CLASSES
);

const MIN_BLINK_DELAY = 3000;
const MAX_BLINK_DELAY = 4000;
const BLINK_FRAME_DURATION = 70;

const blinkTimeoutIds = new Set();

export function preloadBlinkAssets() {
  Object.values(EYE_IMAGES).forEach((source) => {
    const image = new Image();
    image.src = source;
  });
}

export function startBlink(characterId, getEyesElement) {
  const eyesImage = getEyesElement(characterId);

  if (!eyesImage) return;

  const delay = getRandomDelay(MIN_BLINK_DELAY, MAX_BLINK_DELAY);

  scheduleTimeout(() => {
    playBlink(characterId, getEyesElement);
  }, delay);
}

export function startCharacterSpeakingReaction(
  characterElement,
  expressionType
) {
  if (!characterElement) return;

  stopCharacterSpeakingReaction(characterElement);

  const className =
    SPEAKING_REACTION_CLASSES[Number(expressionType)];

  if (!className) return;

  void characterElement.offsetWidth;

  characterElement.classList.add(className);
}

export function stopCharacterSpeakingReaction(characterElement) {
  if (!characterElement) return;

  characterElement.classList.remove(
    ...ALL_SPEAKING_REACTION_CLASSES
  );
}

function playBlink(characterId, getEyesElement) {
  const eyesImage = getEyesElement(characterId);

  if (!eyesImage) return;

  const openEyes = eyesImage.dataset.openEyes ?? EYE_IMAGES.open;

  const frames = [
    EYE_IMAGES.halfOpen,
    EYE_IMAGES.closed,
    EYE_IMAGES.halfOpen,
    openEyes,
  ];

  frames.forEach((source, index) => {
    scheduleTimeout(() => {
      const currentEyes = getEyesElement(characterId);

      if (!currentEyes) return;

      currentEyes.src = source;

      if (index === frames.length - 1) {
        startBlink(characterId, getEyesElement);
      }
    }, index * BLINK_FRAME_DURATION);
  });
}

export function stopAllBlinkAnimations() {
  blinkTimeoutIds.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });

  blinkTimeoutIds.clear();
}

function scheduleTimeout(callback, delay) {
  const timeoutId = window.setTimeout(() => {
    blinkTimeoutIds.delete(timeoutId);
    callback();
  }, delay);

  blinkTimeoutIds.add(timeoutId);
}

function getRandomDelay(minDelay, maxDelay) {
  return minDelay + Math.random() * (maxDelay - minDelay);
}

export function getCharacterLayout(character) {
  return character?.layout && typeof character.layout === "object"
    ? character.layout
    : {};
}

export function appendAttachedProps(
  characterElement,
  props = [],
  isInteractionEnabled = () => true,
  animationCleanups = []
) {
  if (!Array.isArray(props)) return;

  props.forEach((prop, index) => {
    if (!prop?.imageUrl) return;

    const image = document.createElement("img");

    image.src = prop.imageUrl;
    image.alt = prop.alt || "Character prop";
    image.className = "vn-character-attached-prop";
    image.draggable = false;

    image.style.left = prop.left ?? "auto";
    image.style.right = prop.right ?? "auto";
    image.style.top = prop.top ?? "auto";
    image.style.bottom = prop.bottom ?? "auto";
    image.style.width = prop.width ?? "auto";
    image.style.height = prop.height ?? "auto";
    image.style.objectFit = prop.objectFit || "contain";
    image.style.objectPosition =
      prop.objectPosition || "center bottom";
    image.style.zIndex = String(prop.zIndex ?? 50 + index);

    const transforms = [];

    if (prop.translateX) {
      transforms.push(`translateX(${prop.translateX})`);
    }

    if (prop.translateY) {
      transforms.push(`translateY(${prop.translateY})`);
    }

    if (prop.rotate) {
      transforms.push(`rotate(${prop.rotate})`);
    }

    image.style.transform = transforms.length
      ? transforms.join(" ")
      : "none";

    if (prop.interactionType) {
      const cleanup = attachScenePropAnimation(
        image,
        prop,
        isInteractionEnabled
      );

      animationCleanups.push(cleanup);
    }

    characterElement.appendChild(image);
  });
}