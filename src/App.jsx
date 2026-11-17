import { useState } from 'react';
import { ICE_OPTIONS, INCIDENT_TYPES, NEED_OPTIONS, NEXT_UPDATE_OPTIONS, toTimeValue, formatHeader, formatIncident, formatNextUpdate, formatSummary, isBlank } from './format.js';

// Random IDs rather than a module-level counter: a counter resets on hot
// reload while existing incidents are kept, which can produce duplicate IDs.
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const newIncident = () => ({
  id: makeId(),
  town: '',
  place: '',
  link: '',
  reported: '',
  doing: '',
  need: 'help',
  helpNeeded: '',
  ice: 'present',
  iceDetails: '',
  type: 'responding',
});

export default function App() {
  const [incidents, setIncidents] = useState(() => [newIncident()]);
  const [copied, setCopied] = useState(false);
  // Only refreshed when a form field changes, not on a timer.
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  // Once someone types a time, stop overwriting it with the auto time.
  const [manualTime, setManualTime] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(NEXT_UPDATE_OPTIONS[0].minutes);
  const time = manualTime ?? toTimeValue(updatedAt);

  const update = (id, field, value) => {
    setUpdatedAt(new Date());
    setIncidents((list) =>
      list.map((inc) => (inc.id === id ? { ...inc, [field]: value } : inc))
    );
  };
  const add = () => setIncidents((list) => [...list, newIncident()]);
  const remove = (id) =>
    setIncidents((list) => list.filter((inc) => inc.id !== id));

  const filled = incidents.filter((inc) => !isBlank(inc));
  const output = filled.length
    ? [
        formatHeader(updatedAt, time),
        formatSummary(filled),
        ...filled.map(formatIncident),
        formatNextUpdate(updatedAt, time, nextUpdate),
      ].join('\n\n')
    : '';

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="app">
      <section className="panel form-panel">
        <h1>Status update</h1>
        <div className="row row-status">
          <label>
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setManualTime(e.target.value || null)}
            />
          </label>
          <label>
            Next Status Update
            <select
              value={nextUpdate}
              onChange={(e) => setNextUpdate(Number(e.target.value))}
            >
              {NEXT_UPDATE_OPTIONS.map((o) => (
                <option key={o.minutes} value={o.minutes}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h1>Incidents</h1>
        {incidents.map((inc, i) => (
          <fieldset key={inc.id} className="incident">
            <legend>Incident {i + 1}</legend>
            <div className="row">
              <label>
                Town
                <input
                  value={inc.town}
                  onChange={(e) => update(inc.id, 'town', e.target.value)}
                />
              </label>
              <label>
                Place
                <input
                  value={inc.place}
                  onChange={(e) => update(inc.id, 'place', e.target.value)}
                />
              </label>
              <label>
                Type
                <select
                  value={inc.type}
                  onChange={(e) => update(inc.id, 'type', e.target.value)}
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Signal Link
              <input
                type="url"
                value={inc.link}
                placeholder="https://signal.group/…"
                onChange={(e) => update(inc.id, 'link', e.target.value)}
              />
            </label>
            <label>
              What was reported
              <input
                value={inc.reported}
                onChange={(e) => update(inc.id, 'reported', e.target.value)}
              />
            </label>
            {inc.type === 'closed' ? (
              <div className="row row-ice">
                <label>
                  ICE present?
                  <select
                    value={inc.ice}
                    onChange={(e) => update(inc.id, 'ice', e.target.value)}
                  >
                    {ICE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  More details
                  <input
                    value={inc.iceDetails}
                    onChange={(e) => update(inc.id, 'iceDetails', e.target.value)}
                  />
                </label>
              </div>
            ) : (
            <>
            <div className="row row-2">
              <label>
                What we're doing
                <input
                  value={inc.doing}
                  onChange={(e) => update(inc.id, 'doing', e.target.value)}
                />
              </label>
              <label>
                What is needed?
                <select
                  value={inc.need}
                  onChange={(e) => update(inc.id, 'need', e.target.value)}
                >
                  {NEED_OPTIONS.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.emoji} {n.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {inc.need === 'help' && (
              <label>
                Help needed
                <input
                  value={inc.helpNeeded}
                  placeholder="Exactly what help is needed"
                  onChange={(e) => update(inc.id, 'helpNeeded', e.target.value)}
                />
              </label>
            )}
            </>
            )}
            {incidents.length > 1 && (
              <button
                type="button"
                className="remove"
                onClick={() => remove(inc.id)}
              >
                Remove
              </button>
            )}
          </fieldset>
        ))}
        <button type="button" className="add" onClick={add}>
          + Add incident
        </button>
      </section>

      <section className="panel output-panel">
        <div className="output-header">
          <h1>Formatted message</h1>
          <button type="button" onClick={copy} disabled={!output}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="output">{output || 'Fill in an incident to see the message.'}</pre>
      </section>
    </div>
  );
}
