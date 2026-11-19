// Incident Response Checklist. `divider` entries mark a phase change and
// aren't checkable. Item ids are stored with each incident (and in share
// links), so keep them stable when editing the wording.

const ext = { target: '_blank', rel: 'noopener noreferrer' };

export const CHECKLIST = [
  { id: 'dispatchable', label: <>Decide if dispatchable</> },
  { id: 'create-rr', label: <>Create Response Request</> },
  {
    id: 'send-oncall',
    label: (
      <>
        Send response request to{' '}
        <a href="https://presence.frontlinedignity.org/oncall" {...ext}>On-Call teams</a>
      </>
    ),
  },
  {
    id: 'find-hotspots',
    label: (
      <>
        Find Hot Spots in{' '}
        <a href="https://hotfdspot.netlify.app/" {...ext}>Hot Spot locator</a>
      </>
    ),
  },
  { id: 'send-hotspots', label: <>Send response request to Hot Spots</> },
  {
    id: 'create-chat',
    label: (
      <>
        Create <a href="https://presence.frontlinedignity.org/incidents" {...ext}>incident chat</a>
      </>
    ),
  },
  { id: 'add-responders', label: <>Add responders to incident chat</> },
  { id: 'follow-up', label: <>Send follow up messages in On-Call and Hot Spot chats</> },
  { divider: '🏃' },
  { id: 'initial-report', label: <>Post initial report, including time &amp; any media</> },
  {
    id: 'alertsteam',
    label: (
      <>
        The moment detention is confirmed, write a message starting with <strong>#alertsteam</strong>
      </>
    ),
  },
  { divider: '🛑' },
  { id: 'create-irr', label: <>Create Incident Report Request</> },
  { id: 'send-irr', label: <>Send Incident Report Request to first on scene</> },
  { id: 'summary', label: <>Provide summary of outcome to all alerted chats</> },
];

export const CHECKLIST_IDS = new Set(CHECKLIST.filter((i) => i.id).map((i) => i.id));
