import { novelSession } from "./novelSession.js";
import { StateManager } from "../../services/StateManager.js";

let installed = false;

export function setupUndoListeners() {
    if (installed) return;
    installed = true;

    document.addEventListener("novel-undo-confirmed", async (e) => {
        const lastChoiceId = novelSession.getLastChoice();
        if (!lastChoiceId) return;

        const snapshot = novelSession.popLastSnapshotFor(lastChoiceId);
        if (!snapshot) return;

        // Remove any existing popup instances so overlay cannot block clicks after restore
        const existingPopups = Array.from(document.querySelectorAll("novel-action-popup"));
        existingPopups.forEach(p => p.remove());

        // Restore state (StateManager.restoreSnapshot may be sync or async)
        await Promise.resolve(StateManager.restoreSnapshot(snapshot));

        // Give the browser a frame to update DOM / custom element lifecycle
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // Re-render player UI
        const player = document.querySelector("novel-player-view");
        if (player && typeof player.renderFromState === "function") {
            try {
                player.renderFromState();
            } catch (err) {
                console.error("Error in renderFromState after undo:", err);
            }
        }

        // Notify components they should reattach handlers or re-init interactive bits
        document.dispatchEvent(new CustomEvent("novel-undo-restored", {
            detail: { restoredChoiceId: lastChoiceId }
        }));
    });

    document.addEventListener("novel-undo-cancel", () => {
        const existing = document.querySelector("novel-action-popup");
        if (existing) existing.remove();
    });
}
