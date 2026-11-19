export const INCIDENT_TYPES = [
  { value: 'responding', label: 'Responding', emoji: '🚨' },
  { value: 'active', label: 'Active Incident', emoji: '🔥' },
  { value: 'info', label: 'Info-gathering', emoji: '🕵️' },
  { value: 'closed', label: 'Closed', emoji: '📁' },
];

export const ICE_OPTIONS = [
  { value: 'present', label: '🥶 ICE present' },
  { value: 'unconfirmed', label: '🤷🏻 Unconfirmed' },
  { value: 'false', label: '❌ False alarm' },
];

export const NEED_OPTIONS = [
  { value: 'help', label: 'More help needed', emoji: '🆘' },
  { value: 'met', label: 'Need is met', emoji: '🆗' },
];

const emojiFor = (type) =>
  INCIDENT_TYPES.find((t) => t.value === type)?.emoji ?? '';

// First line: {TYPE} {TOWN} – {PLACE} {TYPE}; the Signal link goes last.
export function formatIncident({ town, place, type, link, reported, doing, need, helpNeeded, ice, iceDetails }) {
  const lines = [
    `${emojiFor(type)} ${town.trim().toUpperCase()} – ${place.trim()} ${emojiFor(type)}`.trim(),
  ];
  if (reported.trim()) lines.push(`👀 ${reported.trim()}`);
  if (type === 'closed') {
    lines.push(ICE_OPTIONS.find((o) => o.value === ice)?.label ?? '');
    if (iceDetails.trim()) lines.push(iceDetails.trim());
  } else {
    if (doing.trim()) lines.push(`🏃 ${doing.trim()}`);
    if (need === 'help') {
      lines.push(`🆘 ${helpNeeded.trim() || 'More help needed'}`);
    } else {
      lines.push('🆗 Need is met');
    }
  }
  if (link.trim()) lines.push(link.trim());
  return lines.join('\n');
}

export function isBlank({ town, place, link, reported, doing, iceDetails }) {
  return [town, place, link, reported, doing, iceDetails].every((v) => !v.trim());
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

// Response Request: header, map link, details, then the call to action,
// each separated by a blank line. Empty until a field is filled in.
export function formatResponseRequest({ details, mapLink }) {
  if (!mapLink.trim() && !details.trim()) return '';
  return [
    '‼️ RAPID RESPONSE NEEDED ‼️',
    mapLink.trim(),
    details.trim() && `👀 ${details.trim()}`,
    'If you can get there in 15 minutes or less, please respond with an ETA and wait for confirmation before leaving.',
    'Please:\n🤐 do not share any dispatch information outside of FD\n🪪 only respond if you have a lanyard',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export const INTAKE_TYPES = [
  'Hotline Call',
  'WhatsApp Group',
  'Social Media',
  'External RRN',
  'Public Defender/Attorney Request',
  'Patrols',
  'Other',
];

export const REPORT_INCIDENT_TYPES = [
  'Live event in progress',
  'past event/ICE confirmed present',
  'past event/uncertain if ICE present',
  'False Alarm',
];

// Only the first two incident types can have a confirmed detention.
export const allowsDetention = (incidentType) =>
  REPORT_INCIDENT_TYPES.slice(0, 2).includes(incidentType);

// "HH:MM" -> "3:05 PM"
const timeLabel = (timeValue) => formatTime(withTime(new Date(), timeValue));

// Incident Report Request: placeholder format until a template is decided.
export function formatReportRequest({ reportTime, dispatchTime, intakeType, incidentType, detention }) {
  if (!reportTime && !dispatchTime) return '';
  const message = [
    'When you have a moment later today, could you please fill out the Incident Report?\n\nhttps://frontlinedignity.org/volunteers/\n',
    reportTime && `Time of Report: ${timeLabel(reportTime)}`,
    dispatchTime && `Time of Dispatch: ${timeLabel(dispatchTime)}`,
    `Intake Type: ${intakeType}`,
    `Incident Type: ${incidentType}`,
  ]
    .filter(Boolean)
    .join('\n');
  return detention && allowsDetention(incidentType)
    ? `${message}\n\nPlease also add a Detention Report for each detainee: https://frontlinedignity.org/volunteers/detainee-form/`
    : message;
}
