const STORAGE_KEYS = {
	LATEST: "kite.aiFeedback.latest",
	BY_NOVEL_PREFIX: "kite.aiFeedback.byNovel.",
	BY_ARCHIVE_PREFIX: "kite.aiFeedback.byArchive.",
};

export function safeJsonParse(value) {
	if (!value) {
		return null;
	}

	try {
		return JSON.parse(value);
	} catch (error) {
		return null;
	}
}

export function getStorage() {
	return window.localStorage;
}

export function normalizeNovelId(novelId) {
	if (novelId === null || novelId === undefined) {
		return null;
	}
	return String(novelId);
}

export function setFeedbackForArchive(archiveId, payload) {
	const storage = getStorage();
	if (!archiveId) {
		return;
	}
	storage.setItem(`${STORAGE_KEYS.BY_ARCHIVE_PREFIX}${archiveId}`, JSON.stringify(payload));
}

export function getFeedbackForArchive(archiveId) {
	const storage = getStorage();
	if (!archiveId) {
		return null;
	}
	return safeJsonParse(storage.getItem(`${STORAGE_KEYS.BY_ARCHIVE_PREFIX}${archiveId}`));
}

export function createPlaceholderFeedback({ novelId } = {}) {
	const id = normalizeNovelId(novelId);
	
	if (id === "2") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Verzerrungen gegenüber Frauen mit Kindern (Gender Role Bias): Die geäußerte Sorge der Eltern bezüglich der Vereinbarkeit von Familie und Selbstständigkeit spiegelt das klassische Stereotyp wider, dass Frauen die Hauptverantwortung für die Kinderbetreuung tragen müssen. Du hast darauf hingewiesen, dass eine faire Aufteilung der Pflichten geplant ist.",
			"\n2. Skepsis gegenüber weiblicher Verhandlungskompetenz: Die Empfehlung des Vaters, Verhandlungen einem männlichen Partner zu überlassen, basiert auf dem Vorurteil, Frauen seien in Verhandlungen weniger durchsetzungsstark. Du hast deine eigene Kompetenz betont.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du bist ruhig und sachlich geblieben und hast emotionale Vorhaltungen deeskaliert.",
			"\n- Du hast klare Argumente für deine Selbstständigkeit und deine gute Vorbereitung vorgebracht.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Lass dich nicht durch veraltete Rollenerwartungen entmutigen.",
			"\n- Mache deutlich, dass du Verhandlungsführung als Kernkompetenz deiner Rolle siehst und diese selbstständig ausführst."
		].join("");
	}
	
	if (id === "3") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Fokus auf Äußerlichkeiten statt Kompetenz: Die Fragen der Journalistin zielten verstärkt auf deine Rolle als \"junge Gründerin\" und deine Work-Life-Balance ab, statt auf die technischen Innovationen deines Unternehmens. Dies lenkt den Fokus weg von deiner fachlichen Expertise.",
			"\n2. Double Standard in der Berichterstattung: Frauen in der Tech-Branche werden in Medien oft als Ausnahmeerscheinung oder primär emotional dargestellt. Du hast versucht, das Gespräch wieder auf die Sachebene zu lenken.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast geschickt die Brücke zurück zu deinen Unternehmenszielen und deiner fachlichen Expertise geschlagen.",
			"\n- Du hast professionelle Distanz gewahrt und bist nicht auf rein persönliche Fragen eingegangen.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Bereite vorab Kernbotschaften (Key Messages) vor, die du im Interview unabhängig von den Fragen platzieren möchtest.",
			"\n- Weise bei stereotypen Fragen höflich, aber bestimmt darauf hin, dass diese Fragen männlichen Kollegen selten gestellt werden."
		].join("");
	}
	
	if (id === "4") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Alters- und Geschlechtsbias (Mild-Patronizing): Die leicht herablassende Art bei Detailfragen zu den rechtlichen Aspekten der GmbH-Gründung zeigt, dass jungen Gründerinnen oft weniger juristisches Grundwissen zugetraut wird. Du konntest mit präzisen Begriffen antworten.",
			"\n2. Bürokratische Hürden und Kommunikationsbarrieren: Behörden- und Notarkontakte können durch fachspezifische Barrieren einschüchternd wirken.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast deine gründliche Vorbereitung durch die Verwendung von Fachbegriffen demonstriert.",
			"\n- Du hast dich nicht verunsichern lassen, sondern gezielt nach den nächsten konkreten Schritten gefragt.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Lass dich von juristischer Fachsprache nicht einschüchtern; frage im Zweifel immer nach einer verständlichen Erklärung.",
			"\n- Bereite alle Dokumente vorab lückenlos vor, um Vorurteilen bezüglich mangelnder Professionalität proaktiv zu begegnen."
		].join("");
	}
	
	if (id === "6") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Bonitäts- und Ernsthaftigkeitsbias: Vermieter neigen dazu, die finanzielle Tragfähigkeit von durch Frauen geführten Startups skeptischer zu bewerten. Im Gespräch wurde die langfristige Zahlungsfähigkeit stark hinterfragt.",
			"\n2. Unterschätzung des Wachstumspotenzials: Dem jungen Unternehmen wurde implizit weniger Skalierung zugetraut, indem kleinere, unpassende Räume angeboten wurden.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast deine Finanzplanung und dein Businessmodell selbstbewusst präsentiert.",
			"\n- Du hast klar formuliert, welche räumlichen Anforderungen für deine Wachstumspläne notwendig sind.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Halte für solche Termine stets ein kurzes, professionelles One-Pager-Factsheet bereit.",
			"\n- Trete als gleichberechtigte Geschäftspartnerin auf und fordere die gewünschten Konditionen aktiv ein."
		].join("");
	}
	
	if (id === "9") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Prevention-focused Questions: Investoren stellen Gründerinnen statistisch gesehen häufiger risikovermeidende Fragen (Prevention), während Männer wachstumsorientierte Fragen (Promotion) erhalten. Du wurdest intensiv nach Risiken und Absicherungen gefragt.",
			"\n2. Gender Funding Gap Vorurteile: Die Skepsis gegenüber deiner Marktführerschaft spiegelt die generelle Unterfinanzierung von Gründerinnen wider.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast defensiv formulierte Fragen aktiv in chancenorientierte (Promotion) Antworten umgelenkt.",
			"\n- Du hast fundierte Marktzahlen parat gehabt, um das Marktpotenzial zu belegen.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Erkenne präventive Fragen sofort und beantworte sie kurz, um direkt zum Wachstumspotenzial und deinen Visionen überzugehen.",
			"\n- Nutze das Momentum, um deine Skalierbarkeit und technologischen Vorteile in den Vordergrund zu stellen."
		].join("");
	}
	
	if (id === "10") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Risiko-Aversion und Sicherheits-Stereotype: Bankberater bewerten das Ausfallrisiko bei Gründerinnen oft strenger und fordern übermäßig viele persönliche Sicherheiten. Das Gespräch spiegelte diese vorsichtige Haltung wider.",
			"\n2. Zweifel an finanzieller Führungskompetenz: Dem weiblichen Führungsteam wurde unterschwellig weniger finanzielle Härte zugetraut.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast deine Liquiditätsplanung präzise erklärt und deine Sicherheiten sachlich dargelegt.",
			"\n- Du hast dich von der harten Nachfrage nicht aus dem Konzept bringen lassen.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Argumentiere streng zahlenbasiert und untermauere deine Planungen mit realistischen Szenarien (Best/Worst Case).",
			"\n- Zeige deutlich, dass du die volle Kontrolle über die Finanzen deines Unternehmens hast."
		].join("");
	}
	
	if (id === "11") {
		return [
			"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
			"\n\n1. Gender Pay Gap / Unterbewertung: Frauen neigen statistisch dazu, niedrigere Honorare anzusetzen, und Kundinnen versuchen oft, diese Preise weiter zu drücken. Im Dialog wurde dein Stundensatz als \"zu hoch\" bezeichnet, obwohl er marktüblich ist.",
			"\n2. Erwartung von Gefälligkeit und Flexibilität: Es wurde versucht, zusätzliche Leistungen ohne Aufpreis in das Paket zu verhandeln.",
			"\n\nVorteile deines Verhaltens:",
			"\n- Du hast den Wert deiner Dienstleistung klar über den Nutzen für die Kundin argumentiert, statt dich zu rechtfertigen.",
			"\n- Du hast eine klare Untergrenze gezogen und dich nicht unter Wert verkauft.",
			"\n\nEmpfehlungen für die Zukunft:",
			"\n- Setze deinen Preis bewusst am oberen Rand des Marktüblichen an, um Verhandlungsspielraum zu haben.",
			"\n- Definiere den Leistungsumfang (Scope of Work) vorab schriftlich und präzise, um kostenlose Mehrarbeit zu verhindern."
		].join("");
	}
	
	// Default fallback for any other novel ID (e.g. Mehr zu KITE / intro)
	return [
		"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:",
		"\n\n1. Kommunikationsbarrieren und unbewusste Vorurteile: Im Verlauf des Gesprächs traten subtile Vorurteile auf, die oft unbewusst die Kompetenz oder das Potenzial von Gründerinnen in Frage stellen. Du hast versucht, sachlich darauf zu reagieren.",
		"\n2. Rollenkonflikte im unternehmerischen Kontext: Es zeigt sich, dass traditionelle Erwartungshaltungen die Interaktion beeinflussen können.",
		"\n\nVorteile deines Verhaltens:",
		"\n- Du hast eine professionelle Kommunikationsebene aufrechterhalten.",
		"\n- Du hast deine Argumente klar strukturiert präsentiert.",
		"\n\nEmpfehlungen für die Zukunft:",
		"\n- Achte darauf, unbewusste Biases frühzeitig zu identifizieren, um deine Argumentation proaktiv anzupassen.",
		"\n- Vertraue auf deine fundierte Vorbereitung und vertrete deine Position selbstbewusst."
	].join("");
}

export function setLatestFeedback(payload) {
	const storage = getStorage();
	storage.setItem(STORAGE_KEYS.LATEST, JSON.stringify(payload));
}

export function getLatestFeedback() {
	const storage = getStorage();
	return safeJsonParse(storage.getItem(STORAGE_KEYS.LATEST));
}

export function setFeedbackForNovel(novelId, payload) {
	const storage = getStorage();
	const id = normalizeNovelId(novelId);
	if (!id) {
		return;
	}
	storage.setItem(`${STORAGE_KEYS.BY_NOVEL_PREFIX}${id}`, JSON.stringify(payload));
}

export function getFeedbackForNovel(novelId) {
	const storage = getStorage();
	const id = normalizeNovelId(novelId);
	if (!id) {
		return null;
	}
	return safeJsonParse(storage.getItem(`${STORAGE_KEYS.BY_NOVEL_PREFIX}${id}`));
}

// A Gemini API key must never be read by the browser. The backend owns it.
export async function loadApiKey() {
    try {
        const response = await fetch("/api/config-status", { cache: "no-store" });
        if (!response.ok) return null;
        const data = await response.json();
        return data?.configured === true ? "server_managed" : null;
    } catch (error) {
        console.warn("KITE: AI backend is not available.");
        return null;
    }
}

export async function generateAiFeedback(novel, history, apiKey) {
    if (apiKey !== "server_managed") {
        throw new Error("KI-Feedback benötigt den konfigurierten KITE-Server.");
    }

    const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novel, history }),
    });

    if (!response.ok) {
        let message = `KI-Server: HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            if (typeof errorData?.error === "string") {
                message = errorData.error;
            }
        } catch (_) { /* Keep the generic status error. */ }
        throw new Error(message);
    }

    const data = await response.json();
    if (typeof data?.text !== "string" || !data.text.trim()) {
        throw new Error("Ungültige Antwortstruktur vom Server");
    }
    return data.text.trim();
}
