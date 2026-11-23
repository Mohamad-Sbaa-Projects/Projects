import { repository } from "./DataRepository.js";
import {
  _getAllArchiveIds,
  _getArchiveItem,
  _removeArchiveItem,
} from "./StorageService.js";
import { EVENT_TYPES } from "./DataRepository.js";
import { ChoiceService } from "./ChoiceService.js";
import {
  createPlaceholderFeedback,
  getFeedbackForNovel,
  getFeedbackForArchive,
} from "./AiFeedbackService.js";

const ARCHIVE_ICON_PATH =
  "public_assets/images/_Images/IconsAndLogos/Icon_GameArchive.png";

const ARCHIVE_INTRO =
  "Hier findest du deine gespielten Dialoge und Analysen in chronologischer Reihenfolge zum Nachlesen. Du kannst sie in die Zwischenablage kopieren, um sie auch an anderer Stelle zu verwenden.";

const ARCHIVE_STATE_MESSAGES = {
  loading: "Archiv wird geladen.",
  empty: "Spiele eine Novel, um hier deinen ersten Eintrag zu sehen.",
};

const ARCHIVE_TOAST_MESSAGES = {
  copySuccess: "Text wurde in die Zwischenablage kopiert.",
  copyError: "Kopieren war nicht moglich.",
};

const ARCHIVE_ENTRY_ARROWS = {
  collapsed: "public_assets/images/_Images/DropDown/Arrow_Left.png",
  expanded: "public_assets/images/_Images/DropDown/Arrow_Down.png",
};

const ARCHIVE_FALLBACK_PALETTE = [
  ["#5b2646", "#3b173a"],
  ["#3a1640", "#291130"],
  ["#7c1538", "#5d1530"],
  ["#48642b", "#2b4018"],
  ["#072b3b", "#083244"],
  ["#0f4d4a", "#063f3b"],
  ["#2e6b27", "#1f4f19"],
];

const ARCHIVE_ACTIONS = [
  { section: "dialog", label: "Dialog", toggleable: true },
  { section: "ki-feedback", label: "KI-Feedback", toggleable: true },
];

function createToggleState() {
  return Object.create(null);
}

class ArchiveService {
  constructor({
    aiFeedbackService = {
      getFeedbackForNovel,
      createPlaceholderFeedback,
      getFeedbackForArchive,
    },
  } = {}) {
    this.aiFeedbackService = aiFeedbackService;
    this.archives = [];
    this.isLoading = true;
    this.entryState = createToggleState();
    this.sessionState = createToggleState();
    this.detailState = createToggleState();
  }

  async getAllArchives() {
    // ensure repository data available for titles
    try {
      await repository.init();
    } catch (e) {
      // continue even if repo init fails
    }

    const ids = _getAllArchiveIds();
    const archivedItems = ids
      .map((id) => _getArchiveItem(id))
      .filter(Boolean)
      .map((item) => ({
        ...item,
        source: "archive",
        updatedAt: item.archivedAt || "",
        novel: repository.getNovel(item.novelId) || null,
      }));

    const items = this.deduplicateSessions(archivedItems).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    return items;
  }

  deduplicateSessions(items) {
    const deduped = new Map();

    for (const item of items) {
      const key = this.getSessionFingerprint(item);
      const existing = deduped.get(key);

      if (!existing) {
        deduped.set(key, item);
        continue;
      }

      // Prefer archived rows over progress rows for the same session fingerprint.
      if (existing.source !== "archive" && item.source === "archive") {
        deduped.set(key, item);
        continue;
      }

      const existingTime = Date.parse(existing.updatedAt || existing.archivedAt || existing.savedAt || "") || 0;
      const itemTime = Date.parse(item.updatedAt || item.archivedAt || item.savedAt || "") || 0;

      if (itemTime > existingTime) {
        deduped.set(key, item);
      }
    }

    return Array.from(deduped.values());
  }

  getSessionFingerprint(item) {
    const novelId = String(item?.novelId ?? "");
    const currentEventId = String(item?.currentEventId ?? "");
    const normalizedHistory = this.normalizeHistory(item?.history);
    const timeBucket = this.getTimeBucket(item);

    return `${novelId}|${currentEventId}|${normalizedHistory}|${timeBucket}`;
  }

  normalizeHistory(history) {
    if (!Array.isArray(history) || history.length === 0) {
      return "";
    }

    return history
      .map((message) => {
        if (!message || typeof message !== "object") {
          return "";
        }

        const speaker = String(message.speaker ?? "").trim();
        const text = String(message.text ?? "").trim();
        const role = String(message.role ?? "").trim();
        const id = String(message.id ?? "").trim();

        return `${speaker}::${role}::${id}::${text}`;
      })
      .join("||");
  }

  getTimeBucket(item) {
    const raw = item?.updatedAt || item?.archivedAt || item?.savedAt || "";
    const time = Date.parse(raw);
    if (!Number.isFinite(time)) {
      return "";
    }

    // Bucket by minute to collapse near-identical copies across sources.
    return String(Math.floor(time / 60000));
  }

  async loadArchives() {
    this.isLoading = true;

    try {
      this.archives = await this.getAllArchives();
      return this.createResult({ shouldRender: true });
    } finally {
      this.isLoading = false;
    }
  }

  getArchiveById(id) {
    const cachedItem = this.archives.find(
      (item, index) => this.getSessionId(item, index) === id
    );
    if (cachedItem) {
      return cachedItem;
    }

    const item = _getArchiveItem(id);
    if (!item) return null;

    return {
      ...item,
      novel: repository.getNovel(item.novelId) || null,
    };
  }

  getViewModel() {
    return {
      hero: {
        iconPath: ARCHIVE_ICON_PATH,
        heading: "SPIEL-ARCHIV",
        intro: ARCHIVE_INTRO,
      },
      stateMessage: this.getStateMessage(),
      entries: this.createEntryViewModels(),
    };
  }

  getStateMessage() {
    if (this.isLoading) {
      return ARCHIVE_STATE_MESSAGES.loading;
    }

    if (!this.archives.length) {
      return ARCHIVE_STATE_MESSAGES.empty;
    }

    return "";
  }

  async handleEvent(event) {
    if (event.type === "click") {
      return this.handleClick(event.target);
    }

    return this.createResult();
  }

  async handleClick(target) {
    const copyButton = target.closest("[data-action='copy-detail']");
    if (copyButton) {
      const sessionId = copyButton.getAttribute("data-session-id");
      const section = copyButton.getAttribute("data-section");
      if (sessionId && section) {
        const copied = await this.copyDetail(sessionId, section);
        return this.createResult({
          toastMessage: copied
            ? ARCHIVE_TOAST_MESSAGES.copySuccess
            : ARCHIVE_TOAST_MESSAGES.copyError,
        });
      }
      return this.createResult();
    }

    const detailToggle = target.closest("[data-action='toggle-detail']");
    if (detailToggle) {
      const detailKey = detailToggle.getAttribute("data-detail-key");
      if (detailKey && this.toggleState(this.detailState, detailKey)) {
        return this.createResult({ shouldRender: true });
      }
    }

    const sessionToggle = target.closest("[data-action='toggle-session']");
    if (sessionToggle) {
      const sessionKey = sessionToggle.getAttribute("data-session-key");
      if (sessionKey && this.toggleState(this.sessionState, sessionKey)) {
        return this.createResult({ shouldRender: true });
      }
    }

    const entryToggle = target.closest("[data-action='toggle-entry']");
    if (entryToggle) {
      const entryKey = entryToggle.getAttribute("data-entry-key");
      if (entryKey && this.toggleState(this.entryState, entryKey)) {
        return this.createResult({ shouldRender: true });
      }
    }

    const selectionButton = target.closest("[data-action='select-archive']");
    if (selectionButton) {
      const archiveId = selectionButton.getAttribute("data-session-id");
      const section = selectionButton.getAttribute("data-section");
      if (archiveId && section) {
        return this.createResult({
          selection: { archiveId, section },
        });
      }
    }

    return this.createResult();
  }

  createEntryViewModels() {
    if (!this.archives.length) {
      return [];
    }

    const groupedEntries = this.groupRows(this.archives);

    return groupedEntries.map((group, index) =>
      this.createEntryViewModel(group, index)
    );
  }

  groupRows(rows) {
    const grouped = new Map();

    for (const item of rows) {
      const novelKey = item.novel?.id || item.novelId || item.id || "__unknown";
      if (!grouped.has(novelKey)) {
        grouped.set(novelKey, []);
      }

      grouped.get(novelKey).push(item);
    }

    return Array.from(grouped.entries()).map(([novelKey, items]) => ({
      novelKey,
      items,
    }));
  }

  createEntryViewModel(group, index) {
    const firstItem = group.items[0];
    const entryKey = this.getEntryKey(group.novelKey);
    const colors = this.getEntryColors(firstItem, index);
    const sessions = [...group.items]
      .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt))
      .map((session) => this.createSessionViewModel(session, colors));

    return {
      key: entryKey,
      label:
        firstItem.novel?.title ||
        firstItem.title ||
        `Novel ${group.novelKey}`,
      count: sessions.length,
      expanded: this.isExpanded(this.entryState, entryKey),
      arrowIcon: this.getEntryArrow(this.entryState, entryKey),
      colors,
      sessions,
    };
  }

  createSessionViewModel(session, colors) {
    const sessionId = this.getSessionId(session);
    const sessionKey = this.getSessionKey(sessionId);

    return {
      id: sessionId,
      key: sessionKey,
      label: this.getSessionLabel(session),
      expanded: this.isExpanded(this.sessionState, sessionKey),
      arrowIcon: this.getEntryArrow(this.sessionState, sessionKey),
      colors,
      actions: ARCHIVE_ACTIONS.map((action) =>
        this.createActionViewModel(sessionId, session, action)
      ),
    };
  }

  createActionViewModel(sessionId, session, actionConfig) {
    const detailKey = this.getDetailKey(sessionId, actionConfig.section);
    const expanded = this.isExpanded(this.detailState, detailKey);

    return {
      ...actionConfig,
      detailKey,
      expanded,
      detail: actionConfig.toggleable
        ? this.createDetailViewModel(session, actionConfig.section, expanded)
        : null,
    };
  }

  createDetailViewModel(session, section, expanded) {
    if (section === "dialog") {
      return this.createDialogDetailViewModel(session, expanded);
    }

    if (section === "ki-feedback") {
      return this.createFeedbackDetailViewModel(session, expanded);
    }

    return {
      expanded,
      paragraphs: [],
      canCopy: false,
      copyAriaLabel: "",
      copyText: "",
    };
  }

  createDialogDetailViewModel(session, expanded) {
    const messages = this.getDialogMessages(session);
    if (!messages.length) {
      return {
        expanded,
        paragraphs: [
          {
            text: "Kein gespeicherter Dialog verfugbar.",
          },
        ],
        canCopy: false,
        copyAriaLabel: "",
        copyText: "",
      };
    }

    const endedEarly = this.isSessionEndedEarly(session);
    const paragraphs = messages.map((message) => ({
      speaker: this.getArchiveSpeakerLabel(message.speaker),
      text: message.text,
    }));

    if (endedEarly) {
      paragraphs.push({
        text: "Das Gesprach wurde vorzeitig beendet.",
        ended: true,
      });
    }

    return {
      expanded,
      paragraphs,
      canCopy: true,
      copyAriaLabel: "Dialog kopieren",
      copyText: this.getDialogCopyText(messages, endedEarly),
    };
  }

  createFeedbackDetailViewModel(session, expanded) {
    const feedbackText = this.getFeedbackText(session);
    const paragraphs = feedbackText
      .split(/\n\s*\n/g)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((text) => ({ text }));

    if (!paragraphs.length) {
      return {
        expanded,
        paragraphs: [
          {
            text: "Kein gespeichertes KI-Feedback verfugbar.",
          },
        ],
        canCopy: false,
        copyAriaLabel: "",
        copyText: "",
      };
    }

    return {
      expanded,
      paragraphs,
      canCopy: true,
      copyAriaLabel: "KI-Feedback kopieren",
      copyText: feedbackText,
    };
  }

  getDialogMessages(session) {
    return Array.isArray(session.history)
      ? session.history.filter(
          (message) =>
            message &&
            typeof message.text === "string" &&
            message.text.trim().length > 0
        )
      : [];
  }

  getFeedbackText(session) {
    if (typeof session.feedbackText === "string" && session.feedbackText.trim()) {
      return session.feedbackText.trim();
    }

    // Try archive-session specific feedback first
    if (session.id && this.aiFeedbackService.getFeedbackForArchive) {
      const archiveFeedback = this.aiFeedbackService.getFeedbackForArchive(session.id);
      if (
        archiveFeedback &&
        typeof archiveFeedback.text === "string" &&
        archiveFeedback.text.trim()
      ) {
        return archiveFeedback.text.trim();
      }
    }

    const storedFeedback = this.aiFeedbackService.getFeedbackForNovel(session.novelId);
    if (
      storedFeedback &&
      typeof storedFeedback.text === "string" &&
      storedFeedback.text.trim()
    ) {
      return storedFeedback.text.trim();
    }

    if (
      session.novel &&
      typeof session.novel.feedback === "string" &&
      session.novel.feedback.trim()
    ) {
      return session.novel.feedback.trim();
    }

    return this.aiFeedbackService
      .createPlaceholderFeedback({ novelId: session.novelId })
      .trim();
  }

  getDialogCopyText(messages, endedEarly) {
    const lines = messages.map((message) => {
      if (message.speaker) {
        return `${this.getArchiveSpeakerLabel(message.speaker)}: ${message.text}`;
      }

      return message.text;
    });

    if (endedEarly) {
      lines.push("Das Gesprach wurde vorzeitig beendet.");
    }

    return lines.join("\n\n");
  }

  isSessionEndedEarly(session) {
    const novel = session.novel || repository.getNovel(session.novelId);
    if (!novel || !session.currentEventId) {
      return false;
    }

    const currentEvent = novel.events.find(
      (event) => event.id === session.currentEventId
    );

    if (!currentEvent) {
      return false;
    }

    if (
      currentEvent.eventType === EVENT_TYPES.END ||
      currentEvent.eventType === EVENT_TYPES.FINAL
    ) {
      return false;
    }

    if (currentEvent.eventType === EVENT_TYPES.CHOICE) {
      return true;
    }

    const nextPlayableEventId = ChoiceService.resolvePlayableEventId(
      novel,
      currentEvent.nextId
    );

    return Boolean(nextPlayableEventId);
  }

  async copyDetail(sessionId, section) {
    const session = this.getArchiveById(sessionId);
    if (!session) {
      return false;
    }

    let text = "";
    if (section === "dialog") {
      const messages = this.getDialogMessages(session);
      if (!messages.length) {
        return false;
      }

      text = this.getDialogCopyText(messages, this.isSessionEndedEarly(session));
    }

    if (section === "ki-feedback") {
      text = this.getFeedbackText(session);
    }

    if (!text) {
      return false;
    }

    await this.copyTextToClipboard(text);
    return true;
  }

  async copyTextToClipboard(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (error) {
      // fall through to legacy copy support
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      // ignore legacy copy failures
    } finally {
      textarea.remove();
    }
  }

  formatArchiveLabel(archivedAt) {
    const date = new Date(archivedAt);
    const weekday = date
      .toLocaleDateString("de-DE", { weekday: "short" })
      .replace(/\.$/, "");
    const dateString = date.toLocaleDateString("de-DE");
    const timeString = date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${weekday} | ${dateString} | ${timeString}`;
  }

  getSessionLabel(session) {
    return this.formatArchiveLabel(session.archivedAt || session.updatedAt);
  }

  getEntryColors(item, index) {
    if (item.novel?.novelFrameColor && item.novel?.novelColor) {
      return {
        outer: item.novel.novelFrameColor,
        inner: item.novel.novelColor,
      };
    }

    const [outer, inner] =
      ARCHIVE_FALLBACK_PALETTE[index % ARCHIVE_FALLBACK_PALETTE.length];
    return { outer, inner };
  }

  getArchiveSpeakerLabel(speaker) {
    if (speaker === "System") {
      return "Info";
    }

    return speaker || "";
  }

  getEntryArrow(state, key) {
    return this.isExpanded(state, key)
      ? ARCHIVE_ENTRY_ARROWS.expanded
      : ARCHIVE_ENTRY_ARROWS.collapsed;
  }

  getEntryKey(novelKey) {
    return `entry:${novelKey}`;
  }

  getSessionId(session, fallbackIndex = 0) {
    if (session && session.id != null) {
      return String(session.id);
    }

    return `${session?.novelId || "archive"}:${session?.archivedAt || fallbackIndex}`;
  }

  getSessionKey(sessionId) {
    return `session:${sessionId}`;
  }

  getDetailKey(sessionId, section) {
    return `detail:${sessionId}:${section}`;
  }

  isExpanded(state, key) {
    return state[key] === true;
  }

  toggleState(state, key) {
    state[key] = !this.isExpanded(state, key);
    return true;
  }

  createResult({ shouldRender = false, selection = null, toastMessage = "" } = {}) {
    return {
      shouldRender,
      selection,
      toastMessage,
    };
  }

  removeArchive(id) {
    _removeArchiveItem(id);
  }
}

export function createArchiveService() {
  return new ArchiveService();
}

export const archiveService = new ArchiveService();
