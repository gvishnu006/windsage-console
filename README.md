# WindSage &middot; Industrial Wind Turbine O&M Console

> **AI-Based SCADA Alarm Tracking & Recurrence Analytics to Reduce Lost Production Factor (LPF)**  
> Production-grade React + TypeScript + Tailwind CSS control room interface with human-crafted industrial aesthetics and curated [React Bits](https://reactbits.dev) animations.

---

## 1. Quick Start & Execution

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Build for production with strict TypeScript checks
npm run build

# Preview production build
npm run preview
```

---

## 2. Project Folder Structure

```
c:\Users\ADMIN\Downloads\pic\PRJECTX
├── index.html                       # HTML entry point with Space Grotesk, IBM Plex Sans, JetBrains Mono
├── package.json                     # Dependencies: React 19, Framer Motion, Lucide, Tailwind CSS
├── postcss.config.js                # PostCSS with Tailwind & Autoprefixer
├── tailwind.config.js               # Industrial ink & wind teal color palette, custom fonts, animations
├── tsconfig.json / tsconfig.app.json# TypeScript configuration
├── src/
│   ├── main.tsx                     # React root mount
│   ├── index.css                    # Tailwind directives, custom scrollbars, scanlines & star-movement keyframes
│   ├── App.tsx                      # Root component orchestrating header, sidebar, screens, drawer & toasts
│   ├── data/
│   │   └── windsage.ts              # 100% faithful port of data.js with strict TypeScript types & deterministic PRNG
│   ├── hooks/
│   │   └── useWindSage.ts           # Central state hook: store, filtering, sorting, actions, dark mode, toasts
│   ├── utils/
│   │   └── formatters.ts            # Formatting for dates, durations, energy MWh, and datetime inputs
│   └── components/
│       ├── common/
│       │   ├── Header.tsx           # Top navigation bar with rotating turbine logo, live clock, theme toggle & reset
│       │   ├── Sidebar.tsx          # Left control sidebar with sliding indicator & turbine fleet status matrix
│       │   └── StatusBadges.tsx     # RankChip (P1/P2/P3), SevChip, StatusChip, DueBadge
│       ├── screens/
│       │   ├── OverviewScreen.tsx   # Bento-grid overview with Aurora, urgent strip, CountUp KPIs & category loss
│       │   ├── IncidentsScreen.tsx  # Work item table with multi-filter bar, search, and responsive mobile cards
│       │   ├── RecurrenceScreen.tsx # 60-day recurring failure patterns & 14-day post-fix verification tracking
│       │   └── AnalysisScreen.tsx   # DMAIC 5-phase root cause workbench, telemetry evidence & pattern history
│       ├── drawer/
│       │   └── IncidentDrawer.tsx   # Spring slide-in drawer with technician assignment, workflow & activity log
│       └── reactbits/               # Curated React Bits animation components
│           ├── Aurora.tsx           # Deep teal fluid canvas background (lazy-loaded, 60fps)
│           ├── CountUp.tsx          # Animated number counter on load and change (tabular nums)
│           ├── SpotlightCard.tsx    # Interactive radial cursor glow for KPI cards
│           ├── BlurText.tsx         # Progressive blur-to-sharp entrance animation on initial load
│           ├── StarBorder.tsx       # Orbiting glowing border for critical & overdue incidents
│           ├── AnimatedContent.tsx  # Staggered entrance for cards, list items and cards
│           ├── SlidingNav.tsx       # Framer Motion layoutId sliding tab indicator
│           ├── TurbineLogo.tsx      # SVG wind turbine with rotation speed linked to fleet alert status
│           ├── Drawer.tsx           # Accessible spring drawer with blurred scrim & focus trap
│           └── Toast.tsx            # Slide-and-fade toast notifications
```

---

## 3. React Bits Components & Where Used

| React Bits Component | Location / Usage in WindSage | Purpose & Behavior |
| :--- | :--- | :--- |
| **Aurora** (`Aurora.tsx`) | `OverviewScreen.tsx` (Overview header banner) | Deep teal fluid canvas background, low opacity, lazy-loaded via `React.lazy`, respects `prefers-reduced-motion`. |
| **CountUp** (`CountUp.tsx`) | `OverviewScreen.tsx` (All 5 KPI cards) | Animates numbers from 0 to value on load and transitions smoothly when data regenerates or changes. |
| **SpotlightCard** (`SpotlightCard.tsx`) | `OverviewScreen.tsx` (KPI cards & metric cards) | Dynamic radial cursor tracking glow (`#17556f` teal) on hover and focus. |
| **BlurText** (`BlurText.tsx`) | `Header.tsx` ("WINDSAGE"), `OverviewScreen.tsx` ("Fleet overview") | First-load staggered word/character blur-to-sharp reveal. |
| **StarBorder** (`StarBorder.tsx`) | `OverviewScreen.tsx` ("Needs attention now" strip), `IncidentsScreen.tsx` (Critical/overdue cards) | Soft pulsing border highlight for `Critical` severity and overdue alarms. |
| **AnimatedContent** (`AnimatedContent.tsx`) | `OverviewScreen.tsx` (Category bars, list items), `IncidentsScreen.tsx` (Mobile cards) | Staggered 30–40ms entrance animation with cubic easing. |
| **SlidingNav** (`SlidingNav.tsx`) | `Sidebar.tsx` (Desktop & tablet navigation) | Shared `layoutId="activeNavIndicator"` spring sliding pill across Overview, Incidents, Recurrence, and Root cause. |
| **TurbineLogo** (`TurbineLogo.tsx`) | `Header.tsx` (Brand logo) | SVG 3-blade wind turbine with rotation speed dynamically coupled to active critical alarm count. |
| **Drawer** (`Drawer.tsx`) | `IncidentDrawer.tsx` (Work item detail) | Spring physics slide-in from right (`damping: 28, stiffness: 260`), blurred backdrop scrim, keyboard Esc close, focus trap. |
| **Toast** (`Toast.tsx`) | `App.tsx` & `useWindSage.ts` (Global notifications) | Staggered slide + fade in/out container for workflow action feedback. |

---

## 4. Verification & Behavioral Fidelity

Every feature, formula, parameter, and rule from `data.js` and `app.js` is preserved identically:
- **Seed Determinism:** Seeded `mulberry32(20261023)` pseudo-random generator generates the exact same synthetic 90-day incident history, turbine biases, and sticky items (`INC-9001` through `INC-9004`).
- **LPF Calculation:** `Downtime × 4.2 MW × 38% Capacity Factor × Severity Factor (Critical 100%, Major 55%, Minor 15%)`.
- **Priority Algorithm:** `SEV_BASE + min(18, freq14*5) + min(20, loss*1.2) + (active?6:0) + (overdue?8:0) + (escalated?4:0)` with `P1 (>=75)`, `P2 (>=48)`, `P3 (<48)`.
- **Workflow State Machine:** 
  - `start`: Only available when `New` or `Assigned` (requires owner assigned first).
  - `resolve`: Marks incident as `Resolved` with timestamp `resolvedAt`.
  - `close`: Only allowed when `Resolved`; checks 14-day verification window.
  - `notify`: Sends reminder to owner if assigned.
  - `escalate`: Marks incident as escalated (+4 priority points).
  - `assign`: Saves team, owner, and deadline, transitioning `New` to `Assigned`.
- **Recurrence Filtering:** Clicking a pattern in Overview or Recurrence automatically transitions to the Incidents tab pre-filtered by Turbine + Category with `openOnly: true`.
- **Reset Button:** Clears `localStorage` key `"windsage-demo-v3"` and regenerates the fresh dataset.

---

## 5. UI & UX Improvements (Non-Generic Industrial Design)

1. **"Needs attention now" Strip:** Above the KPIs on Overview, displaying the top 3 highest impact active alarms with their MWh lost, SLA countdown, and quick drawer launcher.
2. **Turbine Fleet Health Matrix:** Real-time 8-turbine visual status array (WTG-01 to WTG-08) on the sidebar with live health beacons.
3. **Control Room Typography & Color System:** Space Grotesk headings, IBM Plex Sans labels, JetBrains Mono tabular numbers; deep ink navy (`#090d13`) dark mode and warm off-white (`#f8fafc`) light mode.
4. **Accessible Keyboard & Screen Reader UX:** WAI-ARIA labels on dialogs, filters, buttons; Esc closes the drawer; full keyboard navigation support.
5. **Reduced Motion Compliance:** `prefers-reduced-motion` media queries disable non-essential animations across Aurora, StarBorder, and AnimatedContent.

---

## 6. Credits
- **React Bits**: Animation primitives adapted from [reactbits.dev](https://reactbits.dev) (Aurora, CountUp, SpotlightCard, BlurText, StarBorder, AnimatedContent, SlidingNav).
- **Lucide Icons**: Industrial stroked icons from [lucide.react](https://lucide.dev).
- **Framer Motion**: Smooth spring layout and dialog transitions.
