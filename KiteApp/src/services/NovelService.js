import { repository, EVENT_TYPES } from "./DataRepository.js";
import { ChoiceService } from "./ChoiceService.js";
import { _getAllArchiveIds, _getAllProgressItems, _getArchiveItem } from "./StorageService.js";

function normalizeNovelId(value) {
  return String(value ?? "");
}

function getCompletionCountByNovelId() {
  const counts = new Map();
  _getAllArchiveIds().forEach((archiveId) => {
    const archiveItem = _getArchiveItem(archiveId);
    if (!archiveItem) return;
    const novelKey = normalizeNovelId(archiveItem.novelId);
    counts.set(novelKey, (counts.get(novelKey) || 0) + 1);
  });
  return counts;
}

function getProgressByNovelId() {
  const map = new Map();
  _getAllProgressItems().forEach((progressItem) => {
    const novelKey = normalizeNovelId(progressItem.novelId);
    map.set(novelKey, progressItem);
  });
  return map;
}

function detectNovelProgress(novel, progressItem) {
  if (!progressItem || !progressItem.currentEventId) return "not-started";
  const currentEvent = novel?.events?.find((e) => e.id === progressItem.currentEventId);
  if (!currentEvent) return "not-started";
  if (currentEvent.eventType === EVENT_TYPES.END || currentEvent.eventType === EVENT_TYPES.FINAL) return "completed";
  if (currentEvent.eventType === EVENT_TYPES.CHOICE) return "in-progress";
  const nextPlayableEventId = ChoiceService.resolvePlayableEventId(novel, currentEvent.nextId);
  return nextPlayableEventId ? "in-progress" : "completed";
}

let _cachedSelectableNovels = null;

function computeSelectableNovels() {
  const completionCountByNovelId = getCompletionCountByNovelId();
  const progressByNovelId = getProgressByNovelId();

  return repository
      .getAllNovels()
      .filter((novel) => novel.showInSelection)
      .map((novel) => {
        const novelKey = normalizeNovelId(novel.id);
        const activeProgress = progressByNovelId.get(novelKey) || null;
        return {
          ...novel,
          completedCount: completionCountByNovelId.get(novelKey) || 0,
          progressStatus: detectNovelProgress(novel, activeProgress),
        };
      });
}

export const NovelService = {
  async initRepository() {
    await repository.init();
    _cachedSelectableNovels = null;
  },

  getSelectableNovels() {
    if (_cachedSelectableNovels) return _cachedSelectableNovels;
    _cachedSelectableNovels = computeSelectableNovels();
    return _cachedSelectableNovels;
  },

  // Expose internals for tests or debugging if needed
  _internals: {
    normalizeNovelId,
    detectNovelProgress,
    getCompletionCountByNovelId,
    getProgressByNovelId,
    computeSelectableNovels,
  },
};