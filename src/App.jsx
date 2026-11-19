import { useState } from 'react';
import IncidentWrangler from './IncidentWrangler.jsx';
import ResponseRequest from './ResponseRequest.jsx';
import ReportRequest from './ReportRequest.jsx';

const TABS = [
  { id: 'incident-wrangler', label: 'Incident Wrangler', Component: IncidentWrangler },
  { id: 'response-request', label: 'Response Request', Component: ResponseRequest },
  { id: 'report-request', label: 'Incident Report Request', Component: ReportRequest },
];

export default function App() {
  const [active, setActive] = useState(TABS[0].id);

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active);
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="shell">
      <nav className="tabs" role="tablist" aria-orientation="vertical" onKeyDown={onKeyDown}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {/* All panels stay mounted so switching tabs doesn't lose form data. */}
      {TABS.map(({ id, Component }) => (
        <main
          key={id}
          id={`panel-${id}`}
          role="tabpanel"
          aria-labelledby={`tab-${id}`}
          className="tab-panel"
          hidden={active !== id}
        >
          <Component />
        </main>
      ))}
    </div>
  );
}
