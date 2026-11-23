import { repository } from "./DataRepository.js";

// NOTE: This module expects the running NovelPlayerView instance to hold the active state
// in a `novel-player-view` element (this.state). If your app stores state elsewhere,
// adapt getPlayerState() / setPlayerState() accordingly.

function getPlayerView() {
    return document.querySelector("novel-player-view");
}

function getPlayerState() {
    const pv = getPlayerView();
    return pv ? pv.state : null;
}

function setPlayerState(newState) {
    const pv = getPlayerView();
    if (pv) pv.state = newState;
}

export const StateManager = {
    // Read helpers used to create snapshots
    getCurrentNodeId() {
        const state = getPlayerState();
        return state ? state.currentEventId : null;
    },

    getVariablesSnapshot() {
        const state = getPlayerState();
        // If you have flags or other variables, include them here
        return state ? JSON.parse(JSON.stringify(state.flags ?? {})) : {};
    },

    getSelectedChoicesSnapshot() {
        const state = getPlayerState();
        return state ? JSON.parse(JSON.stringify(state.selectedChoices ?? [])) : [];
    },

    getHistorySnapshot() {
        const pv = getPlayerView();
        if (!pv || !pv.dialogueBoxElement || typeof pv.dialogueBoxElement.getHistory !== "function") {
            return null;
        }
        return pv.dialogueBoxElement.getHistory();
    },

    // Restore snapshot into the running player view
    restoreSnapshot(snapshot) {
        if (!snapshot) return;

        const pv = getPlayerView();
        if (!pv) return;

        // 1) Restore state fields
        // Keep novel and other metadata intact, only revert currentEventId, flags, selectedChoices
        pv.state.currentEventId = snapshot.nodeId ?? pv.state.currentEventId;
        pv.state.flags = snapshot.variables ?? {};
        pv.state.selectedChoices = snapshot.selectedChoices ?? [];

        // 2) Restore dialogue history if snapshot contains it
        // Store the restored history on state so the view can apply it at a safe time
        if (snapshot.history) {
            pv.state.savedHistory = snapshot.history;
            if (pv.dialogueBoxElement && typeof pv.dialogueBoxElement.setHistory === "function" && typeof pv.dialogueBoxElement.getHistory === "function") {
                // Apply intelligently: try to preserve earlier chat if current history contains the snapshot point
                try {
                    const current = pv.dialogueBoxElement.getHistory() || [];
                    const snap = snapshot.history || [];
                    let applied = false;

                    if (Array.isArray(current) && current.length > 0 && Array.isArray(snap) && snap.length > 0) {
                        const lastSnap = snap[snap.length - 1];
                        // try to match by eventId if present, else by text
                        const matchIndex = current.findIndex((m) => {
                            if (!m) return false;
                            if (lastSnap.eventId && m.eventId) return m.eventId === lastSnap.eventId;
                            return m.text === lastSnap.text;
                        });

                        if (matchIndex >= 0) {
                            // keep prefix up to matchIndex
                            const prefix = current.slice(0, matchIndex + 1);
                            pv.dialogueBoxElement.clearHistory();
                            pv.dialogueBoxElement.setHistory(prefix);
                            applied = true;
                        }
                    }

                    if (!applied) {
                        // fallback: replace with snapshot history
                        pv.dialogueBoxElement.clearHistory();
                        pv.dialogueBoxElement.setHistory(snap);
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn('StateManager: failed to intelligently apply snapshot history', e);
                    try {
                        pv.dialogueBoxElement.clearHistory();
                        pv.dialogueBoxElement.setHistory(snapshot.history);
                    } catch (e2) {
                        // noop
                    }
                }
            }
        }

        // 3) Mark restored event so ChoiceService.wasRestoredEvent can behave if needed
        pv.state.restoredCurrentEventId = pv.state.currentEventId;

        // 4) Any other cleanup (stop timers, audio) can be done here if required
    }
};
