# RunBuddy

RunBuddy is a coursework demo prototype for a mobile-first running companion web app, built with HTML, CSS, and JavaScript. It demonstrates live running tracking, gamified rewards, character customization, community pages, and beginner running guidance in a browser-based experience.

This repository is not the final production version of the application. It is the implemented demo used to present the core concept and working flows for the coursework submission.

## Demo Scope

- Front-end only, with no backend or database
- No package install or build step is required
- Persistent data stored in `localStorage`
- Optimized for an iPhone 17 Pro style viewport (`393 x 852`)
- Best experience on HTTPS hosting or a local HTTP server

## Implemented Demo Modules

### Running System

- Start, pause, and end a run
- Live time, speed, distance, heart rate, and calorie tracking
- Route tracking on a live map
- Pace and heart-rate warning prompts
- Milestone alerts and coin rewards
- Background music and custom encouragement audio recording
- Desktop and watch-style running layouts

### Progress and History

- Persistent total stats dashboard
- Run history and run summary pages
- Share and report preview/export flow
- Monthly check-in page

### Character and Shop System

- Character customization
- Wardrobe overview and outfit cart
- Jacket, pants, cap, and academy outfit pages
- Unlockable items stored locally

### Community and Guidance

- Community feed, search, post editor, and post detail pages
- Running guidance page for beginner users
- Client-side login and session entry flow

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- `localStorage` for client-side persistence
- Browser APIs: Geolocation, MediaRecorder, and Audio
- Leaflet for map rendering
- Static hosting on GitHub Pages or any other HTTP server

## Demo Links

- Source code: https://github.com/Moyao-Xue/RunBuddy
- Demo preview: https://moyao-xue.github.io/RunBuddy/
- Process portfolio: https://adam-aiaiai.github.io/process-portfolio/

## Getting Started

### Requirements

- A modern browser such as Chrome, Edge, Firefox, or Safari
- Network access for the Leaflet CDN and map tiles
- HTTPS or `localhost` for geolocation and microphone features

### Run Locally

1. Open `index.html` to enter the onboarding flow.
2. Or serve the project with a local HTTP server:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

### Recommended Flow

`index.html` -> `frontend/home.html` -> `frontend/run-tracker.html` -> `frontend/run-summary.html` -> `frontend/run-share.html`

## Project Structure

```text
RunBuddy/
- index.html
- README.md
- STANDARDIZATION_REPORT.md
- .gitignore
- ai_logs/
  - README.md
- frontend/
  - *.html
  - archive/
    - legacy-assets/
    - legacy-backups/
  - audio/
  - css/
    - main.css
    - pages/
      - onboarding.css
      - home.css
      - run-tracker.css
      - run-tracker-watch.css
      - run-summary.css
      - run-share.css
      - run-report-preview.css
      - run-history.css
      - ...other page styles
  - images/
  - js/
    - storage.js
    - pages/
      - onboarding.js
      - home.js
      - run-tracker.js
      - run-summary.js
      - run-share.js
      - run-report-preview.js
      - run-history.js
      - ...other page scripts
    - vendor/
      - html2canvas.min.js
```

## Data Persistence

- Settings: minimum speed, maximum heart rate, music choice, encouragement audio, and volume
- Stats: coins, distance, runs, time, calories, and best records
- Run history: completed sessions and summary metadata
- User data: username, level, and experience
- Community data: login session and user posts
- Wardrobe data: owned item IDs and customization state

## Browser Notes

- Geolocation and microphone access require user permission.
- Some running features rely on a secure context.
- Map tiles are loaded from external sources, so network access is required.
- Clearing browser storage resets stats, history, and settings.
- Some pages are simplified demo flows rather than production-ready services.

## AI-Assisted Development

- `ai_logs/README.md` records the main prompts used to generate and refine the core components.
- The generated code was reviewed and adjusted by the team after implementation.

## Related Documentation

- `STANDARDIZATION_REPORT.md` summarizes the filename and folder normalization work.
- `ai_logs/README.md` contains the AI prompt log for the main modules.
