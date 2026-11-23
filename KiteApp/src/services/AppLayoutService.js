const DEFAULT_DESIGN_WIDTH = 450;
const DEFAULT_DESIGN_HEIGHT = 932;
const MOBILE_BREAKPOINT = 303;

function getViewportSize() {
  const viewport = window.visualViewport;

  return {
    width:
      viewport?.width ??
      document.documentElement.clientWidth ??
      window.innerWidth,
    height:
      viewport?.height ??
      document.documentElement.clientHeight ??
      window.innerHeight,
  };
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

export function createAppLayoutController({
  viewportElement,
  stageElement,
  designWidth = DEFAULT_DESIGN_WIDTH,
  designHeight = DEFAULT_DESIGN_HEIGHT,
}) {
  if (!viewportElement || !stageElement) {
    throw new Error(
      "AppLayoutController needs viewportElement and stageElement."
    );
  }

  let animationFrameId = null;

  function updateLayout() {
    animationFrameId = null;

    const { width, height } = getViewportSize();

    const widthScale = width / designWidth;
    const heightScale = height / designHeight;

    const hasCoarsePointer = window.matchMedia(
      "(pointer: coarse)"
    ).matches;

    const isMobile =
      width <= MOBILE_BREAKPOINT ||
      (hasCoarsePointer && Math.min(width, height) <= MOBILE_BREAKPOINT);

    const calculatedScale = isMobile
      ? Math.max(widthScale, heightScale)
      : Math.min(widthScale, heightScale);

    const scale =
      Number.isFinite(calculatedScale) && calculatedScale > 0
        ? calculatedScale
        : 1;

    const scaledHeight = round(designHeight * scale);
    const stageTop = 0;

    viewportElement.style.setProperty("--app-scale", String(scale));
    viewportElement.style.setProperty("--app-viewport-width", `${width}px`);
    viewportElement.style.setProperty("--app-viewport-height", `${height}px`);
    viewportElement.style.setProperty("--app-stage-top", `${stageTop}px`);

    stageElement.classList.toggle("kite-app-stage--mobile", isMobile);
    stageElement.classList.toggle("kite-app-stage--desktop", !isMobile);
  }

  function scheduleUpdate() {
    if (animationFrameId !== null) {
      return;
    }

    animationFrameId = window.requestAnimationFrame(updateLayout);
  }

  updateLayout();

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("orientationchange", scheduleUpdate);
  window.visualViewport?.addEventListener("resize", scheduleUpdate);

  return {
    update: updateLayout,

    destroy() {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.visualViewport?.removeEventListener(
        "resize",
        scheduleUpdate
      );
    },
  };
}