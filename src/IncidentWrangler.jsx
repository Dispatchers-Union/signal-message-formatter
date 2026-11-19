import { useEffect, useState } from 'react';
import IncidentChecklist from './IncidentChecklist.jsx';
import { CHECKLIST_IDS } from './checklistItems.jsx';
import OutputPanel from './OutputPanel.jsx';
import { buildShareLink, clearShareData, readShareData } from './share.js';
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
  checklist: [], // ids of completed checklist items
});

const allowed = (list) => new Set(list.map((o) => o.value));
const ENUMS = {
  type: allowed(INCIDENT_TYPES),
  need: allowed(NEED_OPTIONS),
  ice: allowed(ICE_OPTIONS),
};

// Turn untrusted shared data into clean incidents: only known fields, only
// strings, only valid dropdown values. Anything else falls back to defaults.
function incidentsFromShare(data) {
  if (!Array.isArray(data?.incidents) || !data.incidents.length) return null;
  return data.incidents.map((raw) => {
    const inc = newIncident();
    for (const key of Object.keys(inc)) {
      if (key === 'checklist') {
        if (Array.isArray(raw?.checklist)) {
          inc.checklist = [...new Set(raw.checklist.filter((id) => CHECKLIST_IDS.has(id)))];
        }
        continue;
      }
      if (key === 'id' || typeof raw?.[key] !== 'string') continue;
      if (ENUMS[key] && !ENUMS[key].has(raw[key])) continue;
      inc[key] = raw[key];
    }
    return inc;
  });
}

function nextUpdateFromShare(data) {
  return NEXT_UPDATE_OPTIONS.some((o) => o.minutes === data?.nextUpdate)
    ? data.nextUpdate
    : NEXT_UPDATE_OPTIONS[0].minutes;
}

export default function IncidentWrangler() {
  // Seed from a share link if the page was opened with one.
  const [seed] = useState(() => readShareData());
  const [incidents, setIncidents] = useState(
    () => incidentsFromShare(seed) ?? [newIncident()]
  );
  // Only refreshed when a form field changes, not on a timer.
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  // Once someone types a time, stop overwriting it with the auto time.
  const [manualTime, setManualTime] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(() => nextUpdateFromShare(seed));
  const time = manualTime ?? toTimeValue(updatedAt);
  const [linkCopied, setLinkCopied] = useState(false);

  // Remove the share data from the address bar once loaded, so a refresh
  // doesn't wipe edits. Also pick up a share link pasted into an open tab.
  useEffect(() => {
    if (seed) clearShareData();
    const onHashChange = () => {
      const data = readShareData();
      const shared = incidentsFromShare(data);
      if (!shared) return;
      setIncidents(shared);
      setNextUpdate(nextUpdateFromShare(data));
      setUpdatedAt(new Date());
      clearShareData();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [seed]);

  const copyShareLink = async () => {
    const link = buildShareLink({
      nextUpdate,
      incidents: incidents.map(({ id, ...fields }) => fields),
    });
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  const update = (id, field, value) => {
    setUpdatedAt(new Date());
    setIncidents((list) =>
      list.map((inc) => (inc.id === id ? { ...inc, [field]: value } : inc))
    );
  };
  // Checklist progress isn't part of the message, so it doesn't bump the time.
  const toggleChecklist = (id, item) =>
    setIncidents((list) =>
      list.map((inc) =>
        inc.id !== id
          ? inc
          : {
              ...inc,
              checklist: (inc.checklist ?? []).includes(item)
                ? inc.checklist.filter((x) => x !== item)
                : [...(inc.checklist ?? []), item],
            }
      )
    );
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
      ]
        .filter(Boolean) // drop the summary when it's empty (e.g. only closed incidents)
        .join('\n\n')
    : '';


  return (
    <div className="two-col">
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
            <label>
              Signal Link
              <input
                type="url"
                value={inc.link}
                placeholder="https://signal.group/…"
                onChange={(e) => update(inc.id, 'link', e.target.value)}
              />
            </label>
            {incidents.length > 1 && (
              <button
                type="button"
                className="remove"
                onClick={() => remove(inc.id)}
              >
                Remove
              </button>
            )}
            <IncidentChecklist
              checked={inc.checklist}
              onToggle={(item) => toggleChecklist(inc.id, item)}
            />
          </fieldset>
        ))}
        <button type="button" className="add" onClick={add}>
          + Add incident
        </button>
        <div className="share">
          <button type="button" className="secondary" onClick={copyShareLink}>
            {linkCopied ? 'Link copied!' : 'Copy share link'}
          </button>
          <p className="hint">
            Send this link to someone to fill their form with these incidents.
          </p>
        </div>
      </section>

      <OutputPanel
        output={output}
        placeholder="Fill in an incident to see the message."
      />
    </div>
  );
}
