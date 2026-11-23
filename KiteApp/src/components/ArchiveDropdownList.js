const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class ArchiveDropdownList extends HTMLElement {
  set entries(value) {
    this._entries = Array.isArray(value) ? value : [];

    if (this.isConnected) {
      this.render();
    }
  }

  get entries() {
    return Array.isArray(this._entries) ? this._entries : [];
  }

  connectedCallback() {
    this.render();
  }

  createEntry(entry) {
    const wrapper = document.createElement("li");
    wrapper.className = "archive-entry-wrapper";

    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "archive-entry";
    entryButton.dataset.action = "toggle-entry";
    entryButton.dataset.entryKey = entry.key;
    entryButton.setAttribute("aria-expanded", entry.expanded ? "true" : "false");
    entryButton.style.setProperty("--archive-entry-outer", entry.colors.outer);
    entryButton.style.setProperty("--archive-entry-inner", entry.colors.inner);

    const label = document.createElement("div");
    label.className = "archive-entry__label";
    label.textContent = entry.label;

    const count = document.createElement("div");
    count.className = "archive-entry__count";
    count.textContent = String(entry.count);

    const arrow = document.createElement("img");
    arrow.className = "archive-entry__arrow";
    arrow.alt = "";
    arrow.setAttribute("aria-hidden", "true");
    arrow.src = entry.arrowIcon;

    entryButton.append(label, count, arrow);

    const dropdown = document.createElement("ul");
    dropdown.className = "archive-dropdown";
    dropdown.style.display = entry.expanded ? "block" : "none";

    for (const session of entry.sessions) {
      dropdown.appendChild(this.createSession(session));
    }

    wrapper.append(entryButton, dropdown);
    return wrapper;
  }

  createSession(session) {
    const item = document.createElement("li");
    item.className = "archive-dropdown__item";

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "archive-dropdown__pill";
    pill.dataset.action = "toggle-session";
    pill.dataset.sessionKey = session.key;
    pill.setAttribute("aria-expanded", session.expanded ? "true" : "false");
    pill.style.setProperty("--archive-entry-outer", session.colors.outer);
    pill.style.setProperty("--archive-entry-inner", session.colors.inner);

    const text = document.createElement("div");
    text.className = "archive-dropdown__pill-text";
    text.textContent = session.label;

    const arrowWrap = document.createElement("div");
    arrowWrap.className = "archive-dropdown__pill-arrow";

    const arrow = document.createElement("img");
    arrow.alt = "";
    arrow.setAttribute("aria-hidden", "true");
    arrow.src = session.arrowIcon;

    arrowWrap.appendChild(arrow);
    pill.append(text, arrowWrap);

    const actionList = document.createElement("ul");
    actionList.className = "archive-session-actions";
    actionList.style.display = session.expanded ? "block" : "none";
    actionList.style.setProperty("--archive-entry-outer", session.colors.outer);
    actionList.style.setProperty("--archive-entry-inner", session.colors.inner);

    for (const action of session.actions) {
      actionList.appendChild(this.createAction(session.id, action));
    }

    item.append(pill, actionList);
    return item;
  }

  createAction(sessionId, action) {
    const item = document.createElement("li");
    item.className = "archive-session-actions__item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-session-actions__button";
    button.dataset.section = action.section;
    button.dataset.sessionId = sessionId;

    if (action.toggleable) {
      button.dataset.action = "toggle-detail";
      button.dataset.detailKey = action.detailKey;
      button.classList.add("archive-session-actions__button--toggle");
      button.classList.toggle("is-open", action.expanded);
      button.setAttribute("aria-expanded", action.expanded ? "true" : "false");
    } else {
      button.dataset.action = "select-archive";
    }

    const label = document.createElement("span");
    label.className = "font-adjustable archive-session-actions__label";
    label.textContent = action.label;

    const arrow = document.createElement("img");
    arrow.className = "archive-session-actions__arrow";
    arrow.alt = "";
    arrow.setAttribute("aria-hidden", "true");
    arrow.src = "public_assets/images/_Images/DropDown/Arrow_Left.png";

    button.append(label, arrow);
    item.appendChild(button);

    if (action.detail) {
      const detailPanel = this.createDetailPanel(sessionId, action.section, action.detail);
      detailPanel.style.display = action.expanded ? "block" : "none";
      item.appendChild(detailPanel);
    }

    return item;
  }

  createDetailPanel(sessionId, section, detail) {
    const panel = document.createElement("div");
    panel.className = "archive-dialog-detail";

    for (const paragraphModel of detail.paragraphs) {
      const paragraph = document.createElement("p");
      paragraph.className = "archive-dialog-detail__message";

      if (paragraphModel.ended) {
        paragraph.classList.add("archive-dialog-detail__message--ended");
      }

      if (paragraphModel.speaker) {
        const speaker = document.createElement("strong");
        speaker.className = "archive-dialog-detail__speaker";
        speaker.textContent = `${paragraphModel.speaker}: `;
        paragraph.appendChild(speaker);
      }

      paragraph.appendChild(document.createTextNode(paragraphModel.text));
      panel.appendChild(paragraph);
    }

    if (detail.canCopy) {
      panel.appendChild(this.createCopyButton(sessionId, section, detail.copyAriaLabel));
    }

    return panel;
  }

  createCopyButton(sessionId, section, ariaLabel) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-dialog-detail__copy";
    button.dataset.action = "copy-detail";
    button.dataset.sessionId = sessionId;
    button.dataset.section = section;
    button.setAttribute("aria-label", ariaLabel);

    const icon = document.createElementNS(SVG_NAMESPACE, "svg");
    icon.setAttribute("class", "archive-dialog-detail__copy-icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("aria-hidden", "true");

    const backSheet = document.createElementNS(SVG_NAMESPACE, "rect");
    backSheet.setAttribute("x", "9");
    backSheet.setAttribute("y", "3");
    backSheet.setAttribute("width", "11");
    backSheet.setAttribute("height", "14");
    backSheet.setAttribute("rx", "1");
    backSheet.setAttribute("stroke", "currentColor");
    backSheet.setAttribute("stroke-width", "2");

    const frontSheet = document.createElementNS(SVG_NAMESPACE, "rect");
    frontSheet.setAttribute("x", "4");
    frontSheet.setAttribute("y", "8");
    frontSheet.setAttribute("width", "11");
    frontSheet.setAttribute("height", "13");
    frontSheet.setAttribute("rx", "1");
    frontSheet.setAttribute("stroke", "currentColor");
    frontSheet.setAttribute("stroke-width", "2");

    const label = document.createElement("span");
    label.className = "archive-dialog-detail__copy-label";
    label.textContent = "Kopieren";

    icon.append(backSheet, frontSheet);
    button.append(icon, label);
    return button;
  }

  render() {
    this.replaceChildren();

    const list = document.createElement("ul");
    list.className = "archive-list";

    for (const entry of this.entries) {
      list.appendChild(this.createEntry(entry));
    }

    this.appendChild(list);
  }
}

if (!customElements.get("archive-dropdown-list")) {
  customElements.define("archive-dropdown-list", ArchiveDropdownList);
}

export { ArchiveDropdownList };