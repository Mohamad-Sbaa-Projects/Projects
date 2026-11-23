export class NovelSession {
    constructor() {
        this.lastSelectedChoiceId = null;
        this.undoStack = []; // { choiceId, snapshot }
    }

    recordChoice(choiceId, snapshot) {
        this.lastSelectedChoiceId = choiceId;
        this.undoStack.push({ choiceId, snapshot });
    }

    getLastChoice() {
        return this.lastSelectedChoiceId;
    }

    popLastSnapshotFor(choiceId) {
        const last = this.undoStack[this.undoStack.length - 1];
        if (last && last.choiceId === choiceId) {
            this.undoStack.pop();
            this.lastSelectedChoiceId = this.undoStack.length
                ? this.undoStack[this.undoStack.length - 1].choiceId
                : null;
            return last.snapshot;
        }
        return null;
    }
}

export const novelSession = new NovelSession();
