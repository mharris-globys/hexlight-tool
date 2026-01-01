import { useState, useEffect } from 'react';
import { saveDesign, loadDesigns, deleteDesign } from '../hooks/useLocalStorage';

/**
 * Controls panel component
 * All dimensions are in inches
 */
export function Controls({
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
  maxSegments,
  setMaxSegments,
  maxJoints2,
  setMaxJoints2,
  maxJoints3,
  setMaxJoints3,
  gridDimensions,
  onClear,
  getDesignState,
  loadDesignState
}) {
  // Initialize directly from loadDesigns
  const [savedDesigns, setSavedDesigns] = useState(() => loadDesigns());
  const [saveName, setSaveName] = useState('');

  // Pending values for "Create New" (start with current values)
  const [pendingOrientation, setPendingOrientation] = useState(pointyTop ? 'pointy' : 'flat');
  const [pendingWidth, setPendingWidth] = useState(widthInches);
  const [pendingLength, setPendingLength] = useState(lengthInches);
  const [pendingSpacing, setPendingSpacing] = useState(pointSpacing);

  // Sync pending values when loading a saved design
  useEffect(() => {
    setPendingOrientation(pointyTop ? 'pointy' : 'flat');
    setPendingWidth(widthInches);
    setPendingLength(lengthInches);
    setPendingSpacing(pointSpacing);
  }, [pointyTop, widthInches, lengthInches, pointSpacing]);

  const handleSave = () => {
    const name = saveName.trim() || `Design ${Object.keys(savedDesigns).length + 1}`;
    if (saveDesign(name, getDesignState())) {
      setSavedDesigns(loadDesigns());
      setSaveName('');
    }
  };

  const handleLoad = (name) => {
    const designs = loadDesigns();
    if (designs[name]) {
      loadDesignState(designs[name]);
    }
  };

  const handleDelete = (name, e) => {
    e.stopPropagation();
    if (deleteDesign(name)) {
      setSavedDesigns(loadDesigns());
    }
  };

  const mirrorOptions = [
    { value: 'none', label: 'None' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
    { value: 'both', label: 'Both (Quad)' },
    { value: 'radial', label: 'Radial (180°)' }
  ];

  return (
    <div className="panel">
      {/* Grid Size Section */}
      <div className="panel-section">
        <h3>Grid Size</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Width (in)</label>
            <input
              type="number"
              min="24"
              max="600"
              step="1"
              value={pendingWidth}
              onChange={(e) => setPendingWidth(parseInt(e.target.value) || 24)}
            />
          </div>
          <div className="input-group">
            <label>Length (in)</label>
            <input
              type="number"
              min="24"
              max="600"
              step="1"
              value={pendingLength}
              onChange={(e) => setPendingLength(parseInt(e.target.value) || 24)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Point Spacing (in)</label>
          <input
            type="number"
            min="6"
            max="48"
            step="1"
            value={pendingSpacing}
            onChange={(e) => setPendingSpacing(parseInt(e.target.value) || 18)}
          />
        </div>

        <div className="input-group">
          <label>Hex Orientation</label>
          <select
            value={pendingOrientation}
            onChange={(e) => setPendingOrientation(e.target.value)}
          >
            <option value="pointy">Pointy-top</option>
            <option value="flat">Flat-top</option>
          </select>
        </div>

        <button
          className="primary"
          onClick={() => {
            const newPointyTop = pendingOrientation === 'pointy';
            if (newPointyTop !== pointyTop) {
              setPointyTop(newPointyTop);
            }
            if (pendingWidth !== widthInches) {
              setWidthInches(pendingWidth);
            }
            if (pendingLength !== lengthInches) {
              setLengthInches(pendingLength);
            }
            if (pendingSpacing !== pointSpacing) {
              setPointSpacing(pendingSpacing);
            }
            onClear();
          }}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Create New
        </button>

        <div className="grid-info">
          Grid: {gridDimensions.cols} × {gridDimensions.rows * 2} points<br />
          Actual: {gridDimensions.actualWidth.toFixed(1)}" × {gridDimensions.actualLength.toFixed(1)}"<br />
          Point spacing: {pointSpacing}" between points
        </div>
      </div>

      {/* Mirror Mode Section */}
      <div className="panel-section">
        <h3>Mirror Mode</h3>
        <div className="radio-group">
          {mirrorOptions.map(opt => (
            <label key={opt.value} className="radio-option">
              <input
                type="radio"
                name="mirrorMode"
                value={opt.value}
                checked={mirrorMode === opt.value}
                onChange={() => setMirrorMode(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Limits Section */}
      <div className="panel-section">
        <h3>Limits (0 = unlimited)</h3>
        <div className="input-group">
          <label>Max Segments</label>
          <input
            type="number"
            min="0"
            max="1000"
            value={maxSegments}
            onChange={(e) => setMaxSegments(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Max 2-Joints</label>
          <input
            type="number"
            min="0"
            max="500"
            value={maxJoints2}
            onChange={(e) => setMaxJoints2(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="input-group">
          <label>Max 3-Joints</label>
          <input
            type="number"
            min="0"
            max="500"
            value={maxJoints3}
            onChange={(e) => setMaxJoints3(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Save/Load Section */}
      <div className="panel-section">
        <h3>Save Design</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Design name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="primary" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Saved Designs Section */}
      {Object.keys(savedDesigns).length > 0 && (
        <div className="panel-section">
          <h3>Saved Designs</h3>
          <div className="saved-designs">
            {Object.entries(savedDesigns).map(([name]) => (
              <div
                key={name}
                className="saved-design-item"
                onClick={() => handleLoad(name)}
              >
                <span>{name}</span>
                <button
                  className="delete-btn danger"
                  onClick={(e) => handleDelete(name, e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
