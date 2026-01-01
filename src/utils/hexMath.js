/**
 * Hex Grid Mathematics Utility
 *
 * Generates proper hexagonal grids where each vertex connects to exactly 3 neighbors.
 * Supports both pointy-top and flat-top hex orientations.
 * All dimensions are in inches.
 */

// Default spacing between adjacent vertices (edge length of hexagon) in inches
export const DEFAULT_POINT_SPACING = 18; // 18 inches = 1.5 feet

/**
 * Generate a canonical edge key from two vertex keys
 */
export function getEdgeKey(v1, v2) {
  return v1 < v2 ? `${v1}|${v2}` : `${v2}|${v1}`;
}

/**
 * Calculate grid dimensions that fit WITHIN given dimensions (in inches)
 * Grid will never exceed the requested width/length
 * Returns separate counts for even/odd rows or columns to handle stagger
 */
export function getGridDimensions(widthInches, lengthInches, pointSpacing, pointyTop = true) {
  const edgeLength = pointSpacing;

  if (pointyTop) {
    // Pointy-top hex geometry
    // Odd ROWS are offset right, so they may need fewer columns
    const hexWidth = Math.sqrt(3) * edgeLength;  // Width of one hex
    const hexHeight = 2 * edgeLength;            // Height of one hex
    const horizSpacing = hexWidth;               // Horizontal distance between hex centers
    const vertSpacing = 1.5 * edgeLength;        // Vertical distance between hex centers
    const staggerOffset = horizSpacing / 2;      // Odd rows are offset right by this amount

    // Calculate rows (same for all columns in pointy-top)
    const rows = Math.max(1, Math.floor((lengthInches - hexHeight) / vertSpacing) + 1);

    // Calculate cols separately for even and odd rows
    // Even rows: no offset, full width available
    // Odd rows: offset right, so they can fit fewer cols to stay within bounds
    const colsEven = Math.max(1, Math.floor((widthInches - hexWidth) / horizSpacing) + 1);
    const colsOdd = rows > 1
      ? Math.max(1, Math.floor((widthInches - hexWidth - staggerOffset) / horizSpacing) + 1)
      : colsEven; // Use same as even if only 1 row

    // Actual width is based on even rows (primary grid extent)
    const actualWidth = (colsEven - 1) * horizSpacing + hexWidth;
    const actualLength = (rows - 1) * vertSpacing + hexHeight;

    // For pointy-top: cols/colsOdd vary by row, rows/rowsOdd are same (no vertical stagger)
    return { cols: colsEven, colsOdd, rows, rowsOdd: rows, actualWidth, actualLength };
  } else {
    // Flat-top hex geometry
    // Odd COLUMNS are offset down, so they may need fewer rows
    const hexWidth = 2 * edgeLength;             // Width of one hex
    const hexHeight = Math.sqrt(3) * edgeLength; // Height of one hex
    const horizSpacing = 1.5 * edgeLength;       // Horizontal distance between hex centers
    const vertSpacing = hexHeight;               // Vertical distance between hex centers
    const staggerOffset = vertSpacing / 2;       // Odd columns are offset down by this amount

    // Calculate cols (same for all rows in flat-top)
    const cols = Math.max(1, Math.floor((widthInches - hexWidth) / horizSpacing) + 1);

    // Calculate rows separately for even and odd columns
    // Even columns: no offset, full length available
    // Odd columns: offset down, so they can fit fewer rows to stay within bounds
    const rowsEven = Math.max(1, Math.floor((lengthInches - hexHeight) / vertSpacing) + 1);
    const rowsOdd = cols > 1
      ? Math.max(1, Math.floor((lengthInches - hexHeight - staggerOffset) / vertSpacing) + 1)
      : rowsEven; // Use same as even if only 1 column

    // Actual length is based on even columns (primary grid extent)
    const actualWidth = (cols - 1) * horizSpacing + hexWidth;
    const actualLength = (rowsEven - 1) * vertSpacing + hexHeight;

    // For flat-top: rows/rowsOdd vary by column, cols/colsOdd are same (no horizontal stagger)
    return { cols, colsOdd: cols, rows: rowsEven, rowsOdd, actualWidth, actualLength };
  }
}

/**
 * Generate hex centers for the grid
 * Supports ragged grids where even/odd rows or columns have different counts
 */
function generateHexCenters(cols, colsOdd, rows, rowsOdd, size, pointyTop) {
  const centers = [];

  if (pointyTop) {
    const horizSpacing = Math.sqrt(3) * size;
    const vertSpacing = 1.5 * size;

    for (let row = 0; row < rows; row++) {
      // Odd rows may have fewer columns
      const maxCols = (row % 2 === 1) ? (colsOdd || cols) : cols;
      for (let col = 0; col < maxCols; col++) {
        const xOffset = (row % 2 === 1) ? horizSpacing / 2 : 0;
        const x = col * horizSpacing + xOffset + horizSpacing / 2;
        const y = row * vertSpacing + size;
        centers.push({ x, y, col, row });
      }
    }
  } else {
    const horizSpacing = 1.5 * size;
    const vertSpacing = Math.sqrt(3) * size;

    for (let col = 0; col < cols; col++) {
      // Odd columns may have fewer rows
      const maxRows = (col % 2 === 1) ? (rowsOdd || rows) : rows;
      for (let row = 0; row < maxRows; row++) {
        const yOffset = (col % 2 === 1) ? vertSpacing / 2 : 0;
        const x = col * horizSpacing + size;
        const y = row * vertSpacing + yOffset + vertSpacing / 2;
        centers.push({ x, y, col, row });
      }
    }
  }

  return centers;
}

/**
 * Get the 6 vertices of a hexagon given its center
 */
function getHexVertices(cx, cy, size, pointyTop) {
  const vertices = [];
  const startAngle = pointyTop ? -90 : 0;

  for (let i = 0; i < 6; i++) {
    const angleDeg = startAngle + 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    vertices.push({
      x: cx + size * Math.cos(angleRad),
      y: cy + size * Math.sin(angleRad)
    });
  }

  return vertices;
}

/**
 * Generate both vertices and edges for a hex grid
 * This ensures edges use the exact same vertex keys as the vertices map
 * Supports ragged grids with colsOdd/rowsOdd for staggered layouts
 */
export function generateGrid(cols, colsOdd, rows, rowsOdd, size, pointyTop = true) {
  const centers = generateHexCenters(cols, colsOdd, rows, rowsOdd, size, pointyTop);

  // First pass: collect all vertices and assign unique integer IDs
  // Use spatial comparison to deduplicate vertices
  const TOLERANCE = 0.01;
  const vertexList = []; // Array of {x, y}

  // Helper to find or create a vertex
  const getVertexId = (x, y) => {
    // Check if we already have a vertex at this location
    for (let i = 0; i < vertexList.length; i++) {
      const v = vertexList[i];
      if (Math.abs(v.x - x) < TOLERANCE && Math.abs(v.y - y) < TOLERANCE) {
        return i;
      }
    }
    // Create new vertex
    const id = vertexList.length;
    vertexList.push({ x, y });
    return id;
  };

  // Collect all vertices from all hexagons
  for (const center of centers) {
    const hexVerts = getHexVertices(center.x, center.y, size, pointyTop);
    for (const v of hexVerts) {
      getVertexId(v.x, v.y);
    }
  }

  // Build the vertices Map with string keys
  const vertices = new Map();
  for (let i = 0; i < vertexList.length; i++) {
    const key = String(i);
    vertices.set(key, { x: vertexList[i].x, y: vertexList[i].y });
  }

  // Generate edges using vertex IDs
  const edgeSet = new Set();
  const edges = [];

  for (const center of centers) {
    const hexVerts = getHexVertices(center.x, center.y, size, pointyTop);
    const hexVertIds = hexVerts.map(v => getVertexId(v.x, v.y));

    // Connect each vertex to the next (6 edges per hexagon)
    for (let i = 0; i < 6; i++) {
      const id1 = hexVertIds[i];
      const id2 = hexVertIds[(i + 1) % 6];
      const key1 = String(id1);
      const key2 = String(id2);
      const edgeKey = getEdgeKey(key1, key2);

      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({ key: edgeKey, v1: key1, v2: key2 });
      }
    }
  }

  return { vertices, edges };
}

// Wrapper functions for compatibility
export function generateGridVertices(cols, colsOdd, rows, rowsOdd, size, pointyTop = true) {
  const { vertices } = generateGrid(cols, colsOdd, rows, rowsOdd, size, pointyTop);
  return vertices;
}

export function generateGridEdges(cols, colsOdd, rows, rowsOdd, size, pointyTop = true) {
  const { edges } = generateGrid(cols, colsOdd, rows, rowsOdd, size, pointyTop);
  return edges;
}

/**
 * Calculate snapped mirror axis positions that align with grid geometry
 * Returns axis positions that either pass through vertices or bisect edges
 *
 * For proper mirroring:
 * - Flat-top: vertical axis must bisect horizontal segments (midpoints only for X)
 * - Pointy-top: horizontal axis must bisect vertical segments (midpoints only for Y)
 */
export function calculateMirrorAxes(vertices, pointyTop = true) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  const xCoords = new Set();
  const yCoords = new Set();

  for (const v of vertices.values()) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
    xCoords.add(v.x);
    yCoords.add(v.y);
  }

  const sortedX = Array.from(xCoords).sort((a, b) => a - b);
  const sortedY = Array.from(yCoords).sort((a, b) => a - b);

  // Calculate the expected gap size for "large" gaps (1*size vs 0.5*size)
  // Large gaps occur between hex edges we want to bisect
  // Small gaps occur between vertices of the same hex edge
  const allXGaps = [];
  const allYGaps = [];
  for (let i = 0; i < sortedX.length - 1; i++) {
    allXGaps.push(sortedX[i + 1] - sortedX[i]);
  }
  for (let i = 0; i < sortedY.length - 1; i++) {
    allYGaps.push(sortedY[i + 1] - sortedY[i]);
  }

  // Find the larger gap size (approximately 1*size, vs 0.5*size for smaller gaps)
  const maxXGap = allXGaps.length > 0 ? Math.max(...allXGaps) : 0;
  const maxYGap = allYGaps.length > 0 ? Math.max(...allYGaps) : 0;
  const largeGapThreshold = 0.7; // Gaps > 70% of max are "large"

  // Generate valid axis positions based on orientation
  // For flat-top: vertical axis (X) must bisect horizontal segments (large X gaps only)
  // For pointy-top: horizontal axis (Y) must bisect vertical segments (large Y gaps only)
  const validXPositions = [];
  const validYPositions = [];

  for (let i = 0; i < sortedX.length; i++) {
    // For pointy-top, ONLY vertices are valid (no horizontal edges to bisect)
    if (pointyTop) {
      validXPositions.push(sortedX[i]);
    }
    if (i < sortedX.length - 1) {
      const gap = sortedX[i + 1] - sortedX[i];
      // For flat-top, only include midpoints of large gaps (bisects horizontal segments)
      // For pointy-top, NO midpoints (no horizontal edges exist)
      if (!pointyTop && gap > maxXGap * largeGapThreshold) {
        validXPositions.push((sortedX[i] + sortedX[i + 1]) / 2);
      }
    }
  }

  for (let i = 0; i < sortedY.length; i++) {
    // For flat-top, ONLY vertices are valid (no vertical edges to bisect)
    if (!pointyTop) {
      validYPositions.push(sortedY[i]);
    }
    if (i < sortedY.length - 1) {
      const gap = sortedY[i + 1] - sortedY[i];
      // For pointy-top, only include midpoints of large gaps (bisects vertical segments)
      // For flat-top, NO midpoints (no vertical edges exist)
      if (pointyTop && gap > maxYGap * largeGapThreshold) {
        validYPositions.push((sortedY[i] + sortedY[i + 1]) / 2);
      }
    }
  }

  const rawCenterX = (minX + maxX) / 2;
  const rawCenterY = (minY + maxY) / 2;

  // Find best axis - closest to center, prefer making left/top smaller if tied
  const findBestAxis = (positions, center) => {
    if (positions.length === 0) return center;

    let best = positions[0];
    let bestDist = Math.abs(positions[0] - center);

    for (const pos of positions) {
      const dist = Math.abs(pos - center);
      if (dist < bestDist - 0.001) {
        best = pos;
        bestDist = dist;
      } else if (Math.abs(dist - bestDist) < 0.001 && pos < best) {
        // Tied - prefer smaller (left/top)
        best = pos;
      }
    }

    // If center is exactly on a valid position, use it (no nudging)
    return best;
  };

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: findBestAxis(validXPositions, rawCenterX),
    centerY: findBestAxis(validYPositions, rawCenterY)
  };
}

/**
 * Calculate mirrored edge coordinates
 */
export function getMirroredEdges(edgeKey, mirrorMode, cols, rows, pointyTop, vertices, allEdges) {
  if (mirrorMode === 'none') {
    return [edgeKey];
  }

  // Get snapped mirror axes (orientation-aware)
  const { centerX, centerY } = calculateMirrorAxes(vertices, pointyTop);

  // Parse the edge to get vertex coordinates
  const [v1Key, v2Key] = edgeKey.split('|');
  const v1 = vertices.get(v1Key);
  const v2 = vertices.get(v2Key);

  if (!v1 || !v2) return [edgeKey];

  const results = new Set([edgeKey]);
  const TOLERANCE = 0.1;

  // Helper to find nearest vertex to a target point
  const findNearestVertex = (targetX, targetY) => {
    let nearest = null;
    let minDist = Infinity;

    for (const [key, v] of vertices) {
      const dist = Math.hypot(v.x - targetX, v.y - targetY);
      if (dist < minDist) {
        minDist = dist;
        nearest = key;
      }
    }

    return minDist < TOLERANCE ? nearest : null;
  };

  // Helper to find edge key if it exists
  const findEdge = (vKey1, vKey2) => {
    if (!vKey1 || !vKey2) return null;
    const key = getEdgeKey(vKey1, vKey2);
    return allEdges.some(e => e.key === key) ? key : null;
  };

  // Mirror functions
  const mirrorH = (x, y) => [2 * centerX - x, y];
  const mirrorV = (x, y) => [x, 2 * centerY - y];
  const mirrorR = (x, y) => [2 * centerX - x, 2 * centerY - y];

  if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
    const [mx1, my1] = mirrorH(v1.x, v1.y);
    const [mx2, my2] = mirrorH(v2.x, v2.y);
    const mv1 = findNearestVertex(mx1, my1);
    const mv2 = findNearestVertex(mx2, my2);
    const mEdge = findEdge(mv1, mv2);
    if (mEdge) results.add(mEdge);
  }

  if (mirrorMode === 'vertical' || mirrorMode === 'both') {
    const [mx1, my1] = mirrorV(v1.x, v1.y);
    const [mx2, my2] = mirrorV(v2.x, v2.y);
    const mv1 = findNearestVertex(mx1, my1);
    const mv2 = findNearestVertex(mx2, my2);
    const mEdge = findEdge(mv1, mv2);
    if (mEdge) results.add(mEdge);
  }

  if (mirrorMode === 'both') {
    const [mx1, my1] = mirrorR(v1.x, v1.y);
    const [mx2, my2] = mirrorR(v2.x, v2.y);
    const mv1 = findNearestVertex(mx1, my1);
    const mv2 = findNearestVertex(mx2, my2);
    const mEdge = findEdge(mv1, mv2);
    if (mEdge) results.add(mEdge);
  }

  if (mirrorMode === 'radial') {
    const [mx1, my1] = mirrorR(v1.x, v1.y);
    const [mx2, my2] = mirrorR(v2.x, v2.y);
    const mv1 = findNearestVertex(mx1, my1);
    const mv2 = findNearestVertex(mx2, my2);
    const mEdge = findEdge(mv1, mv2);
    if (mEdge) results.add(mEdge);
  }

  return Array.from(results);
}

/**
 * Calculate statistics from enabled edges
 */
export function calculateStats(enabledEdges, allEdges) {
  const segments = enabledEdges.size;
  const jointCounts = new Map();

  // Count edges per vertex
  for (const edge of allEdges) {
    if (enabledEdges.has(edge.key)) {
      jointCounts.set(edge.v1, (jointCounts.get(edge.v1) || 0) + 1);
      jointCounts.set(edge.v2, (jointCounts.get(edge.v2) || 0) + 1);
    }
  }

  let joints2 = 0;
  let joints3 = 0;

  for (const count of jointCounts.values()) {
    if (count === 2) joints2++;
    else if (count >= 3) joints3++;
  }

  return { segments, joints2, joints3, jointCounts };
}
