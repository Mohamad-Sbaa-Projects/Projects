import { DESCRIPTIONS_ACTIVATE, DESCRIPTIONS_DEACTIVATE } from "../data/textmaps.js";

export function updateExampleTextSize(exampleText, slider, baseSizePx) {
  if (!exampleText || !slider) {
    return;
  }
  const sliderValue = Number(slider.value);

  const minSizePx = baseSizePx * (2 / 3);
  const maxSizePx = baseSizePx * (3 / 3);
  const nextSizePx = minSizePx + ((maxSizePx - minSizePx) * sliderValue) / 100;

  exampleText.style.fontSize = `${nextSizePx}px`;
}

export function toggleInfoBox(obj, btnId, switchBtn) {
  playSfx('public_assets/_AudioResources/SFX_Textpopup_2.wav');

  if(btnId === "changeFontSize") {
    applyNewFontSize();
    const infoBox = document.createElement("information-box");
    infoBox.btnId = btnId;
    infoBox.switchBtn = switchBtn;
    obj.appendChild(infoBox);
    infoBox.classList.remove("hidden");
    document.querySelectorAll(".switch-container").forEach((switchContainer) => {
      switchContainer.style.pointerEvents = "none";
    });
    document.querySelectorAll("input[type='range']").forEach((slider) => {
      slider.style.pointerEvents = "none";
    }); 
    document.querySelector(".submit-text-size").style.pointerEvents = "none";
    document.querySelectorAll("screen-router").forEach((router) => {
      router.style.overflow = "hidden";
    });
  }
  else {
    const infoBox = document.createElement("information-box");
    infoBox.btnId = btnId;
    infoBox.switchBtn = switchBtn;

    obj.appendChild(infoBox);
    infoBox.classList.remove("hidden");
    document.querySelectorAll(".switch-container").forEach((switchContainer) => {
      switchContainer.style.pointerEvents = "none";
    });
    document.querySelectorAll("input[type='range']").forEach((slider) => {
      slider.style.pointerEvents = "none";
    });
    document.querySelector(".submit-text-size").style.pointerEvents = "none";
    document.querySelectorAll("screen-router").forEach((router) => {
      router.style.overflow = "hidden";
    });
    try {
      const checkbox = obj.querySelector("input[type='checkbox']");
      const slider = obj.querySelector("input[type='range']");

      if (!checkbox || !slider) {
        return;
      }
      
      if (checkbox.checked) {
        slider.value = 100;
      } else {
        slider.value = 0;
      }
    } catch (error) {
      console.warn("Checkbox oder Slider konnte nicht gesetzt werden:", error);
    }
  }
}

export function saveAndLoadSettings(btnId, checkbox, element) {
  const key = `settings:${btnId || 'switch'}:switch`;
  
  const stored = localStorage.getItem(key);
  const defaultValue = btnId === "aktivateSound" ? true : false;

  checkbox.checked = stored !== null ? stored === 'true' : defaultValue;

  const box = element.closest("settings-box");
  if (checkbox.checked) {
    box?.classList.remove("disabled");
  } else {
    box?.classList.add("disabled");
  }

  if (btnId === "aktivateSound") {
    const soundRange = element.querySelector("input[type='range']");
    if (soundRange) {
      const savedVolume = localStorage.getItem(`settings:${btnId}:slider`);
      if (checkbox.checked) {
        soundRange.disabled = false;
        soundRange.value = savedVolume !== null ? Number(savedVolume) : Number(soundRange.value) || 50;
      } else {
        soundRange.value = 0;
        soundRange.disabled = true;
      }
    }
  }
  checkbox.addEventListener('change', () => {
    try {
      localStorage.setItem(key, String(checkbox.checked));

      const box = element.closest("settings-box");
      if (checkbox.checked) {
        box?.classList.remove("disabled");
      } else {
        box?.classList.add("disabled");
      }

      if (btnId === "aktivateSound") {
        const soundRange = element.querySelector("input[type='range']");
        if (!soundRange) {
          return;
        }

        if (checkbox.checked) {
          soundRange.disabled = false;
          const savedVolume = localStorage.getItem(`settings:${btnId}:slider`);
          soundRange.value = savedVolume !== null ? Number(savedVolume) : 50;
        } else {
          soundRange.value = 0;
          soundRange.disabled = true;
        }
      }
    } catch (e) {
      console.warn('Could not save switch state to localStorage', e);
    }
  });
}

export function saveAndLoadText(btnId, textSizeSlider, exampleText) {
  textSizeSlider.min = 0;
  textSizeSlider.max = 100;

  const storageKey = `settings:${btnId || 'textSize'}:slider`;
  const saved = localStorage.getItem(storageKey);
  const startValue = saved !== null ? Number(saved) : 0;
  textSizeSlider.value = startValue;

  const baseSizePx = Number.parseFloat(window.getComputedStyle(exampleText).fontSize) || 16;
  updateExampleTextSize(exampleText, textSizeSlider, baseSizePx);
  textSizeSlider.addEventListener("input", () => {
    updateExampleTextSize(exampleText, textSizeSlider, baseSizePx);
    try {
      setFontSize(Number(textSizeSlider.value));
    } catch (e) {
      console.warn('Could not save text size to localStorage', e);
    }
  });
}

export function saveAndLoadSound(btnId, element) {
  const soundSlider =document.createElement("settings-slider");
  soundSlider.setAttribute("iconSrc", "./public_assets/images/_Images/IconsAndLogos/Icon_Soundeffect.png");
  element.appendChild(soundSlider);

  const soundRange = soundSlider.querySelector("input[type='range']");
  const soundKey = `settings:${btnId || 'sound'}:slider`;
  if (soundRange) {
    soundRange.min = 0;
    soundRange.max = 100;
    const saved = localStorage.getItem(soundKey);
    soundRange.value = saved !== null ? Number(saved) : 100;
    soundRange.addEventListener('input', () => {
      try {
        setSoundVolume(Number(soundRange.value));
      } catch (e) {
        console.warn('Could not save sound setting to localStorage', e);
      }
    });
  }
}

export function getDescriptionText(btnId, switchInput, description) {
  if (switchInput?.checked) {
    description.textContent = DESCRIPTIONS_ACTIVATE.get(btnId);
  } 
  else if (switchInput) {
    description.textContent = DESCRIPTIONS_DEACTIVATE.get(btnId);
  } 
  else {
    description.textContent = DESCRIPTIONS_DEACTIVATE.get(btnId) || "Einstellung wurde geändert.";;
  }
}

export function hideInfoBox(btn, element) {
  btn.addEventListener("click", () => {
    element.style.display = "none";
    document.querySelectorAll(".switch-container").forEach((switchContainer) => {
      switchContainer.style.pointerEvents = "auto";
    });
    document.querySelectorAll("input[type='range']").forEach((slider) => {
      slider.style.pointerEvents = "auto";
    });
    document.querySelectorAll("screen-router").forEach((router) => {
      router.style.overflow = "auto";
    }); 
    document.querySelector(".submit-text-size").style.pointerEvents = "auto";
  });
}

export function isReadDialogueEnabled() {
  return (localStorage.getItem("settings:readDialogue:switch") ?? "false")  === "true";
}

let germanVoice = null;

function getGermanVoice() {
  if (germanVoice) {
    return germanVoice;
  }

  const voices = window.speechSynthesis.getVoices();

  germanVoice =
    voices.find(v => v.lang?.startsWith("de"))
    ?? voices[0]
    ?? null;

  return germanVoice;
}

window.speechSynthesis.addEventListener("voiceschanged", () => {
  germanVoice = null;
  window.speechSynthesis.getVoices();
});

export function stopSpeech() {
  window.speechSynthesis.cancel();
}

export function speak(text) {
  if (!isReadDialogueEnabled()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "de-DE";

    const voice = getGermanVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function applyNewFontSize() {

  const sliderValue = Number(localStorage.getItem("settings:changeFontSize:slider") || 0);
  const minSizePx = 24 * (2 / 3);
  const maxSizePx = 24 * (3 / 3);
  const nextSizePx = minSizePx + ((maxSizePx - minSizePx) * sliderValue) / 100;

  document.documentElement.style.setProperty("--font-settings", `${nextSizePx}px`);
}


function getSoundVolume() {
  return Number(localStorage.getItem("settings:aktivateSound:slider") ?? 100);
}

function isSoundEnabled() {
  return (localStorage.getItem("settings:aktivateSound:switch") ?? "true")  === "true";
}

export function playSfx(src) {
  if (!isSoundEnabled()) {
    return;
  }

  const audio = new Audio(src);
  audio.volume = getSoundVolume() / 100;
  audio.play().catch(error => {
    console.warn("Could not play sound:", error);
  });
}

function dispatchSettingsChanged(setting, value) {
  window.dispatchEvent(
    new CustomEvent("app:settings-changed", {
      detail: { setting, value }
    })
  );
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(
    "settings:aktivateSound:switch",
    String(enabled)
  );

  dispatchSettingsChanged("soundEnabled", enabled);
}

export function setSoundVolume(volume) {
  localStorage.setItem(
    "settings:aktivateSound:slider",
    String(volume)
  );

  dispatchSettingsChanged("soundVolume", volume);
}

export function setReadDialogueEnabled(enabled) {
  localStorage.setItem(
    "settings:readDialogue:switch",
    String(enabled)
  );

  dispatchSettingsChanged("readDialogue", enabled);
}

export function setFontSize(value) {
  localStorage.setItem(
    "settings:changeFontSize:slider",
    String(value)
  );

  dispatchSettingsChanged("fontSize", value);
}