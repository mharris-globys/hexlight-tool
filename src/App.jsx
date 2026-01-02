import { useEffect, useCallback } from 'react';
import { useHexGrid } from './hooks/useHexGrid';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HexGrid } from './components/HexGrid';
import { Controls } from './components/Controls';
import { Stats } from './components/Stats';
import { ThemeToggle } from './components/ThemeToggle';
import { UnitToggle } from './components/UnitToggle';
import { GuideToggle } from './components/GuideToggle';

// Conversion factor: 1 inch = 2.54 cm
const INCH_TO_CM = 2.54;

function App() {
  const [theme, setTheme] = useLocalStorage('hexlight-theme', 'dark');
  const [units, setUnits] = useLocalStorage('hexlight-units', 'in');
  const [showGuides, setShowGuides] = useLocalStorage('hexlight-guides', true);

  const {
    // Configuration (internal storage: inches - see useHexGrid for details)
    width,
    setWidth,
    length,
    setLength,
    spacing,
    setSpacing,
    pointyTop,
    setPointyTop,
    mirrorMode,
    setMirrorMode,

    // Limits
    maxSegments,
    setMaxSegments,
    maxJoints2,
    setMaxJoints2,
    maxJoints3,
    setMaxJoints3,
    limitsExceeded,

    // Grid data
    gridDimensions,
    vertices,
    allEdges,
    enabledEdges,
    viewBox,
    pixelSize,

    // Statistics
    stats,

    // Actions
    toggleEdge,
    clearAll,
    getDesignState,
    loadDesignState
  } = useHexGrid();

  // Convert inches to display units
  const toDisplayUnits = useCallback((inches) => {
    return units === 'cm' ? inches * INCH_TO_CM : inches;
  }, [units]);

  // Convert display units to inches
  const toInches = useCallback((value) => {
    return units === 'cm' ? value / INCH_TO_CM : value;
  }, [units]);

  // Handle unit toggle - convert all stored values
  const handleUnitToggle = useCallback(() => {
    setUnits(prev => prev === 'in' ? 'cm' : 'in');
  }, [setUnits]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Hex Light Designer</h1>
        <div className="header-controls">
          <GuideToggle showGuides={showGuides} onToggle={() => setShowGuides(prev => !prev)} />
          <UnitToggle units={units} onToggle={handleUnitToggle} />
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </div>
      </header>

      <main className="main-content">
        <Controls
          width={width}
          setWidth={setWidth}
          length={length}
          setLength={setLength}
          spacing={spacing}
          setSpacing={setSpacing}
          pointyTop={pointyTop}
          setPointyTop={setPointyTop}
          mirrorMode={mirrorMode}
          setMirrorMode={setMirrorMode}
          maxSegments={maxSegments}
          setMaxSegments={setMaxSegments}
          maxJoints2={maxJoints2}
          setMaxJoints2={setMaxJoints2}
          maxJoints3={maxJoints3}
          setMaxJoints3={setMaxJoints3}
          gridDimensions={gridDimensions}
          onClear={clearAll}
          getDesignState={getDesignState}
          loadDesignState={loadDesignState}
          units={units}
          toDisplayUnits={toDisplayUnits}
          toInches={toInches}
        />

        <div className="grid-container">
          <HexGrid
            vertices={vertices}
            allEdges={allEdges}
            enabledEdges={enabledEdges}
            viewBox={viewBox}
            onEdgeClick={toggleEdge}
            jointCounts={stats.jointCounts}
            mirrorMode={mirrorMode}
            pointyTop={pointyTop}
            showGuides={showGuides}
          />
        </div>

        <Stats
          stats={stats}
          maxSegments={maxSegments}
          maxJoints2={maxJoints2}
          maxJoints3={maxJoints3}
          limitsExceeded={limitsExceeded}
          units={units}
          toDisplayUnits={toDisplayUnits}
          spacing={spacing}
          pixelSize={pixelSize}
        />
      </main>
    </div>
  );
}

export default App;
