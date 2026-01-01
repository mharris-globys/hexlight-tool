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
 * All dimensions are in inches
 */
export function useHexGrid() {
  // Grid configuration (all in inches)
  const [widthInches, setWidthInches] = useLocalStorage('hexlight-width', 120); // 10 feet
  const [lengthInches, setLengthInches] = useLocalStorage('hexlight-length', 96); // 8 feet
  const [pointSpacing, setPointSpacing] = useLocalStorage('hexlight-spacing', DEFAULT_POINT_SPACING);
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
    return getGridDimensions(widthInches, lengthInches, pointSpacing, pointyTop);
  }, [widthInches, lengthInches, pointSpacing, pointyTop]);

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

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(validEnabledEdges, allEdges);
  }, [validEnabledEdges, allEdges]);

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
  const getDesignState = useCallback(() => ({
    widthInches,
    lengthInches,
    pointSpacing,
    pointyTop,
    mirrorMode,
    enabledEdges: enabledEdgesArray,
    maxSegments,
    maxJoints2,
    maxJoints3
  }), [widthInches, lengthInches, pointSpacing, pointyTop, mirrorMode, enabledEdgesArray, maxSegments, maxJoints2, maxJoints3]);

  // Load a design state
  const loadDesignState = useCallback((design) => {
    if (design.widthInches !== undefined) setWidthInches(design.widthInches);
    if (design.lengthInches !== undefined) setLengthInches(design.lengthInches);
    if (design.pointSpacing !== undefined) setPointSpacing(design.pointSpacing);
    if (design.pointyTop !== undefined) setPointyTop(design.pointyTop);
    if (design.mirrorMode !== undefined) setMirrorMode(design.mirrorMode);
    if (design.enabledEdges !== undefined) setEnabledEdgesArray(design.enabledEdges);
    if (design.maxSegments !== undefined) setMaxSegments(design.maxSegments);
    if (design.maxJoints2 !== undefined) setMaxJoints2(design.maxJoints2);
    if (design.maxJoints3 !== undefined) setMaxJoints3(design.maxJoints3);
  }, [setWidthInches, setLengthInches, setPointSpacing, setPointyTop, setMirrorMode, setEnabledEdgesArray, setMaxSegments, setMaxJoints2, setMaxJoints3]);

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
