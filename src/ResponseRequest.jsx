import { useState } from 'react';
import OutputPanel from './OutputPanel.jsx';
import { formatResponseRequest } from './format.js';

export default function ResponseRequest() {
  const [form, setForm] = useState({ mapLink: '', details: '' });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="two-col">
      <section className="panel form-panel">
        <h1>Response Request</h1>
        <div className="stack">
          <label>
            Map Link
            <input
              type="url"
              value={form.mapLink}
              placeholder="https://maps.google.com/…"
              onChange={update('mapLink')}
            />
          </label>
          <label>
            Details
            <textarea rows={5} value={form.details} onChange={update('details')} />
          </label>
        </div>
      </section>
      <OutputPanel
        output={formatResponseRequest(form)}
        placeholder="Fill in the form to see the message."
      />
    </div>
  );
}
