import {
	createPlaceholderFeedback,
	getLatestFeedback,
	setLatestFeedback,
	setFeedbackForNovel,
	setFeedbackForArchive,
	getFeedbackForArchive,
	loadApiKey,
	generateAiFeedback
} from "../services/AiFeedbackService.js";
import { repository } from "../services/DataRepository.js";
import { _getAllArchiveIds, _getArchiveItem, updateArchiveItem } from "../services/StorageService.js";

class AiFeedbackScreen extends HTMLElement {
	constructor() {
		super();

		this.feedbackText = null;
		this.isLoading = false;
		this.hasError = false;
		this.showNotice = false;
		this.errorMessage = "";

		const latest = getLatestFeedback();
		if (latest && latest.isPlaceholder === true) {
			const archiveId = latest.archiveId;
			let existingFeedback = null;
			if (archiveId) {
				const archiveItem = _getArchiveItem(archiveId);
				if (archiveItem && typeof archiveItem.feedbackText === "string" && archiveItem.feedbackText.trim()) {
					existingFeedback = archiveItem.feedbackText;
				} else {
					const cached = getFeedbackForArchive(archiveId);
					if (cached && typeof cached.text === "string" && cached.text.trim() && !cached.isPlaceholder) {
						existingFeedback = cached.text;
					}
				}
			}

			if (existingFeedback) {
				this.feedbackText = existingFeedback;
				this.isLoading = false;
			} else {
				this.isLoading = true;
			}
		}

		this._handleBack = this._handleBack.bind(this);
		this._handleCopy = this._handleCopy.bind(this);
	}

	connectedCallback() {
		this.render();
		this.initFeedback();
	}

	disconnectedCallback() {
		const backButtons = this.querySelectorAll("[data-action='back']");
		for (const button of backButtons) {
			button.removeEventListener("click", this._handleBack);
		}

		const copyButton = this.querySelector("[data-action='copy']");
		if (copyButton) {
			copyButton.removeEventListener("click", this._handleCopy);
		}
	}

	_handleBack() {
		window.location.hash = "/auswahl";
	}

	async _handleCopy() {
		const textToCopy = this._getFeedbackText();

		try {
			if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
				await navigator.clipboard.writeText(textToCopy);
				return;
			}
		} catch (error) {
			// fall through to legacy copy
		}

		// Legacy fallback (no UI changes / success toast; just best-effort copy).
		const textarea = document.createElement("textarea");
		textarea.value = textToCopy;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.top = "-9999px";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand("copy");
		} catch (error) {
			// ignore
		} finally {
			textarea.remove();
		}
	}

	_getFeedbackText() {
		if (typeof this.feedbackText === "string" && this.feedbackText.trim().length > 0) {
			return this.feedbackText;
		}

		const latest = getLatestFeedback();
		if (latest && typeof latest.text === "string" && latest.text.trim().length > 0) {
			return latest.text;
		}

		return createPlaceholderFeedback({ novelId: latest?.novelId });
	}

	async initFeedback() {
		const latest = getLatestFeedback();
		if (!latest) return;

		// Check if we already have the real feedback loaded in constructor
		if (this.feedbackText && latest.isPlaceholder === true) {
			const payload = {
				novelId: latest.novelId,
				archiveId: latest.archiveId || "",
				text: this.feedbackText,
				createdAt: new Date().toISOString(),
				isPlaceholder: false,
			};
			setLatestFeedback(payload);
			if (latest.archiveId) {
				setFeedbackForArchive(latest.archiveId, payload);
				const archiveItem = _getArchiveItem(latest.archiveId);
				if (archiveItem && (!archiveItem.feedbackText || !archiveItem.feedbackText.trim())) {
					updateArchiveItem(latest.archiveId, { feedbackText: this.feedbackText });
				}
			}
			this.isLoading = false;
			this.render();
			return;
		}

		// Also check if we can fetch it now (in case it wasn't loaded in constructor)
		const archiveId = latest.archiveId;
		if (archiveId) {
			const archiveItem = _getArchiveItem(archiveId);
			if (archiveItem && typeof archiveItem.feedbackText === "string" && archiveItem.feedbackText.trim()) {
				this.feedbackText = archiveItem.feedbackText;
				const payload = {
					novelId: latest.novelId,
					archiveId: archiveId,
					text: this.feedbackText,
					createdAt: new Date().toISOString(),
					isPlaceholder: false,
				};
				setLatestFeedback(payload);
				setFeedbackForArchive(archiveId, payload);
				this.isLoading = false;
				this.render();
				return;
			}
			const cached = getFeedbackForArchive(archiveId);
			if (cached && typeof cached.text === "string" && cached.text.trim() && !cached.isPlaceholder) {
				this.feedbackText = cached.text;
				const payload = {
					novelId: latest.novelId,
					archiveId: archiveId,
					text: this.feedbackText,
					createdAt: new Date().toISOString(),
					isPlaceholder: false,
				};
				setLatestFeedback(payload);
				setFeedbackForArchive(archiveId, payload);
				this.isLoading = false;
				this.render();
				return;
			}
		}

		// If it's already a real feedback, we don't need to load again.
		if (latest.isPlaceholder === false) {
			return;
		}

		// Try to load the API Key
		const apiKey = await loadApiKey();
		if (!apiKey || apiKey === "your_api_key_here") {
			// Key is missing or placeholder, show the instruction notice.
			this.showNotice = true;
			this.isLoading = false;
			this.render();
			return;
		}

		// Start loading
		this.isLoading = true;
		this.hasError = false;
		this.render();

		try {
			await repository.init();
			const novel = repository.getNovel(latest.novelId);

			// Retrieve the game transcript from the specified archive entry or fall back to the latest one
			const targetArchiveId = latest.archiveId || (_getAllArchiveIds().length ? _getAllArchiveIds()[_getAllArchiveIds().length - 1] : null);
			const archiveItem = targetArchiveId ? _getArchiveItem(targetArchiveId) : null;
			
			let history = [];
			if (archiveItem && String(archiveItem.novelId) === String(latest.novelId)) {
				history = archiveItem.history || [];
			}

			const realFeedback = await generateAiFeedback(novel, history, apiKey);

			if (targetArchiveId && archiveItem && String(archiveItem.novelId) === String(latest.novelId)) {
				updateArchiveItem(targetArchiveId, { feedbackText: realFeedback });
			}

			const payload = {
				novelId: latest.novelId,
				archiveId: targetArchiveId || "",
				text: realFeedback,
				createdAt: new Date().toISOString(),
				isPlaceholder: false,
			};
			setLatestFeedback(payload);
			if (targetArchiveId) {
				setFeedbackForArchive(targetArchiveId, payload);
			} else {
				setFeedbackForNovel(latest.novelId, payload);
			}

			this.feedbackText = realFeedback;
			this.isLoading = false;
			this.render();
		} catch (error) {
			console.error("Fehler bei der Generierung des KI-Feedbacks:", error);
			this.isLoading = false;
			this.hasError = true;
			this.errorMessage = error.message || "Unbekannter Fehler";
			this.render();
		}
	}

	_createBackButton() {
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.action = "back";
		button.className = "ai-feedback__button";
		button.textContent = "SCHLIESSEN UND IM ARCHIV SPEICHERN";
		return button;
	}

	_createCopyButton() {
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.action = "copy";
		button.className = "ai-feedback__copy";
		button.setAttribute("aria-label", "Kopieren");

		const svgNs = "http://www.w3.org/2000/svg";
		const icon = document.createElementNS(svgNs, "svg");
		icon.setAttribute("class", "ai-feedback__copy-icon");
		icon.setAttribute("viewBox", "0 0 24 24");
		icon.setAttribute("fill", "none");
		icon.setAttribute("aria-hidden", "true");

		const path1 = document.createElementNS(svgNs, "path");
		path1.setAttribute("d", "M9 9H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3");
		path1.setAttribute("stroke", "currentColor");
		path1.setAttribute("stroke-width", "2");
		path1.setAttribute("stroke-linecap", "round");
		path1.setAttribute("stroke-linejoin", "round");

		const path2 = document.createElementNS(svgNs, "path");
		path2.setAttribute("d", "M14 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z");
		path2.setAttribute("stroke", "currentColor");
		path2.setAttribute("stroke-width", "2");
		path2.setAttribute("stroke-linecap", "round");
		path2.setAttribute("stroke-linejoin", "round");

		icon.append(path1, path2);

		const label = document.createElement("span");
		label.className = "ai-feedback__copy-label";
		label.textContent = "Kopieren";

		button.append(icon, label);
		return button;
	}

	render() {
		this.className = "";
		this.replaceChildren();

		const section = document.createElement("section");
		section.className = "ai-feedback";

		const header = document.createElement("header");
		header.className = "ai-feedback__header";
		const title = document.createElement("h1");
		title.className = "ai-feedback__title";
		title.textContent = "KI-Analyse";

		const headerBackBtn = this._createBackButton();
		header.append(title, headerBackBtn);

		const content = document.createElement("main");
		content.className = "ai-feedback__content";
		content.setAttribute("aria-label", "Feedback");

		if (this.isLoading) {
			const loadingContainer = document.createElement("div");
			loadingContainer.className = "ai-feedback__loading-container";
			
			const spinner = document.createElement("div");
			spinner.className = "ai-feedback__spinner";
			
			const loadingText = document.createElement("p");
			loadingText.className = "ai-feedback__loading-text";
			loadingText.textContent = "KI-Analyse wird generiert...";
			
			loadingContainer.append(spinner, loadingText);
			content.appendChild(loadingContainer);
		} else if (this.hasError) {
			const errorBanner = document.createElement("div");
			errorBanner.className = "ai-feedback__error-banner";
			
			const errorText = document.createElement("p");
			errorText.className = "ai-feedback__error-text font-semibold";
			errorText.textContent = `Die Live-Analyse ist fehlgeschlagen (${this.errorMessage}). Es wird die standardmäßige Analyse angezeigt.`;
			
			errorBanner.appendChild(errorText);
			content.appendChild(errorBanner);

			const feedback = document.createElement("div");
			feedback.className = "ai-feedback__text";
			feedback.textContent = this._getFeedbackText();
			content.appendChild(feedback);
		} else {
			if (this.showNotice) {
				const noticeBanner = document.createElement("div");
				noticeBanner.className = "ai-feedback__notice-banner";
				
				noticeBanner.innerHTML = `
					<svg class="ai-feedback__notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:20px;height:20px;flex-shrink:0;">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="16" x2="12" y2="12"></line>
						<line x1="12" y1="8" x2="12.01" y2="8"></line>
					</svg>
					<span class="ai-feedback__notice-text">
						Hinweis: Trage einen Gemini-API-Key in der <code>.env</code>-Datei ein, um eine echte KI-Analyse deines Gesprächsverlaufs zu erhalten.
					</span>
				`;
				content.appendChild(noticeBanner);
			}

			const feedback = document.createElement("div");
			feedback.className = "ai-feedback__text";
			feedback.textContent = this._getFeedbackText();
			content.appendChild(feedback);
		}

		const footer = document.createElement("footer");
		footer.className = "ai-feedback__footer";
		const disclaimer = document.createElement("p");
		disclaimer.className = "ai-feedback__disclaimer";
		disclaimer.textContent = "Hinweis: Analyse und Feedback wurden durch KI künstlich erzeugt. Eine individuelle Beratung wird hierdurch nicht ersetzt.";
		
		const copyBtn = this._createCopyButton();
		const footerBackBtn = this._createBackButton();
		
		if (this.isLoading) {
			headerBackBtn.disabled = true;
			footerBackBtn.disabled = true;
			copyBtn.disabled = true;
		}

		footer.append(disclaimer, copyBtn, footerBackBtn);

		section.append(header, content, footer);
		this.appendChild(section);

		if (!this.isLoading) {
			headerBackBtn.addEventListener("click", this._handleBack);
			footerBackBtn.addEventListener("click", this._handleBack);
			copyBtn.addEventListener("click", this._handleCopy);
		}
	}
}

if (!customElements.get("ai-feedback-screen")) {
	customElements.define("ai-feedback-screen", AiFeedbackScreen);
}

export { AiFeedbackScreen };
