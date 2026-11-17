export const INCIDENT_TYPES = [
  { value: 'responding', label: 'Responding', emoji: '🚨' },
  { value: 'active', label: 'Active Incident', emoji: '🔥' },
  { value: 'info', label: 'Info-gathering', emoji: '🕵️' },
];

export const NEED_OPTIONS = [
  { value: 'help', label: 'More help needed', emoji: '🆘' },
  { value: 'met', label: 'Need is met', emoji: '🆗' },
];

const emojiFor = (type) =>
  INCIDENT_TYPES.find((t) => t.value === type)?.emoji ?? '';

// Template: {TOWN} – {PLACE} {TYPE} {SIGNAL LINK}
export function formatIncident({ town, place, type, link, reported, doing, need, helpNeeded }) {
  const lines = [
    `${emojiFor(type)} ${town.trim().toUpperCase()} – ${place.trim()} ${emojiFor(type)} ${link.trim()}`.trim(),
  ];
  if (reported.trim()) lines.push(`👀 ${reported.trim()}`);
  if (doing.trim()) lines.push(`🏃 ${doing.trim()}`);
  if (need === 'help') {
    lines.push(`🆘 ${helpNeeded.trim() || 'More help needed'}`);
  } else {
    lines.push('🆗 Need is met');
  }
  return lines.join('\n');
}

export function isBlank({ town, place, link, reported, doing }) {
  return [town, place, link, reported, doing].every((v) => !v.trim());
}

// Header: 🚨 STATUS UPDATE – {DAY} {DATE}, {TIME}
export const NEXT_UPDATE_OPTIONS = [
  { label: '15 mins', minutes: 15 },
  { label: '20 mins', minutes: 20 },
  { label: '30 mins', minutes: 30 },
  { label: '1 hour', minutes: 60 },
];

// "HH:MM" (24h, as used by <input type="time">) for a Date.
export const toTimeValue = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// Combine the day/date of `date` with a "HH:MM" time value.
function withTime(date, timeValue) {
  const [h, m] = (timeValue || toTimeValue(date)).split(':').map(Number);
  const at = new Date(date);
  at.setHours(h, m, 0, 0);
  return at;
}

const formatTime = (date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// `timeValue` is "HH:MM"; the day and date come from `date`.
export function formatHeader(date, timeValue) {
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = formatTime(withTime(date, timeValue));
  return `🚨 STATUS UPDATE – ${day} ${dateStr}, ${time}`;
}

// Summary: {#} active responses, {#} investigation requests
export function formatSummary(incidents) {
  const active = incidents.filter((i) => i.type === 'responding' || i.type === 'active').length;
  const info = incidents.filter((i) => i.type === 'info').length;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const parts = [];
  if (active) parts.push(plural(active, 'active response', 'active responses'));
  if (info) parts.push(plural(info, 'investigation request', 'investigation requests'));
  return parts.join(', ');
}

// Next Update by {status time + interval}
export function formatNextUpdate(date, timeValue, minutes) {
  const next = withTime(date, timeValue);
  next.setMinutes(next.getMinutes() + minutes);
  return `Next Update by ${formatTime(next)}`;
}
