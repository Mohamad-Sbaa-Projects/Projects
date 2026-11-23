import { DataNormalizer } from "./DataNormalizer.js";
import { characterViewService } from "./CharacterViewService.js";
import { sceneAssetService } from "./SceneAssetService.js";

export const EVENT_TYPES = {
  CHARACTER_JOIN: 2,
  EXIT: 3,
  DIALOGUE: 4,
  CHOICE: 5,
  END: 6,
  FINAL: 10,
  SOUND: 11,
};

const EXPRESSIONS = {
  0: "Scared",
  1: "Defeated",
  2: "Dissatisfied",
  3: "Rejecting",
  4: "Amazed",
  5: "Questioning",
  6: "Critical",
  7: "Smiling_Big",
  8: "Laughing",
  9: "Smiling",
  10: "Neutral_Relaxed",
  11: "Neutral",
  12: "Proud",
};

function createFaces(faceStyle) {
  const faces = {};

  for (const [id, expression] of Object.entries(EXPRESSIONS)) {
    const basePath =
      `./public_assets/images/_Images/Character/FaceImages/${expression}`;

    faces[id] = {
      idle: `${basePath}/${faceStyle}_${expression}.png`,
      speaking: `${basePath}/${faceStyle}_${expression}_Speaking.png`,
    };
  }

  faces.default = faces[10];

  return faces;
}

function cloneAttachedProps(props = []) {
  return Array.isArray(props) ? props.map((prop) => ({ ...prop })) : [];
}

function makeChar(
  id,
  name,
  headPath,
  hairPath,
  clothesPath,
  defaultPosition = "center",
  extraImageParts = {},
  attachedProps = []
) {
  const faceStyle = headPath.startsWith("Head_2")
  ? "Strong"
  : "Fine";
  return {
    id,
    name,
    isPlayer: false,
    defaultPosition,
    attachedProps: cloneAttachedProps(attachedProps),
    imageParts: {
      head: `./public_assets/images/_Images/Character/HeadImages/${headPath}.png`,
      eyes: "./public_assets/images/_Images/Character/EyesImages/Eyes_Open.png",
      hair: `./public_assets/images/_Images/Character/HairImages/${hairPath}.png`,
      clothes: `./public_assets/images/_Images/Character/ClothesImages/${clothesPath}.png`,
      ...extraImageParts,
    },
    faces: createFaces(faceStyle),
  };
}

function makeAppearanceVariant(
  hairPath,
  clothesPath,
  extraImageParts = {},
  attachedProps = null
) {
  const variant = {
    imageParts: {
      hair: `./public_assets/images/_Images/Character/HairImages/${hairPath}.png`,
      clothes: `./public_assets/images/_Images/Character/ClothesImages/${clothesPath}.png`,
      ...extraImageParts,
    },
  };

  if (attachedProps !== null) {
    variant.attachedProps = cloneAttachedProps(attachedProps);
  }

  return variant;
}

function getHeadImagePath(headGroup, headTone) {
  return `./public_assets/images/_Images/Character/HeadImages/Head_${headGroup}/Head_${headGroup}_${headTone}.png`;
}

function makeToneAppearanceVariant(
  headGroup,
  headTone,
  hairPath,
  clothesPath,
  extraImageParts = {},
  attachedProps = null
) {
  return makeAppearanceVariant(
    hairPath,
    clothesPath,
    {
      head: getHeadImagePath(headGroup, headTone),
      ...extraImageParts,
    },
    attachedProps
  );
}

function withAppearanceVariants(character, defaultAppearanceId, appearanceVariants) {
  return {
    ...character,
    defaultAppearanceId,
    appearanceVariants,
  };
}

function normalizeAppearanceId(value) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function getAppearanceVariantIds(character) {
  return Object.keys(character?.appearanceVariants || {})
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function selectAppearanceId(character, fallbackAppearanceId = 0, randomize = true) {
  const variantIds = getAppearanceVariantIds(character);

  if (variantIds.length === 0) {
    return normalizeAppearanceId(fallbackAppearanceId);
  }

  const normalizedFallbackAppearanceId = normalizeAppearanceId(fallbackAppearanceId);

  if (!randomize) {
    return normalizedFallbackAppearanceId || variantIds[0] || 0;
  }

  return variantIds[Math.floor(Math.random() * variantIds.length)] || normalizedFallbackAppearanceId;
}

const DEFAULT_FACE_MAP = {
  default:
    "./public_assets/images/_Images/Character/FaceImages/Neutral/Fine_Neutral.png",
  0: "./public_assets/images/_Images/Character/FaceImages/Neutral/Fine_Neutral.png",
  1: "./public_assets/images/_Images/Character/FaceImages/Neutral_Relaxed/Fine_Neutral_Relaxed.png",
  2: "./public_assets/images/_Images/Character/FaceImages/Critical/Fine_Critical.png",
  3: "./public_assets/images/_Images/Character/FaceImages/Questioning/Fine_Questioning.png",
  4: "./public_assets/images/_Images/Character/FaceImages/Amazed/Fine_Amazed.png",
  5: "./public_assets/images/_Images/Character/FaceImages/Dissatisfied/Fine_Dissatisfied.png",
  6: "./public_assets/images/_Images/Character/FaceImages/Rejecting/Fine_Rejecting.png",
  7: "./public_assets/images/_Images/Character/FaceImages/Scared/Fine_Scared.png",
  8: "./public_assets/images/_Images/Character/FaceImages/Defeated/Fine_Defeated.png",
  9: "./public_assets/images/_Images/Character/FaceImages/Smiling/Fine_Smiling.png",
  10: "./public_assets/images/_Images/Character/FaceImages/Neutral/Fine_Neutral.png",
  11: "./public_assets/images/_Images/Character/FaceImages/Proud/Fine_Proud.png",
};

const CHARACTERS = [
  { id: 0, name: "Du", isPlayer: true, defaultPosition: "center", imageParts: null },
  { id: 1, name: "Du", isPlayer: true, defaultPosition: "center", imageParts: null },
  makeChar(2, "KITE", "Einstieg_Head_1", "Einstieg/Einstieg_Hair_1", "Einstieg/Einstieg_Clothes_1"),
  { id: 4, name: "System", isPlayer: false, defaultPosition: "center", imageParts: null },
  withAppearanceVariants(
    makeChar(
      5,
      "Journalistin",
      "Head_1/Head_1_a",
      "Presse/Presse_Hair_1",
      "Presse/Presse_Clothes_1",
      "center",
      {
        hands: "./public_assets/images/_Images/Character/HandsImages/Presse/Presse_Hands_1.png",
      }
    ),
    1,
    {
      1: makeToneAppearanceVariant(1, "a", "Presse/Presse_Hair_1", "Presse/Presse_Clothes_1", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Presse/Presse_Hands_1.png",
      }),
      2: makeToneAppearanceVariant(1, "b", "Presse/Presse_Hair_2", "Presse/Presse_Clothes_2", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Presse/Presse_Hands_2.png",
      }),
      3: makeToneAppearanceVariant(1, "c", "Presse/Presse_Hair_3", "Presse/Presse_Clothes_3", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Presse/Presse_Hands_3.png",
      }),
      4: makeToneAppearanceVariant(1, "d", "Presse/Presse_Hair_4", "Presse/Presse_Clothes_4", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Presse/Presse_Hands_4.png",
      }),
    }
  ),
  withAppearanceVariants(
    makeChar(
      6,
      "Vermieter",
      "Head_1/Head_1_b",
      "Vermieter/Vermieter_Hair_2",
      "Vermieter/Vermieter_Clothes_2",
      "right",
      {
        hands: "./public_assets/images/_Images/Character/HandsImages/Vermieter/Vermieter_Hands_b.png",
      }
    ),
    2,
    {
      1: makeToneAppearanceVariant(1, "a", "Vermieter/Vermieter_Hair_1", "Vermieter/Vermieter_Clothes_1", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Vermieter/Vermieter_Hands_a.png",
      }),
      2: makeToneAppearanceVariant(1, "b", "Vermieter/Vermieter_Hair_2", "Vermieter/Vermieter_Clothes_2", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Vermieter/Vermieter_Hands_b.png",
      }),
      3: makeToneAppearanceVariant(1, "c", "Vermieter/Vermieter_Hair_3", "Vermieter/Vermieter_Clothes_3", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Vermieter/Vermieter_Hands_c.png",
      }),
      4: makeToneAppearanceVariant(1, "d", "Vermieter/Vermieter_Hair_4", "Vermieter/Vermieter_Clothes_4", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Vermieter/Vermieter_Hands_d.png",
      }),
    }
  ),
  withAppearanceVariants(
    makeChar(
      7,
      "Mutter",
      "Head_1/Head_1_a",
      "Eltern/Mutter/Mutter_Hair_1",
      "Eltern/Mutter/Mutter_Clothes_1",
      "left",
      {
        hands: "./public_assets/images/_Images/Character/HandsImages/Eltern/Mutter/Mutter_Hands_2_a.png",
      }
    ),
    1,
    {
      1: makeToneAppearanceVariant(1, "a", "Eltern/Mutter/Mutter_Hair_1", "Eltern/Mutter/Mutter_Clothes_1", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Eltern/Mutter/Mutter_Hands_2_a.png",
      }),
      2: makeToneAppearanceVariant(1, "a", "Eltern/Mutter/Mutter_Hair_2", "Eltern/Mutter/Mutter_Clothes_2", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Eltern/Mutter/Mutter_Hands_2_a.png",
      }),
      3: makeToneAppearanceVariant(1, "c", "Eltern/Mutter/Mutter_Hair_3", "Eltern/Mutter/Mutter_Clothes_3", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Eltern/Mutter/Mutter_Hands_3_c.png",
      }),
      4: makeToneAppearanceVariant(1, "b", "Eltern/Mutter/Mutter_Hair_4", "Eltern/Mutter/Mutter_Clothes_4", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Eltern/Mutter/Mutter_Hands_4_b.png",
      }),
    }
  ),
  withAppearanceVariants(
    makeChar(
      8,
      "Vater",
      "Head_2/Head_2_a",
      "Eltern/Vater/Vater_Hair_1",
      "Eltern/Vater/Vater_Clothes_1",
      "right",
      {
        glasses:
          "./public_assets/images/_Images/Character/GlassesImages/Glasses.png",
      }
    ),
    1,
    {
      1: makeToneAppearanceVariant(2, "a", "Eltern/Vater/Vater_Hair_1", "Eltern/Vater/Vater_Clothes_1"),
      2: makeToneAppearanceVariant(2, "b", "Eltern/Vater/Vater_Hair_2", "Eltern/Vater/Vater_Clothes_2"),
      3: makeToneAppearanceVariant(2, "c", "Eltern/Vater/Vater_Hair_3", "Eltern/Vater/Vater_Clothes_3"),
      4: makeToneAppearanceVariant(2, "d", "Eltern/Vater/Vater_Hair_4", "Eltern/Vater/Vater_Clothes_4"),
    }
  ),
  withAppearanceVariants(
    makeChar(
      9,
      "Investor",
      "Head_2/Head_2_c",
      "Investor/Investor_Hair_1",
      "Investor/Investor_Clothes_1",
      "left",
      {
        hands: "./public_assets/images/_Images/Character/HandsImages/Investor/Investor_Hands_c.png",
      },
      [
        {
          imageUrl: "./public_assets/images/_Images/EventAnimations/Mug_V/Mug_V1.png",
          alt: "Cup in Investor hand",
          left: "64%",
          bottom: "52%",
          width: "42px",
          height: "42px",
          translateX: "-50%",
          rotate: "-2deg",
          zIndex: 65,
        },
      ]
    ),
    1,
    {
      1: makeToneAppearanceVariant(2, "c", "Investor/Investor_Hair_1", "Investor/Investor_Clothes_1", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Investor/Investor_Hands_c.png",
      }),
      2: makeToneAppearanceVariant(2, "a", "Investor/Investor_Hair_2", "Investor/Investor_Clothes_2", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Investor/Investor_Hands_a.png",
      }),
      3: makeToneAppearanceVariant(2, "b", "Investor/Investor_Hair_3", "Investor/Investor_Clothes_3", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Investor/Investor_Hands_b.png",
      }),
      4: makeToneAppearanceVariant(2, "d", "Investor/Investor_Hair_4", "Investor/Investor_Clothes_4", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Investor/Investor_Hands_d.png",
      }),
    }
  ),
  withAppearanceVariants(
    makeChar(
      10,
      "Notarin",
      "Head_2/Head_2_a",
      "Notarin/Notarin_Hair_1",
      "Notarin/Notarin_Clothes_1",
      "left",
      {},
      [
        {
          imageUrl: "./public_assets/images/_Images/Character/ClothesImages/Notarin/Notarin_Headset.png",
          alt: "Notary headset",
          left: "-2%",
          bottom: "5%",
          width: "104%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center bottom",
          zIndex: 60,
        },
      ]
    ),
    1,
    {
      1: makeToneAppearanceVariant(2, "a", "Notarin/Notarin_Hair_1", "Notarin/Notarin_Clothes_1"),
      2: makeToneAppearanceVariant(2, "b", "Notarin/Notarin_Hair_2", "Notarin/Notarin_Clothes_2"),
      3: makeToneAppearanceVariant(2, "c", "Notarin/Notarin_Hair_3", "Notarin/Notarin_Clothes_3"),
      4: makeToneAppearanceVariant(2, "d", "Notarin/Notarin_Hair_4", "Notarin/Notarin_Clothes_4"),
    }
  ),
  withAppearanceVariants(
    makeChar(
      11,
      "Bankberater",
      "Head_2/Head_2_a",
      "Bank/Bank_Hair_1",
      "Bank/Bank_Clothes_1",
      "center",
      {
        hands: "./public_assets/images/_Images/Character/HandsImages/Bank/Bank_Hands_a.png",
      }
    ),
    1,
    {
      1: makeToneAppearanceVariant(2, "a", "Bank/Bank_Hair_1", "Bank/Bank_Clothes_1", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Bank/Bank_Hands_a.png",
      }),
      2: makeToneAppearanceVariant(2, "b", "Bank/Bank_Hair_2", "Bank/Bank_Clothes_2", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Bank/Bank_Hands_b.png",
      }),
      3: makeToneAppearanceVariant(2, "c", "Bank/Bank_Hair_3", "Bank/Bank_Clothes_3", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Bank/Bank_Hands_c.png",
      }),
      4: makeToneAppearanceVariant(2, "d", "Bank/Bank_Hair_4", "Bank/Bank_Clothes_4", {
        hands: "./public_assets/images/_Images/Character/HandsImages/Bank/Bank_Hands_d.png",
      }),
    }
  ),
  withAppearanceVariants(
    makeChar(
      12,
      "Kundin",
      "Head_1/Head_1_a",
      "Honorar/Honorar_Hair_1",
      "Honorar/Honorar_Clothes_1"
    ),
    1,
    {
      1: makeToneAppearanceVariant(1, "a", "Honorar/Honorar_Hair_1", "Honorar/Honorar_Clothes_1"),
      2: makeToneAppearanceVariant(1, "b", "Honorar/Honorar_Hair_2", "Honorar/Honorar_Clothes_2"),
      3: makeToneAppearanceVariant(1, "c", "Honorar/Honorar_Hair_3", "Honorar/Honorar_Clothes_3"),
      4: makeToneAppearanceVariant(1, "d", "Honorar/Honorar_Hair_3", "Honorar/Honorar_Clothes_4"),
    }
  ),
];

class DataRepository {
  constructor() {
    this.novels = new Map();
    this.characters = new Map();
    this.isInitialized = false;
    this.normalizer = new DataNormalizer();
  }

  async init() {
    if (this.isInitialized) return;

    CHARACTERS.forEach((char) => this.characters.set(Number(char.id), char));

    try {
      const rawNovels = await this._loadRawNovels();
      rawNovels.forEach((raw) => {
        const normalized = this.normalizer.normalizeNovel(raw);
        this.novels.set(normalized.id, normalized);
      });

      this.isInitialized = true;
      console.log("DataRepository initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize DataRepository:", error);
      throw error;
    }
  }

  getNovel(id) {
    return this.novels.get(id) || this.novels.get(Number(id)) || null;
  }

  getAllNovels() {
    return Array.from(this.novels.values());
  }

  getCharacter(id) {
    return (
      this.characters.get(id) ||
      this.characters.get(Number(id)) || {
        id,
        name: `Charakter ${id}`,
        isPlayer: false,
        defaultPosition: "center",
        imageParts: null,
        attachedProps: [],
        faces: {},
      }
    );
  }

  async _loadRawNovels() {
    const novelsJsonUrl = new URL("../data/novels.json", import.meta.url);
    const response = await fetch(novelsJsonUrl);

    if (!response.ok) {
      throw new Error("Could not load novels.json");
    }

    const data = await response.json();
    return data.visualNovels || [];
  }
}

export function parseNovelId(rawNovelId) {
  const numberValue = Number(rawNovelId);

  if (rawNovelId !== "" && !Number.isNaN(numberValue)) {
    return numberValue;
  }

  return rawNovelId;
}

export function createNovelPlayerState(rawNovelId) {
  return {
    novelId: parseNovelId(rawNovelId),
    novel: null,
    currentEventId: null,
    restoredCurrentEventId: null,
    selectedChoices: [],
    flags: {},
    characterExpressionTypes: {},
    characterAppearances: {},
    sceneInteractionStates: {
      lampOn: false,
    },
  };
}

export function loadNovelIntoState(state) {
  const novel = repository.getNovel(state.novelId);

  if (!novel) {
    throw new Error(`Novel mit ID ${state.novelId} wurde nicht gefunden.`);
  }

  state.novel = { ...novel };

  const scene = sceneAssetService.getSceneForNovel(state.novel);

  return {
    novel: state.novel,
    scene,
  };
}

export function initializeCharacterAppearances(
  state,
  { randomize = true } = {}
) {
  if (!state) {
    return {};
  }

  const currentAppearances =
    state.characterAppearances && typeof state.characterAppearances === "object"
      ? { ...state.characterAppearances }
      : {};

  for (const character of repository.characters.values()) {
    if (character?.isPlayer || !character?.appearanceVariants) {
      continue;
    }

    const characterId = Number(character.id);
    const existingAppearanceId = normalizeAppearanceId(
      currentAppearances[characterId]
    );

    if (existingAppearanceId) {
      currentAppearances[characterId] = existingAppearanceId;
      continue;
    }

    const fallbackAppearanceId =
      normalizeAppearanceId(
        state?.novel?.defaultCharacterAppearances?.[characterId]
      ) || normalizeAppearanceId(character.defaultAppearanceId);

    const selectedAppearanceId = selectAppearanceId(
      character,
      fallbackAppearanceId,
      randomize
    );

    if (selectedAppearanceId) {
      currentAppearances[characterId] = selectedAppearanceId;
    }
  }

  state.characterAppearances = currentAppearances;
  return currentAppearances;
}

export function getEventById(novel, eventId) {
  if (!novel || !Array.isArray(novel.events)) {
    return null;
  }

  return novel.events.find((event) => event.id === eventId) || null;
}

export function getCurrentEvent(state) {
  return getEventById(state.novel, state.currentEventId);
}

export function getSceneForEvent(state, event) {
  return sceneAssetService.getSceneForEvent(state, event);
}

export function moveToEvent(state, eventId) {
  state.currentEventId = eventId;
}

export function getCharacterById(characterId) {
  return repository.getCharacter(characterId);
}

export function getPlayerCharacter() {
  return getCharacterById(0);
}

export function normalizePosition(position) {
  return characterViewService.normalizePosition(position);
}

export function getCharacterView(
  characterId,
  expressionType = "default",
  position = "center",
  appearanceId = 0
) {
  return characterViewService.getCharacterView(
    characterId,
    expressionType,
    position,
    appearanceId
  );
}

export function getVisibleCharactersForEvent(state, event) {
  return characterViewService.getVisibleCharactersForEvent(state, event);
}

export function getSpeakerForEvent(event) {
  return characterViewService.getSpeakerForEvent(event);
}

export const repository = new DataRepository();


