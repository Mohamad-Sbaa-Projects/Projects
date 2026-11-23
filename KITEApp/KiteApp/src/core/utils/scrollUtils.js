const DEFAULT_DRAG_THRESHOLD = 8;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clearSelection() {
  const selection = window.getSelection?.();
  if (selection && selection.type === "Range") {
    selection.removeAllRanges();
  }
}

export function setupHorizontalDragScroll(scrollElement, options = {}) {
  if (!scrollElement) {
    return () => {};
  }

  const dragThreshold = options.dragThreshold ?? DEFAULT_DRAG_THRESHOLD;
  const state = {
    pointerId: null,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    isDragging: false,
    shouldBlockClick: false,
  };

  const previousTouchAction = scrollElement.style.touchAction;
  const previousUserSelect = scrollElement.style.userSelect;
  const previousCursor = scrollElement.style.cursor;

  scrollElement.style.touchAction = "pan-x";
  scrollElement.style.userSelect = "none";
  scrollElement.style.cursor = "grab";

  const beginDrag = (event) => {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  const interactiveTarget = event.target.closest(
    "button, a, input, textarea, select, novel-hexagon, novel-action-popup"
  );

  if (interactiveTarget) {
    return;
  }

  if (state.pointerId !== null) {
    return;
  }

  state.pointerId = event.pointerId;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.startScrollLeft = scrollElement.scrollLeft;
  state.isDragging = false;
  state.shouldBlockClick = false;

  if (scrollElement.setPointerCapture) {
    scrollElement.setPointerCapture(event.pointerId);
  }

  scrollElement.style.cursor = "grabbing";
};

  const moveDrag = (event) => {
    if (state.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!state.isDragging) {
      if (distance < dragThreshold) {
        return;
      }

      state.isDragging = true;
      state.shouldBlockClick = true;
    }

    event.preventDefault();
    clearSelection();

    const maxScrollLeft = Math.max(scrollElement.scrollWidth - scrollElement.clientWidth, 0);
    scrollElement.scrollLeft = clamp(state.startScrollLeft - deltaX, 0, maxScrollLeft);
  };

  const endDrag = (event) => {
    if (state.pointerId !== event.pointerId) {
      return;
    }

    if (scrollElement.releasePointerCapture && scrollElement.hasPointerCapture?.(event.pointerId)) {
      scrollElement.releasePointerCapture(event.pointerId);
    }

    state.pointerId = null;
    state.isDragging = false;
    scrollElement.style.cursor = "grab";
  };

  const cancelDrag = (event) => {
    if (state.pointerId !== event.pointerId) {
      return;
    }

    if (scrollElement.releasePointerCapture && scrollElement.hasPointerCapture?.(event.pointerId)) {
      scrollElement.releasePointerCapture(event.pointerId);
    }

    state.pointerId = null;
    state.isDragging = false;
    scrollElement.style.cursor = "grab";
  };

  const blockClickAfterDrag = (event) => {
    if (!state.shouldBlockClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    state.shouldBlockClick = false;
  };

  scrollElement.addEventListener("pointerdown", beginDrag);
  scrollElement.addEventListener("pointermove", moveDrag);
  scrollElement.addEventListener("pointerup", endDrag);
  scrollElement.addEventListener("pointercancel", cancelDrag);
  scrollElement.addEventListener("lostpointercapture", cancelDrag);
  scrollElement.addEventListener("click", blockClickAfterDrag, true);

  return () => {
    scrollElement.removeEventListener("pointerdown", beginDrag);
    scrollElement.removeEventListener("pointermove", moveDrag);
    scrollElement.removeEventListener("pointerup", endDrag);
    scrollElement.removeEventListener("pointercancel", cancelDrag);
    scrollElement.removeEventListener("lostpointercapture", cancelDrag);
    scrollElement.removeEventListener("click", blockClickAfterDrag, true);

    scrollElement.style.touchAction = previousTouchAction;
    scrollElement.style.userSelect = previousUserSelect;
    scrollElement.style.cursor = previousCursor;
  };
}

export function smoothScrollToNormalized(scrollElement, normalizedPosition, duration = 300) {
  if (!scrollElement) {
    return () => {};
  }

  const maxScrollLeft = Math.max(
    scrollElement.scrollWidth - scrollElement.clientWidth,
    0
  );

  const targetLeft = clamp(normalizedPosition, 0, 1) * maxScrollLeft;

  if (maxScrollLeft === 0 || duration <= 0) {
    scrollElement.scrollLeft = targetLeft;
    return () => {};
  }

  const startLeft = scrollElement.scrollLeft;
  const startTime = performance.now();
  let frameId = 0;

  const animate = (time) => {
    const progress = clamp((time - startTime) / duration, 0, 1);

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    scrollElement.scrollLeft = startLeft + (targetLeft - startLeft) * eased;

    if (progress < 1) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  frameId = window.requestAnimationFrame(animate);

  return () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
  };
}

// This function is used to scroll a target element into the horizontal center of a scrollable container, with smooth animation.

export function smoothScrollElementIntoCenter(scrollElement, targetElement, duration = 300) {
  if (!scrollElement || !targetElement) {
    return () => {};
  }

  const maxScrollLeft = Math.max(
    scrollElement.scrollWidth - scrollElement.clientWidth,
    0
  );

  if (maxScrollLeft === 0) {
    return () => {};
  }

  const scrollRect = scrollElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const viewportCenterX = scrollRect.left + scrollRect.width / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const renderedScaleX = scrollRect.width / scrollElement.clientWidth || 1;

  /*
    Calculate how far the selected hexagon is from the viewport center.
    This distance is used to scroll the map before the popup is shown.
  */

  const distanceToCenter =
    (targetCenterX - viewportCenterX) / renderedScaleX;

  const targetScrollLeft = clamp(
    scrollElement.scrollLeft + distanceToCenter,
    0,
    maxScrollLeft
  );

  return smoothScrollToLeft(scrollElement, targetScrollLeft, duration);
}

// This function smoothly scrolls a container to a specific horizontal position (targetLeft) over a given duration. It returns a function that can be called to cancel the ongoing scroll animation if needed.

export function smoothScrollToLeft(scrollElement, targetLeft, duration = 300) {
  if (!scrollElement) {
    return () => {};
  }

  const maxScrollLeft = Math.max(
    scrollElement.scrollWidth - scrollElement.clientWidth,
    0
  );

  const safeTargetLeft = clamp(targetLeft, 0, maxScrollLeft);

  if (duration <= 0) {
    scrollElement.scrollLeft = safeTargetLeft;
    return () => {};
  }

  const startLeft = scrollElement.scrollLeft;
  const distance = safeTargetLeft - startLeft;

  if (Math.abs(distance) < 0.5) {
    scrollElement.scrollLeft = safeTargetLeft;
    return () => {};
  }

  const startTime = performance.now();
  let frameId = 0;

  /*
    Animate the horizontal scroll movement.
    This creates a smooth transition to the selected hexagon before the popup opens.
  */

  const animate = (time) => {
    const progress = clamp((time - startTime) / duration, 0, 1);

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    scrollElement.scrollLeft = startLeft + distance * eased;

    if (progress < 1) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  frameId = window.requestAnimationFrame(animate);

  return () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }
  };
}


export function centerHorizontalScroll(scrollElement, duration = 0) {
  return smoothScrollToNormalized(scrollElement, 0.5, duration);
}
