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

export async function loadApiKey() {
	// 1. Try to check if the Node.js backend is active and configured
	try {
		const response = await fetch("/api/config-status");
		if (response.ok) {
			const data = await response.json();
			if (data && data.configured) {
				return "server_managed";
			}
		}
	} catch (e) {
		console.log("Backend server not active. Falling back to local file load...");
	}

	// 2. Fallback to reading the local .env files directly (for static hosting/Gitlab pages)
	const filesToTry = ["../../.env", "../../env", "../../env.txt"];
	for (const file of filesToTry) {
		try {
			const response = await fetch(new URL(file, import.meta.url));
			if (response.ok) {
				const text = await response.text();
				const match = text.match(/GEMINI_API_KEY\s*=\s*(.*)/);
				if (match) {
					return match[1].trim().replace(/['"]/g, "");
				}
			}
		} catch (e) {
			// ignore and try next
		}
	}
	return null;
}


export async function generateAiFeedback(novel, history, apiKey) {
	// If the API key is "server_managed", query the backend proxy
	if (apiKey === "server_managed") {
		const response = await fetch("/api/generate-feedback", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ novel, history }),
		});

		if (!response.ok) {
			let errMsg = `Server returned status ${response.status}`;
			try {
				const errData = await response.json();
				if (errData && errData.error) {
					errMsg = errData.error;
				}
			} catch (e) {
				// ignore
			}
			throw new Error(errMsg);
		}

		const data = await response.json();
		if (!data || !data.text) {
			throw new Error("Ungültige Antwortstruktur vom Server");
		}

		return data.text.trim();
	}

	// Otherwise, perform the direct Google Gemini API call securely in the browser using the provided apiKey (fallback for static hostings)
	const conversationTranscript = history
		.map((msg) => `${msg.speaker || (msg.isPlayer ? "Du" : "Npc")}: ${msg.text}`)
		.join("\n");

	const prompt = `Du bist ein Experte für Diversität, Antidiskriminierung und Entrepreneurship im Projekt KITE (KI-Thinktank Entrepreneurship).
Deine Aufgabe ist es, das Gespräch einer Gründerin ("Du") mit ihrem Gesprächspartner (z. B. Kundin, Investor, Bankberater, Vermieter) in einer Visual Novel zu analysieren. Das Gespräch kann verschiedene Arten von Biases, Vorurteilen oder Diskriminierung enthalten (z. B. geschlechtsspezifische Vorurteile, rassistische Kommentare, Gender Pay Gap, Stereotype über Flexibilität).

Kontext der Visual Novel:
- Titel: ${novel?.title || "KITE Visual Novel"}
- Beschreibung: ${novel?.description || ""}

Gesprächsverlauf:
${conversationTranscript}

Bitte erstelle eine strukturierte Analyse in deutscher Sprache. Halte dich exakt an folgendes Format:

Beginne mit dem Satz:
"Ich habe den Dialog analysiert und einige Biases identifiziert, die im Gespräch zum Tragen kommen. Hier sind meine Beobachtungen und Empfehlungen:"

Danach folgen:
1. Eine nummerierte Liste (z. B. 1., 2., 3.) der identifizierten Biases oder Dynamiken (z. B. "Geschlechterlohngefälle (Gender Pay Gap)", "Erwartungen bezüglich Frauen in Verhandlungen", "Rassistische Vorurteile", "Stereotypen über Flexibilität"). Beschreibe jeweils kurz, wie sich der Bias im Gespräch geäußert hat und wie die Gründerin darauf reagiert hat.
2. Ein Abschnitt mit der Überschrift "Vorteile deines Verhaltens:" gefolgt von einer stichpunktartigen Liste (mit "-"), die beschreibt, was an der Reaktion der Gründerin positiv war (z. B. Professionalität gewahrt, Grenzen gesetzt, Wert der Arbeit kommuniziert).
3. Ein Abschnitt mit der Überschrift "Empfehlungen für die Zukunft:" gefolgt von einer stichpunktartigen Liste (mit "-"), die konkrete Tipps und Handlungsstrategien anbietet.

WICHTIG: Verwende keine Markdown-Überschriften (wie # oder ##) or fettgedruckte HTML-Tags, sondern reinen Text mit Absätzen.`;

	const makeRequest = async (modelName) => {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
		return await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
			}),
		});
	};

	let response = await makeRequest("gemini-3.5-flash");

	// Fallback to gemini-2.5-flash if gemini-3.5-flash fails
	if (!response.ok) {
		console.warn(`Gemini API returned status ${response.status} for gemini-3.5-flash. Falling back to gemini-2.5-flash...`);
		response = await makeRequest("gemini-2.5-flash");
	}

	// Fallback to gemini-3.1-flash-lite if gemini-2.5-flash fails
	if (!response.ok) {
		console.warn(`Gemini API returned status ${response.status} for gemini-2.5-flash. Falling back to gemini-3.1-flash-lite...`);
		response = await makeRequest("gemini-3.1-flash-lite");
	}

	// Fallback to gemini-2.0-flash if gemini-3.1-flash-lite fails
	if (!response.ok) {
		console.warn(`Gemini API returned status ${response.status} for gemini-3.1-flash-lite. Falling back to gemini-2.0-flash...`);
		response = await makeRequest("gemini-2.0-flash");
	}

	if (!response.ok) {
		throw new Error(`Gemini API returned status ${response.status}`);
	}

	const data = await response.json();
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error("Ungültige Antwortstruktur der Gemini API");
	}

	return text.trim();
}

