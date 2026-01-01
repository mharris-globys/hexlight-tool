import { useEffect } from 'react';
import { useHexGrid } from './hooks/useHexGrid';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HexGrid } from './components/HexGrid';
import { Controls } from './components/Controls';
import { Stats } from './components/Stats';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const [theme, setTheme] = useLocalStorage('hexlight-theme', 'dark');

  const {
    // Configuration (all in inches)
    widthInches,
    setWidthInches,
    lengthInches,
    setLengthInches,
    pointSpacing,
    setPointSpacing,
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

    // Statistics
    stats,

    // Actions
    toggleEdge,
    clearAll,
    getDesignState,
    loadDesignState
  } = useHexGrid();

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
        <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      </header>

      <main className="main-content">
        <Controls
          widthInches={widthInches}
          setWidthInches={setWidthInches}
          lengthInches={lengthInches}
          setLengthInches={setLengthInches}
          pointSpacing={pointSpacing}
          setPointSpacing={setPointSpacing}
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
          />
        </div>

        <Stats
          stats={stats}
          maxSegments={maxSegments}
          maxJoints2={maxJoints2}
          maxJoints3={maxJoints3}
          limitsExceeded={limitsExceeded}
        />
      </main>
    </div>
  );
}

export default App;
