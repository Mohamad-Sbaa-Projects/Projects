const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// KITE frontend is public; Gemini credentials only exist in this Node.js process.
const PORT = Number(process.env.PORT || 8080);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PROJECT_ROOT = path.resolve(__dirname);
const MAX_BODY_BYTES = 64 * 1024;
const MAX_HISTORY_ITEMS = 250;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_FEEDBACK_REQUESTS = 10;  // per IP, per window, for a single server process
const rateLimits = new Map();

// Old entries must not accumulate indefinitely on a long-running server.
const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, state] of rateLimits) {
        if (now >= state.resetAt) rateLimits.delete(ip);
    }
}, RATE_WINDOW_MS);
cleanup.unref();

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.txt': 'text/plain; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const sendJson = (res, status, result) => {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(result));
};

function allowFeedbackForIp(ip) {
    const now = Date.now();
    const state = rateLimits.get(ip);
    if (!state || now >= state.resetAt) {
        rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (state.count >= MAX_FEEDBACK_REQUESTS) return false;
    state.count += 1;
    return true;
}

// Same-origin check prevents another website's browser JavaScript from using
// this endpoint. It is NOT authentication; server-to-server calls remain possible.
function validOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true; // e.g. curl or integration tests
    try {
        const parsed = new URL(origin);
        return ['http:', 'https:'].includes(parsed.protocol) &&
            parsed.host === req.headers.host;
    } catch {
        return false;
    }
}

async function readJsonBody(req) {
    const headerLength = Number(req.headers['content-length'] || 0);
    if (headerLength > MAX_BODY_BYTES) {
        const error = new Error('Payload too large');
        error.statusCode = 413;
        throw error;
    }
    let total = 0;
    const chunks = [];
    for await (const chunk of req) {
        total += chunk.length;
        if (total > MAX_BODY_BYTES) {
            const error = new Error('Payload too large');
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
        const error = new Error('Invalid JSON');
        error.statusCode = 400;
        throw error;
    }
}

function insideDirectory(parent, filePath) {
    const relative = path.relative(parent, filePath);
    return relative !== '..' && !relative.startsWith('..' + path.sep) &&
        !path.isAbsolute(relative);
}

function isAllowedAsset(urlPath) {
    if (urlPath.split('/').some(segment => segment.startsWith('.'))) return false;
    if (['/index.html', '/app.js', '/style.css'].includes(urlPath)) return true;
    if (urlPath.startsWith('/src/') || urlPath.startsWith('/public_assets/')) {
        return Object.hasOwn(MIME_TYPES, path.extname(urlPath).toLowerCase());
    }
    return false;
}

async function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        res.end('Method Not Allowed');
        return;
    }
    let urlPath;
    try {
        urlPath = decodeURIComponent(pathname);
    } catch {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }
    if (urlPath === '/') urlPath = '/index.html';
    if (urlPath.includes('\\') || urlPath.includes('\0') || !isAllowedAsset(urlPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    const filePath = path.resolve(PROJECT_ROOT, '.' + urlPath);
    if (!insideDirectory(PROJECT_ROOT, filePath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    try {
        const realPath = await fs.promises.realpath(filePath);
        // Also check the REAL path, to prevent symlink aliases to server.js/.env.
        const relativeRealPath = '/' + path.relative(PROJECT_ROOT, realPath).split(path.sep).join('/');
        if (!insideDirectory(PROJECT_ROOT, realPath) || !isAllowedAsset(relativeRealPath)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        const stat = await fs.promises.stat(realPath);
        if (!stat.isFile()) throw new Error('Not a file');
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(realPath).toLowerCase()] });
        if (req.method === 'HEAD') {
            res.end();
        } else {
            fs.createReadStream(realPath).on('error', () => res.destroy()).pipe(res);
        }
    } catch {
        res.writeHead(404);
        res.end('Not Found');
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    let pathname;
    try {
        pathname = new URL(req.url, 'http://localhost').pathname;
    } catch {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }

    if (pathname === '/api/config-status' && req.method === 'GET') {
        sendJson(res, 200, { configured: !!GEMINI_API_KEY });
        return;
    }

    if (pathname === '/api/generate-feedback' && req.method === 'POST') {
        if (!validOrigin(req)) {
            sendJson(res, 403, { error: 'Request origin not allowed.' });
            return;
        }
        if (!allowFeedbackForIp(req.socket.remoteAddress || 'unknown')) {
            res.setHeader('Retry-After', '600');
            sendJson(res, 429, { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' });
            return;
        }
        if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
            sendJson(res, 415, { error: 'Content-Type must be application/json.' });
            return;
        }
        if (!GEMINI_API_KEY) {
            sendJson(res, 503, { error: 'KI-Backend ist nicht konfiguriert.' });
            return;
        }

        let payload;
        try {
            payload = await readJsonBody(req);
        } catch (error) {
            sendJson(res, error.statusCode || 400, { error: error.message });
            return;
        }

        const { novel, history } = payload && typeof payload === 'object' ? payload : {};
        const validNovel = novel == null || (
            typeof novel === 'object' && !Array.isArray(novel) &&
            (novel.title == null || (typeof novel.title === 'string' && novel.title.length <= 300)) &&
            (novel.description == null || (typeof novel.description === 'string' && novel.description.length <= 1500))
        );
        const validHistory = Array.isArray(history) && history.length <= MAX_HISTORY_ITEMS &&
            history.every(msg => msg && typeof msg === 'object' && !Array.isArray(msg) &&
                typeof msg.text === 'string' && msg.text.length <= 3000 &&
                (msg.speaker == null || (typeof msg.speaker === 'string' && msg.speaker.length <= 100)));
        if (!validNovel || !validHistory) {
            sendJson(res, 400, { error: 'Ungültige oder zu große Dialogdaten.' });
            return;
        }

        try {
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
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
                    return await fetch(url, {
                        signal: AbortSignal.timeout(20000),
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": GEMINI_API_KEY,
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
                    console.warn(`Gemini request failed with HTTP ${apiResponse.status}`);
                    sendJson(res, 502, { error: 'KI-Dienst ist derzeit nicht erreichbar.' });
                    return;
                }

                const data = await apiResponse.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (typeof text !== 'string' || !text.trim()) {
                    sendJson(res, 502, { error: 'Keine gültige KI-Antwort erhalten.' });
                    return;
                }
                sendJson(res, 200, { text: text.trim() });
            } catch (error) {
                console.error('Gemini proxy failed:', error?.message || 'Unknown error');
                sendJson(res, 502, { error: 'KI-Dienst ist derzeit nicht erreichbar.' });
            }
        return;
    }

    if (pathname.startsWith('/api/')) {
        sendJson(res, 404, { error: 'Not Found' });
        return;
    }
    await serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
    console.log(`KITE running at http://localhost:${PORT}`);
    console.log(`Gemini configured: ${Boolean(GEMINI_API_KEY)}`);
});
