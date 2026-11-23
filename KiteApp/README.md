# KITE Visual Novel App

This repository contains the KITE Visual Novel demo application featuring dynamic AI analysis feedback powered by Gemini.

## API Key Security & Server Proxy

To keep your Google Gemini API key secure and hidden from client-side browsers, this application uses a hybrid architecture with a Node.js backend proxy.

### How to Run Locally (Secure Node Server)
1. Ensure you have a `.env` file in the root directory with your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
2. Run the secure server:
   ```bash
   npm start
   ```
   *Alternatively, run: `node --env-file=.env server.js`*
3. Open [http://localhost:8080](http://localhost:8080) in your browser.

---

### How it Works on GitLab Pages & Static Environments (Hybrid Fallback)
If you deploy this repository to a static hosting platform (like **GitLab Pages** or **GitHub Pages**) where running a Node.js backend is not supported:
* The frontend will automatically detect that the Node.js server is not active.
* It will **gracefully fall back** to the client-side loading mechanism:
  * It tries to fetch `.env`, `env`, or `env.txt` relative to the frontend files.
  * It will prompt the Gemini API directly from the user's browser using the loaded key.
* This hybrid architecture ensures the codebase runs **100% securely** locally/in production with Node, but remains **fully testable and deployable** in static environments.
