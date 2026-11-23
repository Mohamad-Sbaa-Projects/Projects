export const BookmarkService = {
    STORAGE_KEY: "kite_saved_novels",

    getSaved() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
    },

    isSaved(id) {
        return this.getSaved().includes(id);
    },

    toggleSaved(id) {
        const saved = this.getSaved();
        const index = saved.indexOf(id);

        if (index >= 0) {
            saved.splice(index, 1);
        } else {
            saved.push(id);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
    }
};
