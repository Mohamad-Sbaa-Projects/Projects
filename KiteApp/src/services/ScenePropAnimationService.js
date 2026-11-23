import { playSfx } from "./SettingsService.js";

const BASE =
  "./public_assets/images/_Images/EventAnimations";

const PROP_FRAMES = {
  glass: [
    `${BASE}/Glass/Glass_7still@4x.png`,
    `${BASE}/Glass/Glass_6b@4x.png`,
    `${BASE}/Glass/Glass_1b@4x.png`,
    `${BASE}/Glass/Glass_2b@4x.png`,
    `${BASE}/Glass/Glass_3b@4x.png`,
    `${BASE}/Glass/Glass_4b@4x.png`,
    `${BASE}/Glass/Glass_5b@4x.png`,
  ],

  mugGreen: [
    `${BASE}/Mug_G/Mug_G1.png`,
    `${BASE}/Mug_G/Mug_G2.png`,
    `${BASE}/Mug_G/Mug_G3.png`,
    `${BASE}/Mug_G/Mug_G4.png`,
  ],

  mugViolet: [
    `${BASE}/Mug_V/Mug_V1.png`,
    `${BASE}/Mug_V/Mug_V2.png`,
    `${BASE}/Mug_V/Mug_V3.png`,
    `${BASE}/Mug_V/Mug_V4.png`,
  ],

  plant: [
    `${BASE}/Plant/Plant_1@4x.png`,
    `${BASE}/Plant/Plant_2@4x.png`,
    `${BASE}/Plant/Plant_3@4x.png`,
  ],

  vase: [
    `${BASE}/Vase/Vase_1@4x.png`,
    `${BASE}/Vase/Vase_2@4x.png`,
    `${BASE}/Vase/Vase_3@4x.png`,
  ],

  jug: [
    `${BASE}/Jug/Jug_1.png`,
    `${BASE}/Jug/Jug_2.png`,
    `${BASE}/Jug/Jug_3.png`,
    `${BASE}/Jug/Jug_4.png`,
  ],
};

const PROP_SOUNDS = {
  glass: "public_assets/_AudioResources/WaterGlass.wav",
  mugGreen: "public_assets/_AudioResources/BoilingWater.wav",
  mugViolet: "public_assets/_AudioResources/BoilingWater.wav",
  plant: "public_assets/_AudioResources/PlantSound.wav",
  vase: "public_assets/_AudioResources/VaseSound.wav",
  jug: "public_assets/_AudioResources/BoilingWater.wav",
};

const runningElements = new WeakSet();

const preloadedFrames = new Map();

function preloadFrame(source) {
  if (preloadedFrames.has(source)) {
    return preloadedFrames.get(source);
  }

  const promise = new Promise((resolve) => {
    const image = new Image();

    image.addEventListener(
      "load",
      async () => {
        try {
          await image.decode();
        } catch {
          
        }

        resolve();
      },
      { once: true }
    );

    image.addEventListener("error", resolve, {
      once: true,
    });

    image.src = source;
  });

  preloadedFrames.set(source, promise);

  return promise;
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export function preloadScenePropAssets() {
  return Promise.all(
    Object.values(PROP_FRAMES)
      .flat()
      .map(preloadFrame)
  );
}

export async function playScenePropAnimation(element, interactionType) {
  const frames = PROP_FRAMES[interactionType];
  const sound = PROP_SOUNDS[interactionType];

  if (!element || element.tagName !== "IMG" || !frames || runningElements.has(element)) {
    return;
  }

  if (sound) {
    playSfx(sound);
  }
  
  runningElements.add(element);
  element.classList.add(
    "vn-scene-prop--animating"
  );

  try {
    await Promise.all(
      frames.map(preloadFrame)
    );

    if (!element.isConnected) {
      return;
    }

    for (
      let index = 1;
      index < frames.length;
      index += 1
    ) {
      if (!element.isConnected) {
        return;
      }

      element.src = frames[index];
      await wait(500);
    }

    if (element.isConnected) {
      element.src = frames[0];
    }
  } finally {
    runningElements.delete(element);

    element.classList.remove(
      "vn-scene-prop--animating"
    );
  }
}

export function attachScenePropAnimation(
  element,
  prop,
  isInteractionEnabled = () => true
) {
  const interactionType = prop?.interactionType;

  if (!element || !interactionType) {
    return () => {};
  }

  element.classList.add("vn-scene-prop--interactive");
  element.dataset.interactionType = interactionType;
  element.tabIndex = 0;
  element.setAttribute("role", "button");
  element.setAttribute(
    "aria-label",
    prop.interactionLabel || prop.alt || "Objekt animieren"
  );

  const activate = (event) => {
    if (!isInteractionEnabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (interactionType === "lamp") {
      playSfx(PROP_SOUNDS.lampOn);
      element.dispatchEvent(
        new CustomEvent("scene-prop-activated", {
          bubbles: true,
          composed: true,
          detail: {
            interactionType: "lamp",
          },
        })
      );

      return;
    }

    void playScenePropAnimation(
      element,
      interactionType
    );
  };

  const handleKeydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    activate(event);
  };

  element.addEventListener("click", activate);
  element.addEventListener("keydown", handleKeydown);

  return () => {
    element.removeEventListener("click", activate);
    element.removeEventListener("keydown", handleKeydown);
  };
}