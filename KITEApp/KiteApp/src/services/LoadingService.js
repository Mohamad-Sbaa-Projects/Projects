import { repository } from "../services/DataRepository.js";

export async function startLoading(element) {
    const interval = setInterval(() => {
      if (element.progress < 90) {
        element.progress += Math.random() * 10;
        updateProgress(element, element.querySelector("#progress-bar"));
      }
    }, 150);

    try {
      await repository.init();
      
      element.progress = 100;
      updateProgress(element, element.querySelector("#progress-bar"));

      setTimeout(() => {
        clearInterval(interval);
        element.state = "start";
        element.render();
      }, 600);

    } catch (error) {
      console.error("Loading failed:", error);
      clearInterval(interval);
    }
  }

function updateProgress(element, progressBar) {
  if (progressBar) {
    progressBar.style.width = `${Math.min(element.progress, 100)}%`;
  }
}