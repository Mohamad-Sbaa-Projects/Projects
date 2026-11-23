import "./LegalTextView.js";
import { createTermsOfUseService } from "../services/TermsOfUseService.js";

const TOU_ARROW_ICONS = {
	collapsed: "public_assets/images/_Images/DropDown/Arrow_Right.png",
	expanded: "public_assets/images/_Images/DropDown/Arrow_Down.png",
};

class TermsOfUseDynamic extends HTMLElement {
	connectedCallback() {
		this.service ??= createTermsOfUseService();

		if (this.service.shouldSkipScreen()) {
			window.dispatchEvent(new CustomEvent("terms-accepted", { bubbles: true, composed: true }));
			return;
		}

		this.addEventListener("click", this);
		this.addEventListener("change", this);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this);
		this.removeEventListener("change", this);
	}

	handleEvent(event) {
		const result = this.service.handleEvent(event);
		if (result.shouldRender) {
			this.render();
		}

		if (result.accepted) {
			window.dispatchEvent(new CustomEvent("terms-accepted", { bubbles: true, composed: true }));
		}
	}

	createSectionRow({ sectionKey, label, pageId, expanded }) {
		const section = document.createElement("div");
		section.className = "tou-section";

		const toggleButton = document.createElement("button");
		toggleButton.type = "button";
		toggleButton.dataset.action = "toggle-section";
		toggleButton.dataset.section = sectionKey;
		toggleButton.setAttribute("aria-expanded", expanded ? "true" : "false");
		toggleButton.className = "tou-section__toggle";

		const labelSpan = document.createElement("span");
		labelSpan.textContent = label;

		const arrowSpan = document.createElement("span");
		arrowSpan.setAttribute("aria-hidden", "true");
		arrowSpan.className = "tou-section__arrow";

		const arrowIcon = document.createElement("img");
		arrowIcon.className = "tou-section__arrow-icon";
		arrowIcon.src = expanded ? TOU_ARROW_ICONS.expanded : TOU_ARROW_ICONS.collapsed;
		arrowIcon.alt = "";
		arrowIcon.setAttribute("aria-hidden", "true");

		arrowSpan.appendChild(arrowIcon);
		toggleButton.append(labelSpan, arrowSpan);
		section.appendChild(toggleButton);

		if (expanded) {
			const content = document.createElement("div");
			content.setAttribute("role", "region");
			content.setAttribute("aria-label", label);
			content.className = "tou-section__content";

			const textView = document.createElement("legal-text-view");
			textView.setAttribute("page", pageId);

			content.appendChild(textView);
			section.appendChild(content);
		}

		return section;
	}

	createCheckboxRow({ key, text, checked }) {
		const label = document.createElement("label");
		label.className = "tou-check";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.dataset.checkbox = key;
		checkbox.checked = checked;
		checkbox.className = "tou-check__box";

		const textNode = document.createElement("span");
		textNode.className = "tou-check__text";
		textNode.textContent = text;

		label.append(checkbox, textNode);
		return label;
	}

	createHeader(sectionsModel) {
		const header = document.createElement("div");
		header.className = "tou__header";

		const logo = document.createElement("img");
		logo.src = "public_assets/images/_Images/IconsAndLogos/Logo_Kite_Lettering_White.png";
		logo.alt = "kite";
		logo.className = "tou__logo";

		const sections = document.createElement("div");
		sections.className = "tou__sections";
		for (const section of sectionsModel) {
			sections.appendChild(this.createSectionRow(section));
		}

		header.append(logo, sections);
		return header;
	}

	createChecks(checkboxes) {
		const checks = document.createElement("div");
		checks.className = "tou__checks";
		checks.append(...checkboxes.map((checkbox) => this.createCheckboxRow(checkbox)));
		return checks;
	}

	createContinueButton(canContinue) {
		const continueButton = document.createElement("button");
		continueButton.type = "button";
		continueButton.dataset.action = "continue";
		continueButton.disabled = !canContinue;
		continueButton.className = "tou__continue";
		continueButton.setAttribute("aria-disabled", canContinue ? "false" : "true");
		continueButton.textContent = "WEITER";
		return continueButton;
	}

	render() {
		const viewModel = this.service.getViewModel();

		this.className = "tou";
		this.replaceChildren();

		const container = document.createElement("section");
		container.className = "tou__container";

		container.append(
			this.createHeader(viewModel.sections),
			this.createChecks(viewModel.checkboxes),
			this.createContinueButton(viewModel.canContinue)
		);

		this.appendChild(container);
	}
}

if (!customElements.get("terms-of-use-dynamic")) {
	customElements.define("terms-of-use-dynamic", TermsOfUseDynamic);
}

export { TermsOfUseDynamic };