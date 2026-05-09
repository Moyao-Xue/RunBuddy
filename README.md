# RunBuddy

## About RunBuddy

RunBuddy is a gamified companion running app designed to help new runners build consistent running habits. By integrating character development into traditional running app features, we make running more engaging and motivating, solving the common problem of giving up easily for beginners. In addition to core running functions, we provide a community platform for runners to communicate and share experiences, as well as instructional videos to guide users in running correctly and safely.

## Key Features

- **Gamified Character Development**: Create and cultivate your unique running companion. Your character's growth (level, attributes, appearance) is directly linked to your running achievements (distance, duration, frequency), making every run meaningful and rewarding.
- **Core Running Tools**: Track your running data in real time, including distance, pace, duration, calories burned, and route. Automatically record and analyze your running history to help you set reasonable goals.
- **Community Exchange Platform**: Connect with other runners, share running experiences, post progress, join group challenges, and get encouragement and support from peers to keep running motivation high.
- **Instructional Videos**: Provide professional running guidance videos, covering correct running posture, warm-up and cool-down exercises, injury prevention, and training plans, helping beginners start running scientifically.

## Core Playful Features

1. **Interactive Running Game**: Real-time running simulation with animated character, scrolling backgrounds, and dynamic pace tracking
2. **Gamification System**: Earn coins for completing runs, tracked with persistent statistics
3. **Character Customization**: Unlock and equip different outfits (jackets, pants, caps) using earned coins
4. **Audio Feedback**: Background music and voice encouragement during runs
5. **Achievement Alerts**: Milestone notifications every 1000 meters with visual/audio feedback
6. **Health Warnings**: Real-time pace and heart rate monitoring with safety alerts

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage (client-side data persistence)
- **Audio**: Web Audio API, HTML5 Audio elements
- **Animation**: CSS transitions, JavaScript requestAnimationFrame
- **Deployment**: GitHub Pages

## Project Repository

**Source Code**: [https://github.com/Moyao-Xue/RunBuddy](https://github.com/Moyao-Xue/RunBuddy)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Git (for cloning the repository)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Moyao-Xue/RunBuddy.git
   ```

2. Navigate to the project directory:
   ```bash
   cd RunBuddy
   ```

3. Open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

4. Access the app at `http://localhost:8000`

## Project Live Demo

Access the hosted application: **[RunBuddy Live Demo](https://moyao-xue.github.io/RunBuddy/)**

## Project Website

For more detailed information about the RunBuddy system, including product demonstrations, feature introductions, and team information, please visit: **[RunBuddy Process Portfolio](https://adam-aiaiai.github.io/process-portfolio/)**

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
  - *.html (semantic page names)
  - css/
    - pages/
      - onboarding.css
      - home.css
      - run-tracker.css
      - run-tracker-watch.css
      - run-summary.css
      - run-share.css
      - ...other page-level styles
  - js/
    - storage.js
    - pages/
      - onboarding.js
      - home.js
      - run-tracker.js
      - run-summary.js
      - run-report-exporter.js
      - ...other page-level scripts
    - vendor/
  - images/
  - audio/
  - archive/
```
## Data Handling

The system uses LocalStorage for client-side data persistence:

- **Settings**: User preferences (speed limits, music, volume)
- **Statistics**: Total coins, distance, calories, runs
- **Run History**: Detailed records of each completed run
- **User Data**: Username, character level, experience points

## Responsive Design

The interface is optimized for mobile devices (iPhone 17 Pro: 393x852px) but also works on desktop browsers.

## AI-Assisted Development

This project utilized AI tools for development. See `ai_logs/README.md` for documentation of AI prompts used for core components.

## Contributing

We welcome contributions from the community! If you want to contribute to RunBuddy, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and concise descriptions.
4. Push your branch to your forked repository.
5. Submit a pull request, and we will review it as soon as possible.

## License

## Contact

For questions, suggestions, or feedback, please contact us through the [GitHub repository](https://github.com/Moyao-Xue/RunBuddy).
