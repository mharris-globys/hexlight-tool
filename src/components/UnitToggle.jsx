/**
 * Unit toggle component for switching between inches and centimeters
 */
export function UnitToggle({ units, onToggle }) {
  return (
    <button
      className="unit-toggle"
      onClick={onToggle}
      title="Toggle units"
    >
      {units === 'in' ? 'in' : 'cm'}
    </button>
  );
}
