/**
 * Stats panel component
 */
export function Stats({
  stats,
  maxSegments,
  maxJoints2,
  maxJoints3,
  limitsExceeded
}) {
  const formatLimit = (max) => max > 0 ? `/ ${max}` : '';

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
      </div>

      <div className="panel-section">
        <h3>Legend</h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent)', marginRight: '0.5rem' }}></span>
            2-joint vertex
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', marginRight: '0.5rem' }}></span>
            3+ joint vertex
          </p>
          <p>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)', marginRight: '0.5rem' }}></span>
            Limit exceeded
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
