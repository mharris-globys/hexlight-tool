# Hex Light Designer

A web-based tool for designing hexagonal light installations. Create and visualize hex light patterns with real-time statistics and symmetry mirroring.

## Features

- **Interactive Hex Grid**: Click edges to toggle them on/off
- **Configurable Dimensions**: Set grid width, length, and point spacing (in inches or cm)
- **Hex Orientations**: Choose between pointy-top and flat-top hex layouts
- **Mirror Modes**: Auto-mirror your design with horizontal, vertical, quad, or radial symmetry
- **Real-time Statistics**: Track segments, 2-joints, 3-joints, and missing joints
- **Layout Size**: See the actual bounding box dimensions of your design
- **Configurable Limits**: Set max segments/joints with visual warnings when exceeded
- **Preview Mode**: Toggle off guides to see just your design
- **Save/Load Designs**: Persist designs to local storage
- **Dark/Light Theme**: Toggle between themes
- **Responsive**: Scales to fit your browser window

## Quick Start

### Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
```

The `dist/` folder contains the built app, ready for deployment.

## Usage

1. **Set Grid Size**: Enter width, length, and point spacing in the left panel
2. **Choose Orientation**: Select pointy-top or flat-top hex layout
3. **Click "Create New"**: Generate a fresh grid
4. **Toggle Edges**: Click on edges to enable/disable them
5. **Use Mirror Mode**: Select a symmetry mode for auto-mirroring
6. **Preview**: Click "Guides" to toggle preview mode
7. **Save**: Name and save your design for later

## Tech Stack

- React 18
- Vite
- Pure CSS (no framework)

## Internal Units

All dimensions are stored internally in **inches**. The UI converts to/from centimeters based on the unit toggle in the header.

## License

MIT
