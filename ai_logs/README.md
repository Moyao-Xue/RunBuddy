# RunBuddy AI Logs

This folder contains the primary AI prompts used to generate core components of the RunBuddy system.

---

## Technical Reflection

This section documents how we used Generative AI tools for vibe coding and how we ensured the generated code met our user requirements.

### Example 1: Game Engine Logic

**P (Prompt):**  
"Create a JavaScript running game with: Start/pause/stop functionality, scrolling background animation, runner character animation, real-time stats display (time, pace, heart rate, calories), modal dialogs for settings and warnings, LocalStorage integration for saving game state, audio playback for background music and encouragement, speed calculation and distance tracking, warning system for pace and heart rate limits."

**O (Outcome):**  
The AI generated a functional game engine with all requested features. The core mechanics worked well: the start/pause/stop buttons responded correctly, the background scrolling animation was smooth, and the LocalStorage integration successfully preserved user data between sessions. However, there were two issues: (1) the heart rate warning system triggered at incorrect thresholds (e.g., warning at 120 bpm instead of the user's set limit), and (2) the speed calculation produced unrealistic values when the game timer was paused and resumed.

**A (Action):**  
We modified the heart rate warning logic to use a proper comparison operator (`>=` instead of `>`) and added validation to ensure the user's heart rate limit was never exceeded. For the timer issue, we refined the prompt to specify "pause should freeze the timer but not affect cumulative distance calculation" and added explicit state management for paused vs. active running sessions. After these modifications and re-testing, the game engine met our usability requirements for the target runners.

---

### Example 2: Character Customization Feature

**P (Prompt):**  
"Create a character customization page with: character preview display, equipment slots (jacket, pants, cap), interactive clothing selection, save/load customization state using localStorage."

**O (Outcome):  
The AI provided a complete customization interface with three equipment slots. The UI was visually appealing with smooth hover effects and clear selection indicators. The save/load functionality worked correctly. However, the outcome was **irrelevant** in one aspect: the AI used hardcoded image URLs for the clothing items that pointed to external stock photo URLs, which were either broken or inappropriate for our playful running theme.

**A (Action):**  
We discarded the hardcoded image URLs entirely and created our own inline SVG graphics for the character and equipment. We refined the prompt to specify "use placeholder SVG shapes for all character and clothing visuals" and "CSS-based coloring for equipment customization." This approach also improved accessibility, as SVG elements with proper ARIA labels are more screen-reader friendly than `<img>` tags with external URLs.

---

### Ethical Considerations

**Accessibility:**  
All AI-generated code was reviewed for keyboard navigation support and screen reader compatibility. We ensured interactive elements (buttons, modals) have proper `aria-labels` and focus states. The high-contrast color scheme was maintained to support users with visual impairments.

**Bias Awareness:**  
The AI-generated workout recommendations were designed to be inclusive of different fitness levels. We added configurable pace and heart rate limits to avoid recommending unsafe exercise intensity for beginners or users with health conditions.

**Data Privacy:**  
LocalStorage was chosen intentionally to keep all user data on-device, avoiding cloud storage concerns. Users are not required to create accounts or share personal information.

---

## Vibe Coding Prompts Used

### 1. Game Engine (run-tracker.js)
```
Create a JavaScript running game with:
- Start/pause/stop functionality
- Scrolling background animation
- Runner character animation
- Real-time stats display (time, pace, heart rate, calories)
- Modal dialogs for settings and warnings
- LocalStorage integration for saving game state
- Audio playback for background music and encouragement
- Speed calculation and distance tracking
- Warning system for pace and heart rate limits
```

### 2. Storage Module (js/storage.js)
```
Create a LocalStorage utility module for a running app with:
- Settings persistence (speed limits, music selection, volume)
- Stats tracking (coins, distance, calories, runs)
- User data management (username, level, experience)
- Run history with CRUD operations
- Date range filtering for history
- Default values and error handling
```

### 3. Running Interface (run-tracker.html)
```
Create an iPhone-optimized running game interface with:
- Fixed viewport (393x852 iPhone 17 Pro dimensions)
- Dual-layer scrolling background
- Animated runner character
- Stats panel showing time/pace/heart rate/calories
- Settings modal with speed, heart rate, music inputs
- Warning modal for exercise intensity alerts
- Info modal for milestones
- Audio elements for background music and sound effects
```

### 4. Home Page (home.html)
```
Create a mobile home page for a running app with:
- iPhone 17 frame layout
- Hotspot navigation buttons
- Stats display panel (coins, runs, distance, calories)
- Integration with localStorage for persistent stats
```

### 5. Character Customization (character-customization.html)
```
Create a character customization page with:
- Character preview display
- Equipment slots (jacket, pants, cap)
- Interactive clothing selection
- Save/load customization state
```

## AI Tools Used

All AI tools used in this project are documented below following the required citation format:

[1] ChatGPT, accessed on 2026-04-15, available at https://chat.openai.com/. Used for generating the core game engine logic including start/pause/stop functionality, scrolling animations, and LocalStorage integration.

[2] Claude 3.5 Sonnet, v1.0, accessed on 2026-04-18, available at https://claude.ai/. Used for refining the character customization page structure and providing suggestions for accessibility improvements.

[3] Cursor AI, v0.40, accessed on 2026-04-10, available at https://cursor.com/. Used for code editing, debugging, and vibe coding the storage module with CRUD operations.

[4] GitHub Copilot, accessed on 2026-04-12, available at https://github.com/features/copilot. Used for autocomplete suggestions during the home page development.

[5] Doubao AI, accessed on 2026-04-08, available at https://www.doubao.com/. Used for providing initial instructions and prompts for the running interface design.

## Notes

All AI-generated code was reviewed and modified by the development team to ensure functionality and consistency with the project design.
