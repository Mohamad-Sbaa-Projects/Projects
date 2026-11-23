function cloneProps(props = []) {
  return props.map((prop) => ({ ...prop }));
}

function cloneSceneCharacters(sceneCharacters = {}) {
  const entries = Object.entries(sceneCharacters || {});

  return Object.fromEntries(
    entries.map(([characterId, override]) => {
      const normalizedOverride = override && typeof override === "object"
        ? { ...override }
        : {};

      if (Array.isArray(normalizedOverride.attachedProps)) {
        normalizedOverride.attachedProps = cloneProps(normalizedOverride.attachedProps);
      }

      if (normalizedOverride.layout && typeof normalizedOverride.layout === "object") {
        normalizedOverride.layout = { ...normalizedOverride.layout };
      }

      return [characterId, normalizedOverride];
    })
  );
}

function mergeSceneCharacters(baseOverrides = {}, variantOverrides = {}) {
  const allCharacterIds = new Set([
    ...Object.keys(baseOverrides || {}),
    ...Object.keys(variantOverrides || {}),
  ]);

  return Object.fromEntries(
    [...allCharacterIds].map((characterId) => {
      const baseOverride = baseOverrides?.[characterId] || {};
      const variantOverride = variantOverrides?.[characterId] || {};
      const mergedOverride = {
        ...baseOverride,
        ...variantOverride,
      };

      if (baseOverride.layout || variantOverride.layout) {
        mergedOverride.layout = {
          ...(baseOverride.layout || {}),
          ...(variantOverride.layout || {}),
        };
      }

      const attachedPropsSource =
        variantOverride.attachedProps !== undefined
          ? variantOverride.attachedProps
          : baseOverride.attachedProps;

      if (attachedPropsSource !== undefined) {
        mergedOverride.attachedProps = cloneProps(attachedPropsSource || []);
      }

      return [characterId, mergedOverride];
    })
  );
}

function createFullWidthProp(imageUrl, alt, height = "6.25%") {
  return {
    imageUrl,
    alt,
    left: "0",
    bottom: "0",
    width: "100%",
    height,
    objectFit: "cover",
    objectPosition: "center bottom",
  };
}

const SCENE_DEFINITIONS = {
  einstieg: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/Einstieg_BG.png",
      alt: "KITE introduction background",
      objectPosition: "center center",
    },
  },
  bank: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/Bank_BG.png",
      alt: "Bank office background",
      objectPosition: "center top",
    },
    sceneCharacters: {
      11: {
        layout: {
          left: "0px",
        },
      },
    },
    backProps: [
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Plant/Plant_1@4x.png",
        alt: "Bank office plant",
        interactionType: "plant",
        interactionLabel: "Pflanze bewegen",
        right: "0.2%",
        bottom: "10.5%",
        width: "40%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 2,
      },
    ],
    frontProps: [
      createFullWidthProp(
        "./public_assets/images/_Images/Props/Desk.png",
        "Bank desk edge"
      ),
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Glass/Glass_7still@4x.png",
        alt: "Water glass on bank desk",
        interactionType: "glass",
        interactionLabel: "Wasserglas animieren",
        left: "0.8%",
        bottom: "2.8%",
        width: "16%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 2,
      },
    ],
  },
  investor: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/Investor_BG.png",
      alt: "Investor office background",
      objectPosition: "center top",
    },
    sceneCharacters: {
      9: {
        layout: {
          left: "-24px",
          width: "330px",
          height: "860px",
          bottom: "-27.3rem",
          transform: "none",
        },
      },
    },
    backProps: [
      {
        imageUrl: "./public_assets/images/_Images/EventAnimations/Plant/Plant_1@4x.png",
        alt: "Investor office plant",
        interactionType: "plant",
        interactionLabel: "Pflanze bewegen",
        right: "-3%",
        bottom: "1.3%",
        width: "44.8%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 2,
      },
    ],
  },
  notarin: {
    background: {
  imageUrl: "./public_assets/images/_Images/Background/Notarin_BG.png",
  alt: "Notary office background",
  objectFit: "cover",
  objectPosition: "center top",
  scale: "1.0",
},
    sceneCharacters: {
      10: {
        layout: {
          left: "42px",
          width: "226px",
          height: "712px",
          bottom: "-20.6rem",
          transform: "none",
        },
      },
    },
    backProps: [
      {
        imageUrl: "./public_assets/images/_Images/Props/Notarin_Cabinet.png",
        alt: "Notary office shelf and decor",
        left: "-1%",
        bottom: "-5%",
        width: "100%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "left bottom",
        zIndex: 2,
      },
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Plant/Plant_1@4x.png",
        alt: "Notary office plant",
        interactionType: "plant",
        interactionLabel: "Pflanze bewegen",
        right: "-2.5%",
        bottom: "5.4%",
        width: "41%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 3,
      },
    ],
    frontProps: [
      createFullWidthProp(
        "./public_assets/images/_Images/Props/Desk.png",
        "Notary desk foreground",
        "5.5%"
      ),
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Glass/Glass_7still@4x.png",
        alt: "Water glass on notary desk",
        interactionType: "glass",
        interactionLabel: "Wasserglas animieren",
        left: "6%",
        bottom: "0.4%",
        width: "13%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 3,
      },
    ],
  },
  presse: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/Presse_BG.png",
      alt: "Press event background",
      objectPosition: "center top",
    },
    frontProps: [
      {
        imageUrl: "./public_assets/images/_Images/Props/Presse_Desk.png",
        alt: "Press desk foreground",
        left: "-6%",
        bottom: "-6%",
        width: "112%",
        height: "12%",
        objectFit: "contain",
        objectPosition: "center bottom",
      },
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Glass/Glass_7still@4x.png",
        alt: "Water glass on press desk",
        interactionType: "glass",
        interactionLabel: "Wasserglas animieren",
        left: "16%",
        bottom: "0.6%",
        width: "14%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 3,
      },
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Vase/Vase_2@4x.png",
        alt: "Flower vase on press desk",
        interactionType: "vase",
        interactionLabel: "Vase animieren",
        left: "53%",
        bottom: "0.2%",
        width: "20%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        translateX: "-50%",
        zIndex: 3,
      },
    ],
  },
  vermieter: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/Vermieter_BG.png",
      alt: "Rental office background",
      objectPosition: "center top",
    },
    sceneCharacters: {
      6: {
        layout: {
          right: "-22px",
          width: "238px",
          height: "760px",
          bottom: "-17.6rem",
          transform: "none",
        },
      },
    },
    backProps: [
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Plant/Plant_1@4x.png",
        alt: "Rental office plant on the window sill",
        interactionType: "plant",
        interactionLabel: "Pflanze bewegen",
        left: "8%",
        bottom: "9%",
        width: "31%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 2,
      },
    ],
  },
  eltern: {
    background: {
      imageUrl:
        "./public_assets/images/_Images/Background/Eltern_bg.png",
      alt: "Parents living room background",
      objectPosition: "center 8%",
    },
    variants: {
      lightOn: {
        background: {
          imageUrl:
            "./public_assets/images/_Images/EventAnimations/Lamp/BG parents_light on.png",
        },
      },
    },
    sceneCharacters: {
      7: {
        zIndex: 2,
        attachedProps: [
          {
            imageUrl:
              "./public_assets/images/_Images/EventAnimations/Mug_V/Mug_V1.png",
            alt: "Mug in Mutter hand",
            interactionType: "mugViolet",
            interactionLabel: "Tasse dampfen lassen",
            left: "51%",
            bottom: "59.4%",
            width: "158px",
            height: "180px",
            objectFit: "fill",
            translateX: "-50%",
            rotate: "-2deg",
            zIndex: 65,
          },
        ],
      },
      8: {
        zIndex: 1,
      },
    },
    backProps: [
      {
        className: "vn-lamp-hotspot",
        interactionType: "lamp",
        interactionLabel: "Lampe ein- oder ausschalten",
        left: "55%",
        top: "50%",
        width: "25%",
        height: "28%",
        zIndex: 20,
      },
    ],
    frontProps: [
      {
        imageUrl: "./public_assets/images/_Images/Props/Eltern_Table.png",
        alt: "Parents table",
        left: "-4.2%",
        bottom: "-1.2%",
        width: "109%",
        height: "13%",
        objectFit: "fill",
        objectPosition: "center middle",
        zIndex: 1,
      },
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Jug/Jug_1.png",
        alt: "Parents table teapot",
        interactionType: "jug",
        interactionLabel: "Teekanne dampfen lassen",
        left: "55.2%",
        bottom: "6.4%",
        width: "34.2%",
        height: "auto",
        translateX: "-50%",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 3,
      },
      {
        imageUrl: "./public_assets/images/_Images/EventAnimations/Mug_G/Mug_G1.png",
        alt: "Parents table mug",
        interactionType: "mugGreen",
        interactionLabel: "Tasse dampfen lassen",
        right: "5%",
        bottom: "5.4%",
        width: "33%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 3,
      },
    ],
  },
  honorar: {
    background: {
      imageUrl: "./public_assets/images/_Images/Background/WallAndWindow.png",
      alt: "Office with window background",
      objectPosition: "center top",
    },
    sceneCharacters: {
      12: {
        layout: {
          left: "0px",
        },
      },
    },
    backProps: [
      {
        imageUrl: "./public_assets/images/_Images/Props/DrawerCabinet.png",
        alt: "Office cabinet",
        right: "-8.75%",
        bottom: "4.35%",
        width: "39%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "right bottom",
      },
      {
        imageUrl:
          "./public_assets/images/_Images/EventAnimations/Vase/Vase_1@4x.png",
        alt: "Flower vase on office cabinet",
        interactionType: "vase",
        interactionLabel: "Vase animieren",
        right: "2%",
        bottom: "14%",
        width: "22%",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center bottom",
        zIndex: 2,
      },
    ],
    frontProps: [
      createFullWidthProp(
        "./public_assets/images/_Images/Props/Table_FG.png",
        "Honorar foreground desk",
        "6.25%"
      ),
    ],
  },
};

function normalizeSceneId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeSceneVariant(value) {
  const normalizedValue = String(value ?? "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

  if (!normalizedValue || normalizedValue === "default" || normalizedValue === "lightoff") {
    return "default";
  }

  if (normalizedValue === "lighton" || normalizedValue === "on") {
    return "lightOn";
  }

  return normalizedValue;
}

function resolveSceneConfig(sceneId, variant = "default") {
  const resolvedSceneId = normalizeSceneId(sceneId);
  const baseConfig =
    SCENE_DEFINITIONS[resolvedSceneId] || SCENE_DEFINITIONS.einstieg;

  const resolvedVariant = normalizeSceneVariant(variant);
  const variantConfig =
    resolvedVariant !== "default" && baseConfig.variants
      ? baseConfig.variants[resolvedVariant] || null
      : null;

  return {
    id: resolvedSceneId || "einstieg",
    background: {
      objectFit: "cover",
      objectPosition: "center center",
      ...(baseConfig.background || {}),
      ...(variantConfig?.background || {}),
    },
    backProps: cloneProps([
      ...(baseConfig.backProps || []),
      ...(variantConfig?.backProps || []),
    ]),
    frontProps: cloneProps([
      ...(baseConfig.frontProps || []),
      ...(variantConfig?.frontProps || []),
    ]),
    sceneCharacters: cloneSceneCharacters(
      mergeSceneCharacters(
        baseConfig.sceneCharacters || {},
        variantConfig?.sceneCharacters || {}
      )
    ),
  };
}

export class SceneAssetService {
  getSceneForNovel(novel) {
    return resolveSceneConfig(novel?.backgroundId, novel?.backgroundVariant);
  }

  getSceneForEvent(state, event) {
    const backgroundId = event?.backgroundId || state?.novel?.backgroundId;
    const backgroundVariant =
      event?.backgroundVariant || state?.novel?.backgroundVariant;

    return resolveSceneConfig(backgroundId, backgroundVariant);
  }
}

export const sceneAssetService = new SceneAssetService();












