# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

This is a React + Vite app for designing hexagonal light installations.

### Key Layers

1. **hexMath.js** (`src/utils/`) - Pure math functions for hex grid geometry
   - Grid generation (pointy-top and flat-top orientations)
   - Ragged grid support (even/odd rows or columns can have different counts)
   - Mirror axis calculation and edge mirroring
   - Statistics calculation (segments, joints, bounding box)

2. **useHexGrid.js** (`src/hooks/`) - Central state management hook
   - All grid configuration state (width, length, spacing, orientation)
   - Edge toggle logic with mirroring
   - Save/load design state
   - Exposes everything needed by UI components

3. **App.jsx** - Wires everything together, passes props to child components

4. **Components** (`src/components/`)
   - `HexGrid.jsx` - SVG rendering of the grid
   - `Controls.jsx` - Left panel with grid settings
   - `Stats.jsx` - Right panel with statistics

### Critical Concepts

**Internal Units**: All dimensions are stored in **INCHES** internally. The UI layer converts to/from centimeters based on user preference. When modifying dimension-related code, always work in inches and use `toDisplayUnits()` / `toInches()` for UI display/input.

**Ragged Grids**: Hex grids with staggered rows/columns may have different cell counts for even vs odd rows (pointy-top) or columns (flat-top). The `gridDimensions` object contains `cols`, `colsOdd`, `rows`, `rowsOdd` to handle this.

**Edge Keys**: Edges are identified by canonical keys in format `"vertexId1|vertexId2"` where the smaller ID comes first.

**Mirror Modes**: `none`, `horizontal`, `vertical`, `both`, `radial` - the mirror axis snaps to valid grid positions based on hex geometry.

### State Persistence

All state uses `useLocalStorage` hook with `hexlight-*` prefixed keys. Saved designs support legacy format (widthInches/lengthInches/pointSpacing) for backwards compatibility.
