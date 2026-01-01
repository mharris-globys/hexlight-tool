import { useState, useEffect } from 'react';
import { saveDesign, loadDesigns, deleteDesign } from '../hooks/useLocalStorage';
import { POINT_SPACING } from '../utils/hexMath';

/**
 * Controls panel component
 */
export function Controls({
  widthFeet,
  setWidthFeet,
  heightFeet,
  setHeightFeet,
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
  const [pendingWidth, setPendingWidth] = useState(widthFeet);
  const [pendingHeight, setPendingHeight] = useState(heightFeet);

  // Sync pending values when loading a saved design
  useEffect(() => {
    setPendingOrientation(pointyTop ? 'pointy' : 'flat');
    setPendingWidth(widthFeet);
    setPendingHeight(heightFeet);
  }, [pointyTop, widthFeet, heightFeet]);

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
            <label>Width (ft)</label>
            <input
              type="number"
              min="3"
              max="50"
              step="0.5"
              value={pendingWidth}
              onChange={(e) => setPendingWidth(parseFloat(e.target.value) || 3)}
            />
          </div>
          <div className="input-group">
            <label>Height (ft)</label>
            <input
              type="number"
              min="3"
              max="50"
              step="0.5"
              value={pendingHeight}
              onChange={(e) => setPendingHeight(parseFloat(e.target.value) || 3)}
            />
          </div>
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
            if (pendingWidth !== widthFeet) {
              setWidthFeet(pendingWidth);
            }
            if (pendingHeight !== heightFeet) {
              setHeightFeet(pendingHeight);
            }
            onClear();
          }}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Create New
        </button>

        <div className="grid-info">
          Grid: {gridDimensions.cols} × {gridDimensions.rows * 2} points<br />
          Actual: {gridDimensions.actualWidth.toFixed(1)}' × {gridDimensions.actualHeight.toFixed(1)}'<br />
          Point spacing: {POINT_SPACING}' between points
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
