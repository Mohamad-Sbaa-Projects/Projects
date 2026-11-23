import "../components/NovelPlayerView.js";
import {playSfx} from "../services/SettingsService.js";

export class NovelPlayerScreen extends HTMLElement {
  static get observedAttributes() {
    return ["novel-id"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {

    playSfx('public_assets/_AudioResources/SFX_LoadScene.wav');

    const rawNovelId = this.getAttribute("novel-id");

    this.className = "relative block h-full w-full overflow-hidden";
    this.replaceChildren();

    const playerView = document.createElement("novel-player-view");

    if (rawNovelId !== null) {
      playerView.setAttribute("novel-id", rawNovelId);
    }

    this.appendChild(playerView);
  }
}

if (!customElements.get("novel-player-screen")) {
  customElements.define("novel-player-screen", NovelPlayerScreen);
}