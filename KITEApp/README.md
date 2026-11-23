# KITE – Interactive Visual Novel for Entrepreneurship

**KITE** is an interactive, educational visual novel that helps users recognize and reflect on bias and discrimination in entrepreneurial situations. Players take the role of a woman founder and make decisions in realistic conversations, for example with banks, investors, landlords, or other stakeholders.

This repository contains a **lightweight web implementation of a project originally developed with Unity**, created as part of a university team project. The browser application uses HTML, CSS, and vanilla JavaScript with native Web Components rather than a frontend framework.

> **Project context:** KITE originates from a project at Hochschule Heilbronn. This repository represents work on its web implementation by a student development team. Original project content, artwork, and other assets may have separate rights or attribution requirements.

## Features

- **Interactive visual novels:** Follow dialogues, select responses, and explore different conversation paths.
- **Novel player:** Displays backgrounds, characters, speaker-specific dialogue, and choice buttons.
- **Animations:** Character reactions, blinking, visual effects, and scene/UI transitions.
- **Progress and archive:** Save and resume novels, bookmark stories, and review previously played dialogues.
- **Learning resources:** Knowledge screens and information about bias, along with additional information about KITE.
- **AI-powered feedback:** Google Gemini can analyze a completed dialogue and provide feedback about possible biases and response strategies.
- **Additional screens:** Settings, terms of use, privacy policy, legal notice, and application reset with confirmation.
- **Mobile-oriented layout:** UI designed around a 450 × 932 reference viewport and scaled to the available space.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES modules) |
| UI architecture | Native Web Components (`HTMLElement`, Custom Elements) |
| Navigation | Client-side hash routing |
| Persistence | Browser `localStorage` |
| Backend | Node.js built-in HTTP server |
| AI integration | Google Gemini API via a Node.js proxy |
| Version control | Git / GitLab |

## My Contributions

This was a **team project**. My contributions below are based on the tasks and issues assigned to and completed by me; they do not represent sole authorship of the entire application.

### User Interface and Components
- Implemented the home/start screen and application header, including navigation buttons and the burger menu.
- Built and refined visual novel UI elements, including the dialogue box and its scrolling and sizing behavior.
- Created the main novel player screen and integrated backgrounds, characters, dialogue, and choices.
- Implemented legal information screens and their subpages, as well as the **More to KITE** screen.

### Routing and Story Interaction
- Implemented and refined navigation between screens using JavaScript routing.
- Worked on dialogue progression, scenario navigation, and choice-dependent interactions.

### State and Progress
- Created functionality for saving, loading, continuing, and resetting novel progress.
- Implemented the app-reset flow inside the privacy/legal area, including a confirmation step.

### Animations and UI Refinement
- Worked on character, dialogue, and choice-button animations.
- Improved scene presentation, character positioning, transitions, and mobile interaction behavior.

### Documentation
- Collaborated with the other team members on the architecture documentation.

## Project Structure

```text
KiteApp/
├── index.html                    # Application entry point
├── app.js                        # Bootstraps the <kite-app> component
├── style.css                     # Global styling and animations
├── package.json                  # npm start command
├── server.js                     # Local Node.js server and Gemini proxy
├── public_assets/                # Images, audio, legal texts, and other assets
└── src/
    ├── components/              # Reusable Web Components
    ├── controllers/             # Novel interaction and navigation controllers
    ├── core/                    # Routing and shared utilities
    ├── data/                    # Story content and novel metadata
    ├── screens/                 # Screens and page-level components
    └── services/                # Storage, story, animation, AI, and other services
```

Examples from the implementation:

- `src/core/screen_router.js` – switches screens using URL hashes.
- `src/components/NovelPlayerView.js` – coordinates story scenes, characters, dialogue, and choices.
- `src/components/DialogueBox.js` – renders conversation messages.
- `src/services/StorageService.js` – saves progress and archive entries in `localStorage`.
- `src/services/CharacterAnimationService.js` – handles character-related animation behavior.
- `src/services/AiFeedbackService.js` – connects the UI to AI feedback generation.

## Getting Started (Local Development)

### Requirements
- **Node.js 20.6+** (a recent Node.js LTS version is recommended)
- A modern web browser
- A Google Gemini API key **only if you want to use AI feedback**

### Start the Application

1. Clone or download the repository.
2. Open a terminal in the project root.
3. Copy `.env.example` to `.env`, then insert your key **only** in `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

   ```dotenv
   GEMINI_API_KEY=your_api_key_here
   ```

   To try the visual novel without AI feedback, leave the value empty. **Never commit `.env` to Git.**

4. Start the local server:

   ```bash
   npm start
   ```

5. Visit **http://localhost:8080**.

This version has no third-party npm packages listed in `package.json`; the server uses built-in Node.js modules.

## Security and Deployment Notes

- All Gemini API requests now go through the local Node.js backend. The browser no longer reads `.env`/`env.txt` or calls Gemini with a secret key.
- Only frontend resources (`index.html`, `app.js`, `style.css`, `src/`, `public_assets/`) are served. Sensitive configuration and server files are blocked.
- The feedback endpoint applies same-origin browser checks, request-size validation, simple per-IP rate limiting (10 requests per 10 minutes per Node.js process), and hides internal error details.
- **Static hosting (GitLab Pages / GitHub Pages):** the visual novel works, but live Gemini feedback is **not available** without a separately hosted backend. The included GitLab Pages job publishes only frontend files.
- **Public hosting with live AI:** simple per-IP limits are *not* a complete abuse-prevention strategy. Add appropriate authentication/access control, infrastructure-level rate limiting and cost quotas before an unrestricted public launch, especially behind reverse proxies or when running several instances.
- If a real key has ever appeared in a Git commit or public deployment, **revoke and replace it**. Removing it from the latest commit is not sufficient.
- The project has no third-party backend dependencies; `npm start` requires **Node.js 20.6+** for `--env-file` and a `.env` file, even if the key is empty.

To create your local `.env` on Windows (PowerShell):

```powershell
Copy-Item .env.example .env
# Fill GEMINI_API_KEY=... locally to enable live AI analysis.
npm start
```

### Security smoke tests

Run `npm start`, then verify:

- `http://localhost:8080/` shows KITE.
- `http://localhost:8080/.env`, `/env.txt`, `/server.js`, and `/.git/config` return **403 Forbidden**.
- `http://localhost:8080/api/config-status` returns only `{"configured":true|false}`, **never the key**.
- Visual novels and progress saving continue working without an API key; live AI feedback requires a working backend and a valid key.

**Note:** this project has not been penetration-tested. API traffic incurs Gemini usage costs when a key is configured.

## Screenshots

Add screenshots of the actual application before publishing the repository, for example:

1. Novel selection screen
2. Story and dialogue screen
3. Choice interaction or archive screen

## Credits and Usage

Developed as a **university team project** based on the KITE application. KITE and its educational materials originate from the Hochschule Heilbronn project team. The app's own “More to KITE” and legal screens contain additional project and institutional information.

**Before publishing:** Confirm that the team/project owners allow public release of the source code, story content, images, and audio. Do not add an open-source license for materials you are not authorized to license.
