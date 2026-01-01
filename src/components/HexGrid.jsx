import { useMemo } from 'react';
import { calculateMirrorAxes } from '../utils/hexMath';

/**
 * HexGrid component - renders the SVG hex grid
 */
export function HexGrid({
  vertices,
  allEdges,
  enabledEdges,
  viewBox,
  onEdgeClick,
  jointCounts,
  mirrorMode,
  pointyTop
}) {
  // Calculate grid bounds and snapped mirror axis positions (orientation-aware)
  const gridBounds = useMemo(() => {
    return calculateMirrorAxes(vertices, pointyTop);
  }, [vertices, pointyTop]);

  // Create vertex elements
  const vertexElements = useMemo(() => {
    const elements = [];

    for (const [key, vertex] of vertices) {
      const jointCount = jointCounts?.get(key) || 0;
      let className = 'hex-vertex';
      if (jointCount === 1) className += ' missing';
      else if (jointCount === 2) className += ' active-2';
      else if (jointCount >= 3) className += ' active-3';

      elements.push(
        <circle
          key={`v-${key}`}
          cx={vertex.x}
          cy={vertex.y}
          r={4}
          className={className}
        />
      );
    }

    return elements;
  }, [vertices, jointCounts]);

  // Create edge elements
  const edgeElements = useMemo(() => {
    const elements = [];

    for (const edge of allEdges) {
      const v1 = vertices.get(edge.v1);
      const v2 = vertices.get(edge.v2);

      if (!v1 || !v2) continue;

      const isEnabled = enabledEdges.has(edge.key);
      const className = `hex-edge${isEnabled ? ' enabled' : ''}`;

      // Hitbox for easier clicking
      elements.push(
        <line
          key={`h-${edge.key}`}
          x1={v1.x}
          y1={v1.y}
          x2={v2.x}
          y2={v2.y}
          className="hex-edge-hitbox"
          onClick={() => onEdgeClick(edge.key)}
        />
      );

      // Visible edge
      elements.push(
        <line
          key={`e-${edge.key}`}
          x1={v1.x}
          y1={v1.y}
          x2={v2.x}
          y2={v2.y}
          className={className}
          onClick={() => onEdgeClick(edge.key)}
        />
      );
    }

    return elements;
  }, [allEdges, vertices, enabledEdges, onEdgeClick]);

  // Create mirror axis guide lines
  const mirrorGuides = useMemo(() => {
    if (mirrorMode === 'none') return null;

    const { minX, maxX, minY, maxY, centerX, centerY } = gridBounds;
    const padding = 10;
    const elements = [];

    // Vertical line (for horizontal mirroring)
    if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
      elements.push(
        <line
          key="mirror-h"
          x1={centerX}
          y1={minY - padding}
          x2={centerX}
          y2={maxY + padding}
          className="mirror-guide"
        />
      );
    }

    // Horizontal line (for vertical mirroring)
    if (mirrorMode === 'vertical' || mirrorMode === 'both') {
      elements.push(
        <line
          key="mirror-v"
          x1={minX - padding}
          y1={centerY}
          x2={maxX + padding}
          y2={centerY}
          className="mirror-guide"
        />
      );
    }

    // Radial - show both axes with a center point
    if (mirrorMode === 'radial') {
      elements.push(
        <line
          key="mirror-r-h"
          x1={centerX}
          y1={minY - padding}
          x2={centerX}
          y2={maxY + padding}
          className="mirror-guide"
        />,
        <line
          key="mirror-r-v"
          x1={minX - padding}
          y1={centerY}
          x2={maxX + padding}
          y2={centerY}
          className="mirror-guide"
        />,
        <circle
          key="mirror-center"
          cx={centerX}
          cy={centerY}
          r={6}
          className="mirror-center"
        />
      );
    }

    return elements;
  }, [mirrorMode, gridBounds]);

  const viewBoxString = `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;

  return (
    <svg
      className="hex-grid-svg"
      viewBox={viewBoxString}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Render mirror guides first (below everything) */}
      {mirrorGuides && (
        <g className="mirror-guides-group">
          {mirrorGuides}
        </g>
      )}

      {/* Render edges */}
      <g className="edges-group">
        {edgeElements}
      </g>

      {/* Render vertices on top */}
      <g className="vertices-group">
        {vertexElements}
      </g>
    </svg>
  );
}
