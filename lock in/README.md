# Life RPG – Gamified Productivity Application

A modern, mobile-first Progressive Web App (PWA) that transforms real-life responsibilities, studying, fitness, reading, and personal growth into an RPG progression system.

---

## ⚡ Tech Stack & Features

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with dark futuristic gaming aesthetic
- **PWA**: `vite-plugin-pwa` with offline caching, Web App Manifest, and service workers
- **Audio**: Web Audio API arcade synthesizers (100% offline, zero external dependencies)
- **Visuals**: Lucide React icons, Canvas Confetti level-up bursts, glowing neon HUD

---

## 🎮 Core Game Systems

1. **Five Dedicated Quest Categories**:
   - **Daily Quests**: Daily challenges that do not automatically repeat. Add manually or load from saved templates.
   - **Weekly Quests**: Resets at the beginning of each week.
   - **Monthly Quests**: Broad habit challenges that reset at the beginning of each month.
   - **Main Quests**: Permanent epic milestones that remain active until manually completed.
   - **Side Quests**: Optional auxiliary tasks.

2. **Player Profile & Progression**:
   - Level system: Every 100 Lifetime XP increases player level by 1.
   - Lifetime XP persists permanently across all days and cycles.
   - Daily XP tracks today's progress and resets at midnight.
   - RPG Attributes: Wisdom, Strength, Vitality, and Focus scale dynamically with category completions.
   - Editable Player Name in Settings.

3. **Quest Templates**:
   - Preloaded with the 5 default daily quests:
     - SST Written Work (+20 XP)
     - Maths Chapter 13 Complete (+20 XP)
     - Science Chapter 7 Complete (+20 XP)
     - Full Body Workout (+20 XP)
     - Read Two Chapters of The Power of Your Subconscious Mind (+20 XP)
   - Save any quest as a reusable template.
   - 1-tap "Load All Daily Quests" quick morning initialization.

4. **Statistics & Consistency**:
   - 7-day daily XP bar chart.
   - Streak tracking (current and longest streak).
   - Timestamped completed quest log.
   - 12 milestone achievement badges.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
This compiles the TypeScript code, bundles all assets, generates the PWA service worker, and creates an optimized production build inside the `dist/` directory.

### 4. Preview Production Build Locally
```bash
npm run preview
```

---

## 📦 Deployment Options

### Deploy to Vercel
1. Push this project to a GitHub repository or use Vercel CLI.
2. Run:
   ```bash
   npx vercel
   ```
3. Set build command to `npm run build` and output directory to `dist`.

### Deploy to Netlify
1. Connect repository or run:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

### Deploy to Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `dist`

### Deploy with Docker / Static Server
Any static web server (Nginx, Caddy, Cloud Run, or Serve) can host the contents of `dist/`:
```bash
npx serve dist -s -p 3000
```
