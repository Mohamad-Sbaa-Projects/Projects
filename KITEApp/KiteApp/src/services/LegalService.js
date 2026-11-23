const LEGAL_BACKGROUND = "public_assets/images/_Images/SceneBase/Background_Bright.png";
const TERMS_ACCEPTED_KEY = "kite.termsAccepted.v1";
const LEGAL_TEXT_CACHE = new Map();

const LEGAL_PAGES = {
  legal: {
    id: "legal",
    type: "menu",
    title: "Rechtliche Informationen",
    background: LEGAL_BACKGROUND,
  },

  impressum: {
    id: "impressum",
    type: "text",
    title: "Impressum",
    menuLabel: "IMPRESSUM",
    route: "/legal/impressum",
    filePath: "public_assets/text_files/LegalNotice.txt",
    background: LEGAL_BACKGROUND,
    errorText: "Die Impressum-Datei konnte nicht geladen werden.",
  },

  datenschutz: {
    id: "datenschutz",
    type: "text",
    title: "Datenschutz",
    menuLabel: "DATENSCHUTZ",
    route: "/legal/datenschutz",
    filePath: "public_assets/text_files/PrivacyPolicy.txt",
    background: LEGAL_BACKGROUND,
    errorText: "Die Datenschutzerklärung konnte nicht geladen werden.",
    showResetAction: true,
  },

  nutzungsbedingungen: {
    id: "nutzungsbedingungen",
    type: "text",
    title: "Nutzungsbedingungen",
    menuLabel: "NUTZUNGSBEDINGUNGEN",
    route: "/legal/nutzungsbedingungen",
    filePath: "public_assets/text_files/TermsOfUse.txt",
    background: LEGAL_BACKGROUND,
    errorText: "Die Nutzungsbedingungen konnten nicht geladen werden.",
  },

  moretokite: {
    id: "moretokite",
    type: "text",
    title: "Mehr zu KITE",
    menuLabel: "MEHR ZU KITE",
    route: "/more-to-kite",
    filePath: "public_assets/text_files/more_to_kite.txt",
    background: LEGAL_BACKGROUND,
    errorText: "Der KITE-Infotext konnte nicht geladen werden.",
    showInMenu: false,
    footerActions: [
      { id: "auswahl", label: "ZUR NOVEL-AUSWAHL", route: "/auswahl" },
      { id: "einstieg", label: "ZUR EINSTIEGSNOVEL", route: "/szenario/einstieg" },
      { id: "wissen", label: "ZUR WISSENSBASIS", route: "/wissen" },
    ],
  },
};

export function getLegalPageConfig(pageId) {
  return LEGAL_PAGES[pageId] ?? LEGAL_PAGES.legal;
}

export function getLegalMenuItems() {
  return Object.values(LEGAL_PAGES).filter(
    (page) => page.type === "text" && page.showInMenu !== false
  );
}

export function hasAcceptedTerms() {
  try {
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAcceptedTerms(accepted) {
  try {
    localStorage.setItem(TERMS_ACCEPTED_KEY, accepted ? "true" : "false");
    return true;
  } catch {
    return false;
  }
}

export async function loadLegalText(pageId) {
  const pageConfig = getLegalPageConfig(pageId);

  if (!pageConfig.filePath) {
    throw new Error(`No filePath configured for legal page: ${pageId}`);
  }

  if (LEGAL_TEXT_CACHE.has(pageConfig.filePath)) {
    return LEGAL_TEXT_CACHE.get(pageConfig.filePath);
  }

  // Fetch the legal text file and parse it into structured content.

  const response = await fetch(pageConfig.filePath);

  if (!response.ok) {
    throw new Error(`Failed to load ${pageConfig.filePath}`);
  }

  const rawText = await response.text();
  const blocks = parseLegalText(rawText);

  LEGAL_TEXT_CACHE.set(pageConfig.filePath, blocks);

  return blocks;
}

  /*
    Converts the raw text file into simple content blocks.
    These blocks can later be rendered by the LegalTextView component.
   */

export function parseLegalText(rawText) {
  return rawText.split(/\r?\n/).map((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return {
        type: "empty",
      };
    }

    if (trimmedLine.startsWith("###")) {
      return {
        type: "subheading",
        text: trimmedLine.replace(/^###\s*/, ""),
      };
    }

    if (trimmedLine.startsWith("##")) {
      return {
        type: "heading",
        text: trimmedLine.replace(/^##\s*/, ""),
      };
    }

    if (/^[-•*]\s+/.test(trimmedLine)) {
      return {
        type: "list-item",
        parts: parseInlineLinks(trimmedLine.replace(/^[-•*]\s+/, "")),
      };
    }

    return {
      type: "paragraph",
      parts: parseInlineLinks(trimmedLine),
    };
  });
}

  /*
    Detects plain URLs and converts them into link parts.
    This also supports URLs without an explicit https prefix.
   */

function parseInlineLinks(text) {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const [fullMatch, label, href] = match;

    if (match.index > lastIndex) {
      parts.push(...parsePlainUrls(text.slice(lastIndex, match.index)));
    }

    parts.push({
      type: "link",
      text: label,
      href,
    });

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(...parsePlainUrls(text.slice(lastIndex)));
  }

  return parts;
}

function parsePlainUrls(text) {
  const plainUrlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = plainUrlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        text: text.slice(lastIndex, match.index),
      });
    }

    const urlText = match[0];
    const href = urlText.startsWith("www.") ? `https://${urlText}` : urlText;

    parts.push({
      type: "link",
      text: urlText,
      href,
    });

    lastIndex = plainUrlRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      text: text.slice(lastIndex),
    });
  }

  return parts;
}

  /*
    Removes only visual-novel related data.
    Other localStorage entries stay untouched.
   */

function getStorageKeys(storage) {
  const keys = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);

    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

function removeMatchingStorageKeys(storage, { prefixes = [], exactKeys = [] }) {
  const deletedKeys = [];

  getStorageKeys(storage).forEach((key) => {
    const shouldDeleteByPrefix = prefixes.some((prefix) =>
      key.startsWith(prefix)
    );

    const shouldDeleteExactKey = exactKeys.includes(key);

    if (shouldDeleteByPrefix || shouldDeleteExactKey) {
      storage.removeItem(key);
      deletedKeys.push(key);
    }
  });

  return deletedKeys;
}

export function resetLegalAppData() {
  try {
    const localStorageDeletedKeys = removeMatchingStorageKeys(localStorage, {
      prefixes: [
        "visualNovel.",
        "settings:",
        "kite.",
        "kite:"
      ],
      exactKeys: [
        "kite_saved_novels",
        TERMS_ACCEPTED_KEY,
      ],
    });

    const sessionStorageDeletedKeys = removeMatchingStorageKeys(sessionStorage, {
      prefixes: [
        "visualNovel.",
        "settings:",
        "kite.",
        "kite:"
      ],
      exactKeys: [
        "kite_saved_novels",
        TERMS_ACCEPTED_KEY,
      ],
    });

    return {
      success: true,
      localStorageDeletedKeys,
      sessionStorageDeletedKeys,
    };
  } catch (error) {
    console.warn("[LegalService] App data could not be reset:", error);

    return {
      success: false,
      localStorageDeletedKeys: [],
      sessionStorageDeletedKeys: [],
    };
  }
}

export function getLegalResetActionConfig() {
  return {
    label: "APP ZURÜCKSETZEN",
    ariaLabel: "App zurücksetzen",
    disabled: false,
  };
}

export function getLegalResetInfoConfig() {
  return {
    iconPath: "public_assets/images/_Images/Buttons/InfoCircle_1.png",
    ariaLabel: "Information zum App Zurücksetzen",
    dialogTitle: "INFORMATION",
    dialogText:
      "Mit diesem Button kannst du deine App zurücksetzen. Sämtliche Daten, welche durch dein Spielen entstanden sind, werden gelöscht.",
    confirmLabel: "OK",
  };
}

export function getLegalResetConfirmDialogConfig() {
  return {
    text:
      'Wenn du fortfährst wird die App zurückgesetzt.\n\nWenn du dies möchtest, drücke auf "DATEN LÖSCHEN".\nFalls nicht, drücke auf "ABBRECHEN".',
    cancelLabel: "ABBRECHEN",
    confirmLabel: "DATEN LÖSCHEN",
  };
}

export function handleLegalResetAction() {
  const resetResult = resetLegalAppData();

  if (resetResult.success) {
    window.dispatchEvent(
      new CustomEvent("kite-app-data-reset", {
        detail: resetResult,
      })
    );
  }

  return resetResult.success;
}

export { TERMS_ACCEPTED_KEY };