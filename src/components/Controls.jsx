import { useState, useEffect, useRef } from 'react';
import { saveDesign, loadDesigns, deleteDesign } from '../hooks/useLocalStorage';

/**
 * Controls panel component
 *
 * All dimensions are stored internally in INCHES (see useHexGrid).
 * This component converts to/from display units (in/cm) for the UI.
 */
export function Controls({
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
  maxSegments,
  setMaxSegments,
  maxJoints2,
  setMaxJoints2,
  maxJoints3,
  setMaxJoints3,
  gridDimensions,
  onClear,
  getDesignState,
  loadDesignState,
  units,
  toDisplayUnits,
  toInches
}) {
  // Track previous values to detect changes
  const prevUnits = useRef(units);
  const prevWidth = useRef(width);
  const prevLength = useRef(length);
  const prevSpacing = useRef(spacing);
  const prevPointyTop = useRef(pointyTop);

  // Initialize directly from loadDesigns
  const [savedDesigns, setSavedDesigns] = useState(() => loadDesigns());
  const [saveName, setSaveName] = useState('');

  // Pending values for "Create New" (start with current values in display units)
  // Store as strings to allow empty input during editing
  const [pendingOrientation, setPendingOrientation] = useState(pointyTop ? 'pointy' : 'flat');
  const [pendingWidth, setPendingWidth] = useState(String(Math.round(toDisplayUnits(width) * 100) / 100));
  const [pendingLength, setPendingLength] = useState(String(Math.round(toDisplayUnits(length) * 100) / 100));
  const [pendingSpacing, setPendingSpacing] = useState(String(Math.round(toDisplayUnits(spacing) * 100) / 100));

  // Sync pending values when design state changes (e.g., loading a saved design)
  useEffect(() => {
    const stateChanged =
      prevWidth.current !== width ||
      prevLength.current !== length ||
      prevSpacing.current !== spacing ||
      prevPointyTop.current !== pointyTop;

    if (stateChanged) {
      setPendingOrientation(pointyTop ? 'pointy' : 'flat');
      setPendingWidth(String(Math.round(toDisplayUnits(width) * 100) / 100));
      setPendingLength(String(Math.round(toDisplayUnits(length) * 100) / 100));
      setPendingSpacing(String(Math.round(toDisplayUnits(spacing) * 100) / 100));

      prevWidth.current = width;
      prevLength.current = length;
      prevSpacing.current = spacing;
      prevPointyTop.current = pointyTop;
    }
  }, [pointyTop, width, length, spacing, toDisplayUnits]);

  // Convert pending values when units change
  useEffect(() => {
    if (prevUnits.current !== units) {
      // Convert existing pending values to new units
      const conversionFactor = units === 'cm' ? 2.54 : 1 / 2.54;

      const convertValue = (strVal) => {
        const num = parseFloat(strVal);
        if (isNaN(num)) return strVal;
        return String(Math.round(num * conversionFactor * 100) / 100);
      };

      setPendingWidth(convertValue(pendingWidth));
      setPendingLength(convertValue(pendingLength));
      setPendingSpacing(convertValue(pendingSpacing));

      prevUnits.current = units;
    }
  }, [units, pendingWidth, pendingLength, pendingSpacing]);

  // Validation for dimension inputs (in current display units)
  const minDim = units === 'cm' ? 61 : 24;    // ~24 inches
  const maxDim = units === 'cm' ? 1524 : 600; // ~600 inches
  const minSpacing = units === 'cm' ? 15 : 6; // ~6 inches
  const maxSpacing = units === 'cm' ? 122 : 48; // ~48 inches

  const isValidDimension = (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  const isFormValid =
    isValidDimension(pendingWidth, minDim, maxDim) &&
    isValidDimension(pendingLength, minDim, maxDim) &&
    isValidDimension(pendingSpacing, minSpacing, maxSpacing);

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

  const unitLabel = units === 'cm' ? 'cm' : 'in';

  return (
    <div className="panel">
      {/* Grid Size Section */}
      <div className="panel-section">
        <h3>Grid Size</h3>
        <div className="input-row">
          <div className="input-group">
            <label>Width ({unitLabel})</label>
            <input
              type="number"
              min={minDim}
              max={maxDim}
              step="0.01"
              value={pendingWidth}
              onChange={(e) => setPendingWidth(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Length ({unitLabel})</label>
            <input
              type="number"
              min={minDim}
              max={maxDim}
              step="0.01"
              value={pendingLength}
              onChange={(e) => setPendingLength(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Point Spacing ({unitLabel})</label>
          <input
            type="number"
            min={minSpacing}
            max={maxSpacing}
            step="0.01"
            value={pendingSpacing}
            onChange={(e) => setPendingSpacing(e.target.value)}
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
          disabled={!isFormValid}
          onClick={() => {
            if (!isFormValid) return;
            const newPointyTop = pendingOrientation === 'pointy';
            // Convert display units to inches for storage
            const newWidth = Math.round(toInches(parseFloat(pendingWidth)));
            const newLength = Math.round(toInches(parseFloat(pendingLength)));
            const newSpacing = Math.round(toInches(parseFloat(pendingSpacing)));

            if (newPointyTop !== pointyTop) {
              setPointyTop(newPointyTop);
            }
            if (newWidth !== width) {
              setWidth(newWidth);
            }
            if (newLength !== length) {
              setLength(newLength);
            }
            if (newSpacing !== spacing) {
              setSpacing(newSpacing);
            }
            onClear();
          }}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Create New
        </button>

        <div className="grid-info">
          Grid: {gridDimensions.cols}{gridDimensions.colsOdd !== gridDimensions.cols ? `/${gridDimensions.colsOdd}` : ''} × {gridDimensions.rows}{gridDimensions.rowsOdd !== gridDimensions.rows ? `/${gridDimensions.rowsOdd}` : ''} hexes<br />
          Actual: {toDisplayUnits(gridDimensions.actualWidth).toFixed(1)}{unitLabel} × {toDisplayUnits(gridDimensions.actualLength).toFixed(1)}{unitLabel}<br />
          Point spacing: {toDisplayUnits(spacing).toFixed(1)}{unitLabel} between points
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
