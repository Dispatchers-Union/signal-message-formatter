import { useState } from 'react';

// Right-hand panel: the formatted message plus a Copy button.
export default function OutputPanel({ output, placeholder }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="panel output-panel">
      <div className="output-header">
        <h1>Formatted message</h1>
        <button type="button" onClick={copy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="output">{output || placeholder}</pre>
    </section>
  );
}
