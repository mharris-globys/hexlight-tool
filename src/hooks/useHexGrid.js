import { useMemo, useCallback } from 'react';
import {
  getGridDimensions,
  generateGrid,
  getMirroredEdges,
  calculateStats,
  DEFAULT_POINT_SPACING
} from '../utils/hexMath';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for managing hex grid state
 *
 * INTERNAL UNITS: All dimension values (width, length, spacing) are stored
 * internally in INCHES. Display conversion to cm happens in the UI layer.
 */
export function useHexGrid() {
  // Grid configuration (internal storage: inches)
  const [width, setWidth] = useLocalStorage('hexlight-width', 120); // 10 feet
  const [length, setLength] = useLocalStorage('hexlight-length', 96); // 8 feet
  const [spacing, setSpacing] = useLocalStorage('hexlight-spacing', DEFAULT_POINT_SPACING);
  const [pointyTop, setPointyTop] = useLocalStorage('hexlight-pointytop', true);
  const [mirrorMode, setMirrorMode] = useLocalStorage('hexlight-mirror', 'none');

  // Limits
  const [maxSegments, setMaxSegments] = useLocalStorage('hexlight-max-segments', 0);
  const [maxJoints2, setMaxJoints2] = useLocalStorage('hexlight-max-joints2', 0);
  const [maxJoints3, setMaxJoints3] = useLocalStorage('hexlight-max-joints3', 0);

  // Enabled edges (stored as array for JSON serialization)
  const [enabledEdgesArray, setEnabledEdgesArray] = useLocalStorage('hexlight-edges', []);

  // Convert array to Set for efficient lookups
  const enabledEdges = useMemo(() => new Set(enabledEdgesArray), [enabledEdgesArray]);

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    return getGridDimensions(width, length, spacing, pointyTop);
  }, [width, length, spacing, pointyTop]);

  // Use a consistent pixel size for rendering (pixels per inch of point spacing)
  const pixelSize = 30; // pixels per unit of point spacing

  // Generate vertices and edges together to ensure consistent vertex keys
  // Pass separate counts for even/odd rows or columns (ragged grid support)
  const { vertices, allEdges } = useMemo(() => {
    const grid = generateGrid(
      gridDimensions.cols,
      gridDimensions.colsOdd,
      gridDimensions.rows,
      gridDimensions.rowsOdd,
      pixelSize,
      pointyTop
    );
    return { vertices: grid.vertices, allEdges: grid.edges };
  }, [gridDimensions.cols, gridDimensions.colsOdd, gridDimensions.rows, gridDimensions.rowsOdd, pixelSize, pointyTop]);

  // Filter enabled edges to only include valid edges for current grid
  const validEnabledEdges = useMemo(() => {
    const validEdgeKeys = new Set(allEdges.map(e => e.key));
    const valid = new Set();
    for (const key of enabledEdges) {
      if (validEdgeKeys.has(key)) {
        valid.add(key);
      }
    }
    return valid;
  }, [enabledEdges, allEdges]);

  // Calculate statistics (pass vertices for bounding box calculation)
  const stats = useMemo(() => {
    return calculateStats(validEnabledEdges, allEdges, vertices);
  }, [validEnabledEdges, allEdges, vertices]);

  // Check if limits are exceeded
  const limitsExceeded = useMemo(() => ({
    segments: maxSegments > 0 && stats.segments > maxSegments,
    joints2: maxJoints2 > 0 && stats.joints2 > maxJoints2,
    joints3: maxJoints3 > 0 && stats.joints3 > maxJoints3
  }), [stats, maxSegments, maxJoints2, maxJoints3]);

  // Toggle an edge (with mirroring)
  const toggleEdge = useCallback((edgeKey) => {
    const edgesToToggle = getMirroredEdges(
      edgeKey,
      mirrorMode,
      gridDimensions.cols,
      gridDimensions.rows,
      pointyTop,
      vertices,
      allEdges
    );

    setEnabledEdgesArray(prev => {
      const current = new Set(prev);
      const isCurrentlyEnabled = current.has(edgeKey);

      for (const key of edgesToToggle) {
        if (isCurrentlyEnabled) {
          current.delete(key);
        } else {
          current.add(key);
        }
      }

      return Array.from(current);
    });
  }, [mirrorMode, gridDimensions.cols, gridDimensions.rows, pointyTop, vertices, allEdges, setEnabledEdgesArray]);

  // Clear all edges
  const clearAll = useCallback(() => {
    setEnabledEdgesArray([]);
  }, [setEnabledEdgesArray]);

  // Get current design state for saving
  // Note: Save format uses explicit property names for clarity and backwards compatibility
  const getDesignState = useCallback(() => ({
    width,
    length,
    spacing,
    pointyTop,
    mirrorMode,
    enabledEdges: enabledEdgesArray,
    maxSegments,
    maxJoints2,
    maxJoints3
  }), [width, length, spacing, pointyTop, mirrorMode, enabledEdgesArray, maxSegments, maxJoints2, maxJoints3]);

  // Load a design state
  // Supports both old format (widthInches/lengthInches/pointSpacing) and new format (width/length/spacing)
  const loadDesignState = useCallback((design) => {
    if (design.width !== undefined) setWidth(design.width);
    else if (design.widthInches !== undefined) setWidth(design.widthInches); // legacy support
    if (design.length !== undefined) setLength(design.length);
    else if (design.lengthInches !== undefined) setLength(design.lengthInches); // legacy support
    if (design.spacing !== undefined) setSpacing(design.spacing);
    else if (design.pointSpacing !== undefined) setSpacing(design.pointSpacing); // legacy support
    if (design.pointyTop !== undefined) setPointyTop(design.pointyTop);
    if (design.mirrorMode !== undefined) setMirrorMode(design.mirrorMode);
    if (design.enabledEdges !== undefined) setEnabledEdgesArray(design.enabledEdges);
    if (design.maxSegments !== undefined) setMaxSegments(design.maxSegments);
    if (design.maxJoints2 !== undefined) setMaxJoints2(design.maxJoints2);
    if (design.maxJoints3 !== undefined) setMaxJoints3(design.maxJoints3);
  }, [setWidth, setLength, setSpacing, setPointyTop, setMirrorMode, setEnabledEdgesArray, setMaxSegments, setMaxJoints2, setMaxJoints3]);

  // Calculate SVG viewBox dimensions
  const viewBox = useMemo(() => {
    let maxX = 0;
    let maxY = 0;

    for (const vertex of vertices.values()) {
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }

    const padding = pixelSize;
    return {
      minX: -padding,
      minY: -padding,
      width: maxX + padding * 2,
      height: maxY + padding * 2
    };
  }, [vertices, pixelSize]);

  return {
    // Configuration (internal storage: inches)
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
    enabledEdges: validEnabledEdges,
    viewBox,
    pixelSize,

    // Statistics
    stats,

    // Actions
    toggleEdge,
    clearAll,
    getDesignState,
    loadDesignState
  };
}
