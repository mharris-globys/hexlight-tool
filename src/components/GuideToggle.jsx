/**
 * Guide toggle component for showing/hiding grid guides and disabled edges
 */
export function GuideToggle({ showGuides, onToggle }) {
  return (
    <button
      className={`guide-toggle ${showGuides ? '' : 'preview-mode'}`}
      onClick={onToggle}
      title={showGuides ? 'Hide guides (preview mode)' : 'Show guides'}
    >
      {showGuides ? 'Guides' : 'Preview'}
    </button>
  );
}
