# Agent Guidelines & Design System Directives

This project adheres to professional frontend design principles to ensure a high-craft, anti-generic user interface.

## Active Project Design Skills

The following specialized design skills are integrated into this project:

1. **Impeccable** (`.agents/skills/impeccable`)
   - **Focus**: Design director standards, design modes (Operate, Persuade, Read), layout polish, typography scale, and avoiding AI slop.
   - **Commands/Actions**: Shape UX flows, polish interactive components, enforce craft floors, audit contrast and responsive behavior.

2. **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`)
   - **Focus**: Design intelligence database containing 50+ styles, 97 color palettes, 57 font pairings, and 99 UX heuristics across priority categories (Accessibility, Touch & Interaction, Performance, Layout & Responsiveness).
   - **Rules**: Strict color-contrast (4.5:1 min), visible focus rings, touch targets (min 44x44px), error feedback, and loading button states.

3. **Taste Skill** (`.agents/skills/taste` / `Leonxlnx/taste-skill`)
   - **Focus**: High-agency frontend craft, calibrated visual variance, motion intensity, typography, and density constraints.
   - **Strict Rules**:
     - No emoji icons in code or UI (use Lucide / SVG primitives instead).
     - Component state isolation and clean responsive layouts (`max-w-[1400px]` / `max-w-7xl`).
     - Calibrated baseline (Design Variance: 8, Motion Intensity: 6, Visual Density: 4).

## Guidelines for Frontend Tasks
Whenever adding, redesigning, or refining UI components in `frontend/src`:
- Reference and apply rules from the local skills in `.agents/skills/`.
- Ensure clean visual hierarchy, crisp typography, and verified accessibility.
