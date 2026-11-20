// Demo progress for screenshots and first-time visitors: ?demo=1 starts from a sample run (some trophies earned,
// counters part way) kept in memory only, so a reader's own saved progress is never touched.

const DEMO_EARNED_NAMES = [
  'Just Like Paradise', 'Paradise Lost', 'Trust', 'Master of None', 'Baited My Tackle', 'Stick Fiddler',
  'Gunslinger', 'Ten Pin', 'Hot Together', 'In The Beginning…', 'A Classic Blitz Play',
];

const DEMO_COUNTER_SHARE = 0.36;

export function demoStateFromUrl(params, model) {
  if (!params.has('demo')) return null;
  const earned = model.trophies.filter((t) => DEMO_EARNED_NAMES.includes(t.name)).map((t) => t.id);
  const counters = {};
  for (const t of model.trophies) if (t.count && !earned.includes(t.id)) counters[t.id] = Math.floor(t.count.target * DEMO_COUNTER_SHARE);
  return { earned, counters, revealed: [], spoilers: params.get('spoilers') !== 'off', savedAt: null };
}
