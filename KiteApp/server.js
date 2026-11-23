const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Mapping of file extensions to MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
    // API endpoint for server configuration status
    if (req.url === '/api/config-status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ configured: !!GEMINI_API_KEY }));
        return;
    }

    // API endpoint for feedback generation
    if (req.url === '/api/generate-feedback' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                if (!GEMINI_API_KEY) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }));
                    return;
                }

                const { novel, history } = JSON.parse(body);
                if (!history || !Array.isArray(history)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid request: history must be an array.' }));
                    return;
                }

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
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
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

                let apiResponse = await makeRequest("gemini-3.5-flash");

                // Fallback to gemini-2.5-flash if gemini-3.5-flash fails
                if (!apiResponse.ok) {
                    console.warn(`Gemini API returned status ${apiResponse.status} for gemini-3.5-flash. Falling back to gemini-2.5-flash...`);
                    apiResponse = await makeRequest("gemini-2.5-flash");
                }

                // Fallback to gemini-3.1-flash-lite if gemini-2.5-flash fails
                if (!apiResponse.ok) {
                    console.warn(`Gemini API returned status ${apiResponse.status} for gemini-2.5-flash. Falling back to gemini-3.1-flash-lite...`);
                    apiResponse = await makeRequest("gemini-3.1-flash-lite");
                }

                // Fallback to gemini-2.0-flash if gemini-3.1-flash-lite fails
                if (!apiResponse.ok) {
                    console.warn(`Gemini API returned status ${apiResponse.status} for gemini-3.1-flash-lite. Falling back to gemini-2.0-flash...`);
                    apiResponse = await makeRequest("gemini-2.0-flash");
                }

                if (!apiResponse.ok) {
                    res.writeHead(apiResponse.status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `Gemini API returned status ${apiResponse.status}` }));
                    return;
                }

                const data = await apiResponse.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Invalid response structure from Gemini API" }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ text: text.trim() }));
            } catch (err) {
                console.error("Error generating feedback:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
        });
        return;
    }

    // Static file serving logic
    const baseDir = path.resolve(__dirname || '.');
    let relativePath = req.url.split('?')[0].split('#')[0];
    if (relativePath === '/') {
        relativePath = '/index.html';
    }

    const filePath = path.join(baseDir, relativePath);

    // Security check: ensure path resolves inside baseDir
    if (!filePath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GEMINI_API_KEY configured: ${!!GEMINI_API_KEY}`);
});
