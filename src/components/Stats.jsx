/**
 * Stats panel component
 */
export function Stats({
  stats,
  maxSegments,
  maxJoints2,
  maxJoints3,
  limitsExceeded,
  units,
  toDisplayUnits,
  pointSpacing,
  pixelSize
}) {
  const formatLimit = (max) => max > 0 ? `/ ${max}` : '';
  const hasMissingJoints = stats.joints1 > 0;
  const unitLabel = units === 'cm' ? 'cm' : 'in';

  // Convert bounding box from pixels to real units
  // pixels / pixelSize * pointSpacing = inches, then convert to display units
  const pixelsToUnits = (pixels) => {
    const inches = (pixels / pixelSize) * pointSpacing;
    return toDisplayUnits(inches);
  };

  const layoutWidth = stats.boundingBox ? pixelsToUnits(stats.boundingBox.width) : 0;
  const layoutHeight = stats.boundingBox ? pixelsToUnits(stats.boundingBox.height) : 0;

  return (
    <div className="panel">
      <div className="panel-section">
        <h3>Statistics</h3>

        <div className="stat-item">
          <span className="stat-label">Segments</span>
          <div>
            <span className={`stat-value${limitsExceeded.segments ? ' warning' : ''}`}>
              {stats.segments}
            </span>
            {maxSegments > 0 && (
              <span className="stat-limit"> {formatLimit(maxSegments)}</span>
            )}
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-label">2-Joints</span>
          <div>
            <span className={`stat-value${limitsExceeded.joints2 ? ' warning' : ''}`}>
              {stats.joints2}
            </span>
            {maxJoints2 > 0 && (
              <span className="stat-limit"> {formatLimit(maxJoints2)}</span>
            )}
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-label">3-Joints</span>
          <div>
            <span className={`stat-value${limitsExceeded.joints3 ? ' warning' : ''}`}>
              {stats.joints3}
            </span>
            {maxJoints3 > 0 && (
              <span className="stat-limit"> {formatLimit(maxJoints3)}</span>
            )}
          </div>
        </div>

        {hasMissingJoints && (
          <div className="stat-item">
            <span className="stat-label">Missing Joints</span>
            <span className="stat-value warning">{stats.joints1}</span>
          </div>
        )}
      </div>

      {stats.segments > 0 && (
        <div className="panel-section">
          <h3>Layout Size</h3>
          <div className="stat-item">
            <span className="stat-label">Width</span>
            <span className="stat-value">{layoutWidth.toFixed(1)}{unitLabel}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Length</span>
            <span className="stat-value">{layoutHeight.toFixed(1)}{unitLabel}</span>
          </div>
        </div>
      )}

      <div className="panel-section">
        <h3>Legend</h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)', marginRight: '0.5rem' }}></span>
            Missing joint (dead end)
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent)', marginRight: '0.5rem' }}></span>
            2-joint vertex
          </p>
          <p>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', marginRight: '0.5rem' }}></span>
            3+ joint vertex
          </p>
        </div>
      </div>

      <div className="panel-section">
        <h3>Tips</h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>Click on edges to toggle them on/off.</p>
          <p style={{ marginTop: '0.5rem' }}>Use mirror modes to create symmetric patterns.</p>
        </div>
      </div>
    </div>
  );
}
