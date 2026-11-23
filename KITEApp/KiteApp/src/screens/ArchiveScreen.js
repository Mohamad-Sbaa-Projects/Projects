import "../components/ArchiveDynamic.js";

class ArchiveScreen extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.className = "archive-screen-host";
    this.replaceChildren();

    const root = document.createElement("div");
    root.className = "archive-root";

    const screen = document.createElement("main");
    screen.className = "archive-screen";

    const content = document.createElement("section");
    content.className = "archive-content";


    const archiveDynamic = document.createElement("archive-dynamic");
    content.appendChild(archiveDynamic);

    screen.appendChild(content);
    root.appendChild(screen);
    this.appendChild(root);
  }
}

if (!customElements.get("archive-screen")) {
  customElements.define("archive-screen", ArchiveScreen);
}
