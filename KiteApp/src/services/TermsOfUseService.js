import { hasAcceptedTerms, setAcceptedTerms } from "./LegalService.js";

const TERMS_OF_USE_SECTIONS = [
	{ sectionKey: "terms", label: "Nutzungsbedingungen", pageId: "nutzungsbedingungen" },
	{ sectionKey: "privacy", label: "Datenschutzerklärung", pageId: "datenschutz" },
	{ sectionKey: "imprint", label: "Impressum", pageId: "impressum" },
];

const TERMS_OF_USE_CHECKBOXES = [
	{
		key: "terms",
		text: "Ich stimme den Nutzungsbedingungen zu.",
	},
	{
		key: "privacy",
		text: "Ich habe die Datenschutzerklärung zur Kenntnis genommen und gesehen, dass die App KITE maximal datensparsam ist.",
	},
];

function createExpandedSectionsState() {
	return TERMS_OF_USE_SECTIONS.reduce((state, section) => {
		state[section.sectionKey] = false;
		return state;
	}, {});
}

export class TermsOfUseService {
	constructor() {
		this.expandedSections = createExpandedSectionsState();
		this.checkboxState = {
			terms: false,
			privacy: false,
		};
	}

	shouldSkipScreen() {
		return hasAcceptedTerms();
	}

	getViewModel() {
		return {
			sections: this.getSections().map((section) => ({
				...section,
				expanded: this.isSectionExpanded(section.sectionKey),
			})),
			checkboxes: this.getCheckboxes(),
			canContinue: this.canContinue(),
		};
	}

	getSections() {
		return TERMS_OF_USE_SECTIONS;
	}

	getCheckboxes() {
		return TERMS_OF_USE_CHECKBOXES.map((checkbox) => ({
			...checkbox,
			checked: this.isCheckboxChecked(checkbox.key),
		}));
	}

	isSectionExpanded(sectionKey) {
		return this.expandedSections[sectionKey] === true;
	}

	toggleSection(sectionKey) {
		if (!Object.prototype.hasOwnProperty.call(this.expandedSections, sectionKey)) {
			return false;
		}

		this.expandedSections[sectionKey] = !this.expandedSections[sectionKey];
		return true;
	}

	isCheckboxChecked(key) {
		return this.checkboxState[key] === true;
	}

	setCheckboxState(key, checked) {
		if (!Object.prototype.hasOwnProperty.call(this.checkboxState, key)) {
			return false;
		}

		this.checkboxState[key] = checked === true;
		return true;
	}

	canContinue() {
		return this.isCheckboxChecked("terms") && this.isCheckboxChecked("privacy");
	}

	acceptTerms() {
		if (!this.canContinue()) {
			return false;
		}

		setAcceptedTerms(true);
		return true;
	}

	handleEvent(event) {
		if (event.type === "click") {
			return this.handleClick(event.target);
		}

		if (event.type === "change") {
			return this.handleChange(event.target);
		}

		return this.createResult();
	}

	handleClick(target) {
		const toggleButton = target.closest("[data-action='toggle-section']");
		if (toggleButton) {
			const sectionKey = toggleButton.getAttribute("data-section");
			if (sectionKey && this.toggleSection(sectionKey)) {
				return this.createResult({ shouldRender: true });
			}
		}

		const continueButton = target.closest("[data-action='continue']");
		if (continueButton && this.acceptTerms()) {
			return this.createResult({ accepted: true });
		}

		return this.createResult();
	}

	handleChange(target) {
		const checkbox = target.closest("input[type='checkbox'][data-checkbox]");
		if (!checkbox) {
			return this.createResult();
		}

		const key = checkbox.getAttribute("data-checkbox");
		if (key && this.setCheckboxState(key, checkbox.checked)) {
			return this.createResult({ shouldRender: true });
		}

		return this.createResult();
	}

	createResult({ shouldRender = false, accepted = false } = {}) {
		return {
			shouldRender,
			accepted,
		};
	}
}

export function createTermsOfUseService() {
	return new TermsOfUseService();
}