# KITE – Interactive Visual Novel Web App

## About the Project

**KITE** is an educational, interactive visual novel about prejudice and discrimination in entrepreneurship. Players experience everyday situations from the perspective of a woman starting a business, follow conversations with different characters, and make decisions that influence how the story continues.

The application was originally developed in **Unity**. In a university team project, we created a **lightweight browser-based version** using HTML, CSS, and vanilla JavaScript, without a frontend framework.

> **Project context:** KITE was developed as part of a team project at Hochschule Heilbronn. The story content, images, and other assets may have separate usage rights.

## Features

- Interactive stories with dialogues and different response options
- Story navigation with branching choices
- Backgrounds, character views, and dialogue boxes
- Character and interface animations
- Novel selection, home screen, and navigation menu
- Save, continue, and reset functionality for story progress
- Additional information, settings, and legal-information screens
- Mobile-oriented layout

## Technologies

- **HTML5** and **CSS3**
- **JavaScript (ES modules)**
- **Web Components** (Custom Elements)
- **Hash-based routing** for screen navigation
- **Browser localStorage** for progress persistence
- **Git / GitLab** for version control and collaboration

## My Contributions

This application was developed collaboratively with other students. The following describes my own work based on the project's assigned issues.

### Screens and Web Components

- Implemented the **home screen**, application **header**, and navigation menu.
- Worked on a reusable **dialogue box Web Component**, including speaker-specific text styling, sizing, and scrolling.
- Developed the **legal-information screens**, their subpages, and the **More to KITE** screen.
- Contributed to the **novel player** and helped integrate backgrounds, characters, dialogues, and choice buttons with the rest of the team.

### Routing and Story Navigation

- Worked on **JavaScript-based screen routing** and clear navigation paths.
- Implemented or adapted dialogue progression, scenario navigation, and interactions with different choices.

### Progress Management

- Worked on saving and loading novel progress and restoring the current story position.
- Added **continue** and **reset** interactions, including a confirmation dialog before resetting application progress.

### UI Adjustments and Animations

- Worked on dialogue scrolling, character positioning, screen layout, and animation-related adjustments.
- Made iterative changes to bring the web experience closer to the original Unity application.

### Team Documentation

- Collaborated on the **software architecture documentation** with other team members.

## Project Structure

```text
KiteApp/
├── index.html                 # Application entry point
├── app.js                     # Web app initialization
├── style.css                  # Global styles
├── public_assets/             # Images, sounds, and other static assets
└── src/
    ├── components/            # Reusable Web Components
    ├── controllers/           # Novel interaction and navigation
    ├── core/                  # Routing and shared utilities
    ├── data/                  # Story content and novel metadata
    ├── screens/               # Application screens
    └── services/              # Progress storage and other app services
```

## Run Locally

1. Download or clone the repository.
2. Open a terminal in the `KiteApp` folder.
3. Start a static development server (requires Python 3):

   ```bash
   python -m http.server 8080
   ```

4. Open **http://localhost:8080** in your browser.

Some features outside the core visual-novel experience may require additional services.

## Screenshots

Add screenshots from the running application, for example:

1. Intro screen

<img width="1273" height="1302" alt="image" src="https://github.com/user-attachments/assets/1a042a42-c8b1-48b0-bfd0-2af5a9e2f4bc" />





2. Home screen

<img width="1276" height="1301" alt="image" src="https://github.com/user-attachments/assets/bb5fc4fa-df8b-42e5-a10e-291c62e47285" />





3. Story screen showing character and dialogue

<img width="1273" height="1296" alt="image" src="https://github.com/user-attachments/assets/76baa6cd-101e-48a4-8bb6-1b3b562a61a6" />





## Credits and Publication

KITE is a **university team project** based on the original Unity application. The web implementation was developed collaboratively by students.

