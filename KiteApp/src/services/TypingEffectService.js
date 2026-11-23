import { isNovelPaused } from "../core/novel_pause.js";

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function applyTypingEffect(
  element,
  text,
  speed = 20,
  onCharacter = null
) {
  element.textContent = "";

  const characters = Array.from(String(text));

  for (const character of characters) {
    while (isNovelPaused()) {
      await wait(50);
    }

    if (!element.isConnected) {
      return;
    }

    element.textContent += character;
    onCharacter?.();

    await wait(speed);
  }
}