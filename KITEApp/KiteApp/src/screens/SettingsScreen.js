import "../components/SettingsBox.js";

class SettingsScreen extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.className = "settings-screen flex flex-col items-center justify-center p-6";
    this.replaceChildren();
    this.style.backgroundImage = "url('./public_assets/images/_Images/SceneBase/Background_Bright.png')";


    const settingsIcon = document.createElement("img");
    settingsIcon.src = "./public_assets/images/_Images/IconsAndLogos/Icon_Settings.png";
    settingsIcon.className = "settings-icon";
    settingsIcon.alt = "settings Icon";
    this.appendChild(settingsIcon);

    const title = document.createElement("h3");
    title.textContent = "EINSTELLUNGEN";
    title.className = "font-semibold my-2";
    this.appendChild(title);

    this.appendHeadlineBox("Audio-Optionen");

    const dialogeBox = document.createElement("settings-box");
    dialogeBox.btnId = "readDialogue";
    dialogeBox.iconSrc = "./public_assets/images/_Images/IconsAndLogos/Icon_Dialogue.png";
    dialogeBox.headlineText = "Dialoge vorlesen";
    dialogeBox.descriptionText = "Dieser Button schaltet die Sprachausgabe in den Visual Novels an bzw. aus. Ist die Sprachausgabe aktiviert, werden die Dialoge vertont und der Text, auf welchen du drückst, wird dir vorgelesen.";
    this.appendChild(dialogeBox);

    const soundBox = document.createElement("settings-box");
    soundBox.btnId = "aktivateSound";
    soundBox.iconSrc = "./public_assets/images/_Images/IconsAndLogos/Icon_Soundeffect.png";
    soundBox.headlineText = "Sounds aktivieren";
    soundBox.descriptionText = "Hier kannst du Soundeffekte der gesamten App aktivieren und ihre Lautstärke steuern, unabhängig von der Vorleselautstärke. Hinweis: Ist die Systemlautstarke auf 0 gestellt, oder der Stumm-Modus von iOS-Geräten aktiv, sind die Soundeffekte nicht hörbar.";
    soundBox.soundSlider = true;
    this.appendChild(soundBox);
   
    this.appendHeadlineBox("Textdarstellung");

    const fontBox = document.createElement("settings-box");
    fontBox.btnId = "changeFontSize";
    fontBox.iconSrc = "./public_assets/images/_Images/IconsAndLogos/Icon_Typesize.png";
    fontBox.headlineText = "Schriftgröße anpassen";
    fontBox.descriptionText = "Mit dem Regler kannst du die Schriftgröße für die meisten Texte in der App anpassen. An dem Beispieltext kannst du sehen, wie groß die Texte angezeigt werden, sobald du bestätigst.";
    fontBox.textCustomization = true;
    this.appendChild(fontBox);

    const versionInfo = document.createElement("p");
    versionInfo.className = "version-number";
    versionInfo.textContent = "Version: 1.6.3";
    this.appendChild(versionInfo);

  }
  appendHeadlineBox(text) {
    const options = document.createElement("div");
    options.className = "text-white w-full rounded p-2 orange-headline-box";
    options.textContent = text;
    this.appendChild(options);
  }
}

if (!customElements.get("settings-screen")) {
  customElements.define("settings-screen", SettingsScreen);
}
