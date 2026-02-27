# 🎯 Skill Roulette

A fun, interactive web app that challenges you to explore and improve different skills by spinning a colorful wheel. Each spin lands on a random skill and gives you a specific task to complete — great for solo play, group challenges, or just beating boredom.

---

## Project Structure

```
skill-roulette/
├── src/
│   ├── Home.tsx       ← All app logic and UI (React + TypeScript)
│   └── Home.css       ← All styles and animations
├── public/
├── README.md
├── package.json
└── tsconfig.json
```

> The entire app lives in just **two files**: `Home.tsx` and `Home.css` inside the `src/` folder.

---

## Features

- **Spin Wheel** — A colorful HTML5 Canvas wheel with 8 default skills. Spins with a smooth ease-out animation and a red pointer that accurately highlights the selected skill.
- **Random Task** — Each skill has 3 possible tasks. One is randomly assigned every spin.
- **Speech Synthesis** — The app reads out the selected skill and task aloud using the browser's built-in Speech API.
- **Add Custom Skills** — Use the "+ Add Skill" button to add your own skills to the wheel.
- **Progress Page** — Tracks how many times each skill has been spun with a bar chart, plus a full timestamped spin history.
- **Reset** — Clears all spin history and starts fresh.
- **Back Button** — Appears in the header when viewing the Progress page to return to the wheel instantly.
- **Responsive** — Works on desktop, tablet, and mobile.
- **PWA Ready** — Configured as a Progressive Web App so it can be installed on phones.

---

## Default Skills & Tasks

| Skill | Tasks |
|---|---|
| Drawing | Draw your pet from memory · Sketch your hand in 60 seconds · Doodle a dream landscape |
| Dancing | Do the robot for 30 seconds · Choreograph a 10-second move · Dance to a random song's first 15 sec |
| Cooking | Make a dish using only 3 ingredients · Recreate a childhood meal · Invent a new sandwich |
| Singing | Sing your favorite chorus in falsetto · Hum a melody you made up · Beatbox for 20 seconds |
| Coding | Build a button that does something funny · Write a function that surprises you · Create a CSS animation |
| Writing | Write a haiku about your day · Describe your room in 50 words · Start a story with a prompt |
| Yoga | Hold Warrior II for 1 minute · Try a headstand · Do 5 sun salutations |
| Photography | Capture an emotion without faces · Find beauty in something ugly · Shoot 5 frames, tell a story |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Type-safe logic |
| HTML5 Canvas | Drawing the interactive spin wheel |
| CSS3 | Styling and animations |
| Web Speech API | Reading out the selected skill and task |
| Ionic React (optional) | Mobile-friendly UI structure |

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/skill-roulette.git

# 2. Navigate into the project folder
cd skill-roulette

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at `http://localhost:5173` (Vite) or `http://localhost:3000` (Create React App).

---

## How to Use

1. **Spin** — Click the yellow **SPIN** button to spin the wheel.
2. **Read your task** — The result card on the right shows your selected skill and challenge.
3. **Listen** — The app will speak the skill and task aloud (make sure your volume is on).
4. **Add a skill** — Click **+ Add Skill** to add a custom skill to the wheel.
5. **Track progress** — Click **Progress** in the top-right to see your spin history and skill frequency.
6. **Go back** — Use the **← Back** button in the top-left of the Progress page to return to the wheel.
7. **Reset** — Click **↺ Reset** to clear all history and start fresh.

---

## File Reference

### `src/Home.tsx`
Contains all the app logic and JSX markup, including:
- `DEFAULT_SKILLS` — Array of 8 built-in skills with names and colors
- `TASKS` — Map of skill names to their possible challenge tasks
- `getSelectedIndex()` — Math function that calculates which slice the pointer is pointing at based on the current wheel angle
- `drawWheel()` — Canvas drawing function that renders slices, labels, the center hub, and the red pointer triangle
- `App` component — Main React component managing all state: current page, spin animation, result, history, and the add skill modal

### `src/Home.css`
Contains all styles, including:
- CSS variables for the dark theme color palette
- Header 3-column grid layout (back button · centered logo · nav)
- Wheel wrapper and canvas sizing
- Spin button glow animation
- Result card reveal animation
- Progress page bar chart styles
- Add skill modal styles
- Responsive breakpoints for tablet and mobile

---

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy to any static hosting service like Vercel, Netlify, or GitHub Pages.

---

## Deploying to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com) for automatic deployments on every push.
