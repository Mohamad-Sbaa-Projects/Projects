import "../components/TermsOfUseDynamic.js";

class TermsOfUseScreen extends HTMLElement {
	connectedCallback() {
		this.render();
	}

	render() {
		this.className = "terms-of-use-screen";
		this.replaceChildren();

		const container = document.createElement("section");
		container.className = "terms-of-use-screen__container";
		container.innerHTML = "<terms-of-use-dynamic></terms-of-use-dynamic>";
		this.appendChild(container);
	}
}

if (!customElements.get("terms-of-use-screen")) {
	customElements.define("terms-of-use-screen", TermsOfUseScreen);
}

export { TermsOfUseScreen };
