export class LinksScreen extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.classList.add("links-screen");

        const wrapper = document.createElement("div");
        wrapper.className = "links-wrapper";

        // Icon
        const icon = document.createElement("img");
        icon.src = "./public_assets/images/_Images/IconsAndLogos/Icon_Linklist.png";
        icon.alt = "Links Icon";
        icon.className = "link-icon";
        wrapper.appendChild(icon);

        // Title
        const title = document.createElement("h4");
        title.textContent = "WEITERFÜHRENDE LINKS";
        wrapper.appendChild(title);

        // Add all link sections
        wrapper.appendChild(
            this.createLinkSection(
                "KITE auf Linkedin",
                "Raum für Austausch, Rückmeldungen und weitere Informationen rund um die KITE App.",
                "https://www.linkedin.com/groups/16301070/",
                "./public_assets/images/_Images/IconsAndLogos/Linkedin-Triffuns.png"
            )
        );

        wrapper.appendChild(
            this.createLinkSection(
                "Bundesweite Gründerinnenagentur",
                "Die bga ist das zentrale Netzwerk für Gründerinnen in Deutschland.\n" +
                "Auf dem Netzwerkportal findest du Informationen, Beratungsmöglichkeiten, Veranstaltungen und Kontakte zu Expertinnen.\n" +
                "Ob du dich gerade in der Planung befindest oder bereits gegründet hast – die bga unterstützt dich mit Wissen, Inspiration und Vernetzung.",
                "https://www.gruenderinnenagentur.de/home",
                "./public_assets/images/_Images/IconsAndLogos/Logo_BGA.png"
            )
        );

        wrapper.appendChild(
            this.createLinkSection(
                "HHN Lab für Sozioinformatik",
                "Das Lab für Sozioinformatik erforscht, wie digitale Technologien unser Zusammenleben prägen - und wie sie gesellschaftlich verantwortungsvoll gestaltet werden können. In Projekten zu Themen wie KI, Gender und Partizipation entwickelt das Team praxisnahe Anwendungen, die soziale Wirkung entfalten.",
                "https://www.hs-heilbronn.de/de/lab-sozioinformatik",
                "./public_assets/images/_Images/IconsAndLogos/logo_hhn_lab.png"
            )
        );

        wrapper.appendChild(
            this.createLinkSection(
                "KITE-Projektseite",
                "Hier erfährst du mehr über die Hintergründe der App. KITE wurde im Rahmen eines Forschungsprojekts entwickelt, um Gründerinnen mit Kl-gestütztem Feedback zu unterstützen. Ziel ist es, Barrieren im Gründungsprozess sichtbar zu machen und Wege aufzuzeigen, sie zu überwinden. Gefördert vom Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend - gemeinsam mit der Hochschule Heilbronn und der bga.",
                "https://kite-bga.de/home",
                "./public_assets/images/_Images/IconsAndLogos/Logo_Kite.png"
            )
        );

        this.appendChild(wrapper);
    }

    createLinkSection(titleText, descriptionText, href, imgSrc) {
        const container = document.createElement("div");
        container.className = "link-container flex flex-col";

        const title = document.createElement("h5");
        title.textContent = titleText;

        const desc = document.createElement("p");
        desc.textContent = descriptionText;

        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = titleText;


        if (titleText === "KITE-Projektseite") {
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "img-wrapper-last";
            imgWrapper.appendChild(img);
            link.appendChild(imgWrapper);
        } else {
            link.appendChild(img);
        }

        container.appendChild(title);
        container.appendChild(desc);
        container.appendChild(link);

        return container;
    }
}
customElements.define("links-screen", LinksScreen);
