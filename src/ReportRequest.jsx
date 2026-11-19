import { useState } from 'react';
import OutputPanel from './OutputPanel.jsx';
import { INTAKE_TYPES, REPORT_INCIDENT_TYPES, allowsDetention, formatReportRequest } from './format.js';

export default function ReportRequest() {
  const [form, setForm] = useState({
    reportTime: '',
    dispatchTime: '',
    intakeType: INTAKE_TYPES[0],
    incidentType: REPORT_INCIDENT_TYPES[0],
    detention: false,
  });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="two-col">
      <section className="panel form-panel">
        <h1>Incident Report Request</h1>
        <div className="row row-report">
          <label>
            Time of Report
            <input type="time" value={form.reportTime} onChange={update('reportTime')} />
          </label>
          <label>
            Time of Dispatch
            <input type="time" value={form.dispatchTime} onChange={update('dispatchTime')} />
          </label>
          <label>
            Intake Type
            <select value={form.intakeType} onChange={update('intakeType')}>
              {INTAKE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="row row-incident-type">
          <label>
            Incident Type
            <select value={form.incidentType} onChange={update('incidentType')}>
              {REPORT_INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          {allowsDetention(form.incidentType) && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.detention}
              onChange={(e) => setForm((f) => ({ ...f, detention: e.target.checked }))}
            />
            Detention confirmed
          </label>
          )}
        </div>
      </section>
      <OutputPanel
        output={formatReportRequest(form)}
        placeholder="Enter a time to see the message."
      />
    </div>
  );
}
