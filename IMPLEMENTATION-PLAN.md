# Hex Grid Light Design Tool - Implementation Plan

## Overview
A React + Vite web application for designing hex light patterns with clickable edges, real-time statistics, mirroring modes, and persistent storage.

## Tech Stack
- React 18 + Vite
- SVG for grid rendering
- CSS variables for theming
- Local Storage for persistence

---

## Phase 1: Project Setup & Core Infrastructure

### Task 1.1: Initialize Vite React Project
- Run `npm create vite@latest . -- --template react`
- Clean up default files (remove App.css content, logo imports)
- Verify dev server runs

### Task 1.2: Create Base CSS with Theme Variables
- Create CSS variables for dark/light themes
- Add base styles for layout (flexbox grid)
- Include theme toggle mechanism via data attribute

### Task 1.3: Create App Shell Layout
- Header with title and theme toggle
- Main area split: controls panel (left) + grid canvas (center) + stats panel (right)
- Responsive container that fills viewport

---

## Phase 2: Hex Grid Mathematics & Data Model

### Task 2.1: Create hexMath.js Utility Module
- `getHexVertices(centerX, centerY, size, pointyTop)` - returns 6 vertex positions
- `axialToPixel(q, r, size, pointyTop)` - convert axial coords to pixel position
- `getEdgeKey(v1, v2)` - canonical string key for edge (sorted for consistency)
- `getGridDimensions(widthFeet, heightFeet, spacing)` - calculate grid size

### Task 2.2: Create useHexGrid Custom Hook
- State: `enabledEdges` (Set), `gridConfig` (width, height, orientation)
- Derived: all vertices, all possible edges, edge-to-vertices mapping
- Methods: `toggleEdge(edgeKey)`, `clearAll()`, `setGridSize(w, h)`

### Task 2.3: Implement Joint Statistics Calculation
- Count edges per vertex (joint)
- Filter for 2-segment joints and 3-segment joints
- Memoize calculations for performance

---

## Phase 3: SVG Grid Rendering

### Task 3.1: Create HexGrid Component Structure
- SVG container with viewBox for scaling
- Calculate viewBox from grid dimensions
- Handle window resize for responsive scaling

### Task 3.2: Render Grid Vertices (Points)
- Map all vertex positions to SVG circles
- Small dots to show intersection points
- Style based on joint count (optional visual indicator)

### Task 3.3: Render Grid Edges (Segments)
- Map all possible edges to SVG lines
- Differentiate enabled vs disabled edges (opacity, stroke width)
- Add click handlers to toggle edges

### Task 3.4: Implement Edge Click Detection
- Use transparent wider stroke for better click target
- Call toggleEdge on click
- Visual feedback on hover

---

## Phase 4: Controls Panel

### Task 4.1: Grid Size Controls
- Width input (feet) with number input
- Height input (feet) with number input
- Hex orientation toggle (pointy-top / flat-top)
- Display calculated grid dimensions (columns × rows)

### Task 4.2: Mirror Mode Selector
- Radio buttons or dropdown for: none, horizontal, vertical, both, radial
- Visual icon/diagram showing mirror behavior
- Store in state for use during edge toggle

### Task 4.3: Limit Configuration Controls
- Max segments input (0 = unlimited)
- Max 2-joints input (0 = unlimited)
- Max 3-joints input (0 = unlimited)
- Clear all button

---

## Phase 5: Statistics Display & Limit Warnings

### Task 5.1: Create Stats Component
- Display: total enabled segments
- Display: count of 2-segment joints
- Display: count of 3-segment joints
- Clean layout with labels

### Task 5.2: Implement Limit Warning Styling
- Compare current values to limits
- Apply warning class when limit exceeded
- Visual indicator (red color, background, icon)

---

## Phase 6: Mirroring Logic

### Task 6.1: Implement Horizontal Mirroring
- Calculate grid center line
- Mirror edge coordinates across vertical axis
- Toggle both original and mirrored edge

### Task 6.2: Implement Vertical Mirroring
- Calculate grid center line
- Mirror edge coordinates across horizontal axis
- Toggle both original and mirrored edge

### Task 6.3: Implement Both (Quad) Mirroring
- Combine horizontal and vertical
- Toggle all 4 symmetric edges

### Task 6.4: Implement Radial Mirroring
- Mirror to diametrically opposed quadrant only
- 180-degree rotation around center
- Toggle original and rotated edge

---

## Phase 7: Persistence & Polish

### Task 7.1: Implement Local Storage Save
- Save on every edge toggle (debounced)
- Store: enabledEdges, gridConfig, mirrorMode, limits, theme
- Use JSON serialization for Set

### Task 7.2: Implement Local Storage Load
- Load state on app mount
- Handle missing/corrupted data gracefully
- Validate loaded grid dimensions

### Task 7.3: Add Design Management
- Save current design with name
- List saved designs
- Load/delete saved designs

### Task 7.4: Theme Toggle Implementation
- Toggle button in header
- Persist theme preference
- Smooth transition between themes

### Task 7.5: Final Polish
- Add keyboard shortcuts (Escape to clear selection, etc.)
- Ensure responsive behavior on window resize
- Test all mirror modes thoroughly
- Add brief instructions/help text

---

## File Structure

```
hextool/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── components/
│   │   ├── HexGrid.jsx
│   │   ├── Controls.jsx
│   │   ├── Stats.jsx
│   │   └── ThemeToggle.jsx
│   ├── hooks/
│   │   ├── useHexGrid.js
│   │   └── useLocalStorage.js
│   └── utils/
│       └── hexMath.js
└── IMPLEMENTATION-PLAN.md
```

---

## Acceptance Criteria

1. Grid displays correctly sized hex pattern based on feet input
2. Clicking edges toggles them on/off with visual feedback
3. Statistics update in real-time
4. Limit warnings appear when thresholds exceeded
5. All 5 mirror modes work correctly
6. Designs persist across browser refresh
7. Theme toggle works smoothly
8. Grid scales responsively to window size
