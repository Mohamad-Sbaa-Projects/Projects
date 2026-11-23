/* StorageService.js
 * Provides simple persistence helpers for saving and restoring
 * novel progress and creating archive entries in localStorage.
 */

const ARCHIVE_INDEX_KEY = "kite:archive:index";
const ARCHIVE_ITEM_KEY = (id) => `kite:archive:${id}`;
const PROGRESS_KEY = (novelId) => `kite:progress:${novelId}`;
const STORAGE_KEY_PREFIX = "visualNovel.progress.";
const CURRENT_NOVEL_KEY = "visualNovel.currentNovelId";
let introNovelSessionProgress = null;

function _readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn(`[StorageService] Failed to parse ${key}`, e);
    return null;
  }
}

function _writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[StorageService] Failed to write ${key}`, e);
  }
}

export const reset = {
  resetProgress(novelId) {
    if (typeof novelId === "undefined") return;
    try {
      localStorage.removeItem(PROGRESS_KEY(novelId));
    } catch (e) {
      console.error("[StorageService] Failed to reset progress", e);
    }
  },
};

function _getArchiveIndex() {
  return _readJson(ARCHIVE_INDEX_KEY) || [];
}

function _setArchiveIndex(index) {
  _writeJson(ARCHIVE_INDEX_KEY, index);
}

export function saveNovelProgress(state, history) {
  if (!state || typeof state.novelId === "undefined") return;

  const payload = {
    novelId: state.novelId,
    currentEventId: state.currentEventId,
    savedAt: new Date().toISOString(),
    history: history || [],
    selectedChoices: Array.isArray(state.selectedChoices)
      ? [...state.selectedChoices]
      : [],
    flags: state.flags && typeof state.flags === "object" ? { ...state.flags } : {},
    characterAppearances:
      state.characterAppearances && typeof state.characterAppearances === "object"
        ? { ...state.characterAppearances }
        : {},

    visibleCharacterIds:
      state.visibleCharacterIds instanceof Set
        ? Array.from(state.visibleCharacterIds)
        : [],

    characterExpressionTypes:
      state.characterExpressionTypes &&
      typeof state.characterExpressionTypes === "object"
        ? { ...state.characterExpressionTypes }
        : {},

    sceneInteractionStates:
      state.sceneInteractionStates &&
      typeof state.sceneInteractionStates === "object"
        ? { ...state.sceneInteractionStates }
        : {},
  };

  _writeJson(PROGRESS_KEY(state.novelId), payload);
}

export function getSavedProgressForState(state) {
  if (!state || typeof state.novelId === "undefined") return null;
  return _readJson(PROGRESS_KEY(state.novelId));
}

export function applySavedProgressToState(state, savedProgress) {
  if (!state || !savedProgress) return null;

  if (typeof savedProgress.currentEventId !== "undefined") {
    state.currentEventId = savedProgress.currentEventId;
  }

  if (Array.isArray(savedProgress.visibleCharacterIds)) {
    state.visibleCharacterIds = new Set(
      savedProgress.visibleCharacterIds.map(Number)
    );
  }

  if (
    savedProgress.characterExpressionTypes &&
    typeof savedProgress.characterExpressionTypes === "object"
  ) {
    state.characterExpressionTypes = {
      ...savedProgress.characterExpressionTypes,
    };
  }

  if (
    savedProgress.characterAppearances &&
    typeof savedProgress.characterAppearances === "object"
  ) {
    state.characterAppearances = { ...savedProgress.characterAppearances };
  }

  if (
    savedProgress.sceneInteractionStates &&
    typeof savedProgress.sceneInteractionStates ===
      "object"
  ) {
    state.sceneInteractionStates = {
      ...savedProgress.sceneInteractionStates,
    };
  }

  const history = savedProgress.history || savedProgress.chatHistory || [];

  return Array.isArray(history) ? history : [];
}

export function resetNovelProgress(state) {
  if (!state || typeof state.novelId === "undefined") return;
  try {
    localStorage.removeItem(PROGRESS_KEY(state.novelId));
  } catch (e) {
    console.error("[StorageService] Failed to reset progress", e);
  }
}

export function finishNovelProgress(state) {
  if (!state || typeof state.novelId === "undefined") return null;

  const progress = _readJson(PROGRESS_KEY(state.novelId));

  if (!progress) {
    // nothing to archive
    return null;
  }

  const id = String(Date.now());
  const archiveItem = {
    id,
    novelId: progress.novelId,
    archivedAt: new Date().toISOString(),
    currentEventId: progress.currentEventId,
    history: progress.history || [],
    selectedChoices: progress.selectedChoices || [],
    flags: progress.flags || {},
    visibleCharacterIds:
      progress.visibleCharacterIds || [],

    characterExpressionTypes:
      progress.characterExpressionTypes || {},

    characterAppearances:
      progress.characterAppearances || {},

    sceneInteractionStates:
      progress.sceneInteractionStates || {},  
  };

  try {
    _writeJson(ARCHIVE_ITEM_KEY(id), archiveItem);

    const index = _getArchiveIndex();
    index.push(id);
    _setArchiveIndex(index);

    localStorage.removeItem(PROGRESS_KEY(state.novelId));
    return id;
  } catch (e) {
    console.error("[StorageService] Failed to finish and archive progress", e);
    return null;
  }
}

export function _getAllArchiveIds() {
  return _getArchiveIndex();
}

export function _getAllProgressItems() {
  const progressItems = [];

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith("kite:progress:")) {
        continue;
      }

      const item = _readJson(key);
      if (item) {
        progressItems.push(item);
      }
    }
  } catch (e) {
    console.error("[StorageService] Failed to read active progress items", e);
  }

  return progressItems;
}

export function _getArchiveItem(id) {
  return _readJson(ARCHIVE_ITEM_KEY(id));
}

export function _removeArchiveItem(id) {
  try {
    localStorage.removeItem(ARCHIVE_ITEM_KEY(id));
    const index = _getArchiveIndex().filter((i) => i !== id);
    _setArchiveIndex(index);
  } catch (e) {
    console.error("[StorageService] Failed to remove archive item", e);
  }
}

export function saveIntroNovelSessionProgress(progress) {
  introNovelSessionProgress = progress ?? null;
}

export function getIntroNovelSessionProgress() {
  return introNovelSessionProgress;
}

export function clearIntroNovelSessionProgress() {
  introNovelSessionProgress = null;
}

export function updateArchiveItem(id, data) {
  const item = _getArchiveItem(id);
  if (!item) return;
  const updated = { ...item, ...data };
  _writeJson(ARCHIVE_ITEM_KEY(id), updated);
}
