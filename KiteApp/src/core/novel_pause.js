let novelPaused = false;

export function isNovelPaused() {
  return novelPaused;
}

export function setNovelPaused(value) {
  novelPaused = Boolean(value);
} 