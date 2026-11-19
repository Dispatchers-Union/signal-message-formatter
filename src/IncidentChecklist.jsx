import { CHECKLIST, CHECKLIST_IDS } from './checklistItems.jsx';

// Collapsible checklist; `checked` is an array of item ids.
export default function IncidentChecklist({ checked = [], onToggle }) {
  const done = checked.filter((id) => CHECKLIST_IDS.has(id)).length;

  return (
    <details className="checklist">
      <summary>
        Incident Response Checklist{' '}
        <span className="checklist-count">
          ({done}/{CHECKLIST_IDS.size})
        </span>
      </summary>
      <ul>
        {CHECKLIST.map((item, i) =>
          item.divider ? (
            <li key={`divider-${i}`} className="checklist-divider" aria-hidden="true">
              <span>{item.divider}</span>
            </li>
          ) : (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={checked.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                />
                <span>{item.label}</span>
              </label>
            </li>
          )
        )}
      </ul>
    </details>
  );
}
