/* WindSage demo dataset. Synthetic SCADA-style alarms, generated locally.
   Preserves 100% of data structures, weights, algorithms, and numbers from the original. */

export interface Turbine {
  id: string;
  ratedMW: number;
}

export interface Category {
  id: string;
  label: string;
  team: string;
}

export type Severity = 'Critical' | 'Major' | 'Minor';
export type IncidentStatus = 'New' | 'Assigned' | 'In progress' | 'Resolved' | 'Closed';

export interface AlarmCode {
  code: string;
  name: string;
  category: string;
  severity: Severity;
  team: string;
  weight: number;
  rootCause: string;
  actions: string[];
  verify: string[];
}

export interface IncidentLog {
  at: number;
  text: string;
}

export interface Incident {
  id: string;
  code: string;
  turbine: string;
  startedAt: number;
  downtimeMin: number;
  status: IncidentStatus;
  owner: string | null;
  team: string | null;
  deadline: number | null;
  escalated: boolean;
  resolvedAt: number | null;
  closedAt: number | null;
  note: string;
  log: IncidentLog[];
}

export interface EnrichedIncident extends Incident {
  codeInfo: AlarmCode;
  categoryLabel: string;
  teamLabel: string;
  loss: number;
  score: number;
  rank: 'P1' | 'P2' | 'P3';
  freq14: number;
  overdue: boolean;
  downtimeHours: number;
}

export interface RecurrenceGroup {
  key: string;
  turbine: string;
  category: string;
  categoryLabel: string;
  topCode: string;
  count: number;
  open: number;
  active: number;
  lastAt: number;
  avgGap: number;
  loss: number;
  trend: 'up' | 'down' | 'flat';
  last30: number;
  prev30: number;
}

export interface FixEffectiveness {
  checked: number;
  held: number;
  repeated: number;
  rate: number | null;
}

export interface FleetStats {
  open: number;
  active: number;
  awaiting: number;
  criticalOpen: number;
  overdue: number;
  criticalOverdue: number;
  loss30: number;
  lpf30: number;
  mttr: number;
  mttrCount: number;
  recurring: number;
  recurringOpen: number;
  groups: RecurrenceGroup[];
}

export interface WindSageStore {
  version: number;
  createdAt: number;
  incidents: Incident[];
}

export const CONFIG = {
  fleetMW: 33.6,
  capacityFactor: 0.38,
  days: 90,
  recurrenceWindowDays: 60,
  recurrenceMin: 3,
  storeKey: 'windsage-demo-v3',
  version: 3
};

export const TURBINES: Turbine[] = [
  { id: 'WTG-01', ratedMW: 4.2 },
  { id: 'WTG-02', ratedMW: 4.2 },
  { id: 'WTG-03', ratedMW: 4.2 },
  { id: 'WTG-04', ratedMW: 4.2 },
  { id: 'WTG-05', ratedMW: 4.2 },
  { id: 'WTG-06', ratedMW: 4.2 },
  { id: 'WTG-07', ratedMW: 4.2 },
  { id: 'WTG-08', ratedMW: 4.2 }
];

export const CATEGORIES: Category[] = [
  { id: 'gearbox', label: 'Gearbox', team: 'Mechanical' },
  { id: 'converter', label: 'Converter', team: 'Electrical' },
  { id: 'pitch', label: 'Pitch system', team: 'Electrical' },
  { id: 'temperature', label: 'Temperature', team: 'Mechanical' },
  { id: 'grid', label: 'Grid', team: 'SCADA / Controls' },
  { id: 'hydraulic', label: 'Hydraulic', team: 'Mechanical' },
  { id: 'yaw', label: 'Yaw system', team: 'Mechanical' }
];

export const TEAMS = ['Mechanical', 'Electrical', 'SCADA / Controls'];
export const OWNERS = ['R. Mehta', 'A. Kaur', 'S. Iyer', 'D. Fernandes', 'M. Rao', 'T. Nair', 'P. Joshi', 'K. Sharma'];
export const STATUS: IncidentStatus[] = ['New', 'Assigned', 'In progress', 'Resolved', 'Closed'];

export const SLA_HOURS: Record<Severity, number> = { Critical: 24, Major: 72, Minor: 168 };
export const SEV_BASE: Record<Severity, number> = { Critical: 40, Major: 24, Minor: 10 };
export const LOSS_FACTOR: Record<Severity, number> = { Critical: 1, Major: 0.55, Minor: 0.15 };

export const CODES: AlarmCode[] = [
  {
    code: 'GB-OIL-TEMP', name: 'Gearbox oil temperature high', category: 'gearbox', severity: 'Critical', team: 'Mechanical', weight: 6,
    rootCause: 'Cooling circuit restriction or degraded oil. The same alarm returning after short gaps points to an unresolved cooling problem rather than a sensor fault.',
    actions: ['Inspect oil cooler fan and radiator fins', 'Check thermostat valve operation', 'Sample gearbox oil and replace filter', 'Trend oil temperature for 48 hours after restart'],
    verify: ['Oil temperature stable below 75 C under load', 'No repeat alarm within 14 days', 'Oil sample result attached to work order']
  },
  {
    code: 'GB-VIB', name: 'Gearbox vibration above threshold', category: 'gearbox', severity: 'Critical', team: 'Mechanical', weight: 3,
    rootCause: 'Bearing wear or misalignment. Vibration reappearing in the same load band usually means a mechanical defect, not a one-off event.',
    actions: ['Collect vibration spectrum at three load points', 'Inspect HSS bearing and coupling', 'Check alignment and torque settings'],
    verify: ['Vibration inside ISO zone A/B', 'Spectrum shows no bearing defect frequencies', 'Two weeks of trend data reviewed']
  },
  {
    code: 'GB-FILTER', name: 'Gearbox filter pressure drop', category: 'gearbox', severity: 'Major', team: 'Mechanical', weight: 4,
    rootCause: 'Clogged filter or cold oil viscosity. Frequent pressure-drop alarms often follow missed filter changes.',
    actions: ['Replace filter element', 'Check oil viscosity against spec', 'Verify pressure after restart'],
    verify: ['Pressure drop back to baseline', 'Filter change recorded in maintenance log']
  },
  {
    code: 'CV-IGBT', name: 'Converter IGBT fault', category: 'converter', severity: 'Critical', team: 'Electrical', weight: 4,
    rootCause: 'IGBT over-temperature or gate-drive fault. Repeat trips on the same converter suggest a failing power module.',
    actions: ['Download converter fault log', 'Thermal check of IGBT modules', 'Inspect cooling fans and heatsink'],
    verify: ['Converter runs 72 hours without trip', 'Fault log clean', 'Module temperatures within limits']
  },
  {
    code: 'CV-DC-LINK', name: 'DC link voltage out of range', category: 'converter', severity: 'Major', team: 'Electrical', weight: 3,
    rootCause: 'Grid-side disturbance or capacitor ageing. Recurring DC-link alarms usually track grid events or weak capacitors.',
    actions: ['Compare event times with grid log', 'Check capacitor bank and measurement card', 'Verify firmware settings'],
    verify: ['DC-link voltage stable across load steps', 'No repeat alarm in 14 days']
  },
  {
    code: 'CV-CHOPPER', name: 'Chopper over-current', category: 'converter', severity: 'Major', team: 'Electrical', weight: 2,
    rootCause: 'Braking chopper stressed by frequent grid dips. Inspect the resistor and triggering circuit.',
    actions: ['Inspect chopper resistor', 'Check gate driver', 'Correlate with grid dips'],
    verify: ['No over-current during grid dip test', 'Resistor values within spec']
  },
  {
    code: 'PT-MOTOR', name: 'Pitch motor overload', category: 'pitch', severity: 'Critical', team: 'Electrical', weight: 5,
    rootCause: 'Blade bearing friction or motor brake drag. Recurring overloads on one blade point to mechanical resistance.',
    actions: ['Measure pitch motor current on each blade', 'Inspect blade bearing lubrication', 'Check brake release gap'],
    verify: ['Motor current balanced across blades', 'No overload in 14 days']
  },
  {
    code: 'PT-ENC', name: 'Pitch encoder mismatch', category: 'pitch', severity: 'Major', team: 'Electrical', weight: 4,
    rootCause: 'Encoder drift or loose coupling. Mismatch alarms usually return until the encoder is recalibrated or replaced.',
    actions: ['Recalibrate pitch encoder', 'Inspect encoder coupling', 'Replace encoder if drift repeats'],
    verify: ['Blade angle deviation below 0.5 degrees', 'Calibration record signed off']
  },
  {
    code: 'PT-BATT', name: 'Pitch battery low', category: 'pitch', severity: 'Major', team: 'Electrical', weight: 3,
    rootCause: 'Battery end-of-life or charger fault. Low-battery alarms cluster as the pack ages.',
    actions: ['Load-test battery pack', 'Check charger output', 'Replace pack if below capacity'],
    verify: ['Battery passes capacity test', 'Charger voltage within spec']
  },
  {
    code: 'TEMP-GEN', name: 'Generator winding temperature high', category: 'temperature', severity: 'Critical', team: 'Mechanical', weight: 5,
    rootCause: 'Cooling airflow restriction or winding degradation. Repeated high winding temperatures need airflow and insulation checks.',
    actions: ['Inspect generator air filter and fan', 'Check winding resistance', 'Clean cooling ducts'],
    verify: ['Winding temperature below alarm limit at rated load', 'Insulation test passed']
  },
  {
    code: 'TEMP-BRG', name: 'Main bearing temperature high', category: 'temperature', severity: 'Critical', team: 'Mechanical', weight: 4,
    rootCause: 'Lubrication starvation or bearing wear. Recurring temperature spikes are an early failure signal.',
    actions: ['Check automatic lubrication system', 'Inspect bearing seals', 'Sample grease for contamination'],
    verify: ['Bearing temperature stable under load', 'Grease sample clean', 'No repeat alarm in 30 days']
  },
  {
    code: 'GRID-FREQ', name: 'Grid frequency deviation', category: 'grid', severity: 'Minor', team: 'SCADA / Controls', weight: 3,
    rootCause: 'External grid event. If the alarm repeats without matching grid records, check the measurement card.',
    actions: ['Pull grid operator event log', 'Verify frequency transducer calibration', 'Confirm ride-through settings'],
    verify: ['Events matched to grid log', 'Transducer calibration valid']
  },
  {
    code: 'GRID-VOLT', name: 'Grid voltage dip', category: 'grid', severity: 'Minor', team: 'SCADA / Controls', weight: 3,
    rootCause: 'Upstream grid disturbance or weak feeder. Recurring dips may need a grid code review.',
    actions: ['Compare with substation log', 'Check tap changer settings', 'Review ride-through performance'],
    verify: ['Dips explained by grid events', 'No turbine trip during ride-through']
  },
  {
    code: 'HYD-PRESS', name: 'Hydraulic pressure low', category: 'hydraulic', severity: 'Major', team: 'Mechanical', weight: 5,
    rootCause: 'Pump wear, leak or air in the circuit. Repeat low-pressure alarms usually mean a persistent leak.',
    actions: ['Pressure-test the circuit', 'Inspect pump and relief valve', 'Check for leaks at fittings'],
    verify: ['Pressure holds at spec for 30 minutes', 'No leak found on re-inspection']
  },
  {
    code: 'HYD-LEAK', name: 'Hydraulic leak detected', category: 'hydraulic', severity: 'Critical', team: 'Mechanical', weight: 3,
    rootCause: 'Seal or hose failure. Leak alarms recurring at the same nacelle position need a full seal inspection.',
    actions: ['Inspect hose and seal kit', 'Replace damaged seals', 'Clean up and re-check level'],
    verify: ['No leak after 24 hours', 'Fluid level stable']
  },
  {
    code: 'YAW-MIS', name: 'Yaw misalignment', category: 'yaw', severity: 'Major', team: 'Mechanical', weight: 4,
    rootCause: 'Yaw encoder drift or brake slip. Recurring misalignment reduces production before it becomes a hard fault.',
    actions: ['Calibrate yaw encoder', 'Check yaw brake pressure', 'Inspect yaw gear lubrication'],
    verify: ['Misalignment below 3 degrees', 'No repeat alarm in 14 days']
  },
  {
    code: 'YAW-MOTOR', name: 'Yaw motor overload', category: 'yaw', severity: 'Major', team: 'Mechanical', weight: 3,
    rootCause: 'Yaw gear friction or motor brake drag. Check lubrication and brake gap.',
    actions: ['Inspect yaw gears', 'Check motor current', 'Adjust brake gap'],
    verify: ['Motor current within spec', 'Yaw movement smooth']
  }
];

export const CODE_BY_ID: Record<string, AlarmCode> = Object.fromEntries(CODES.map(c => [c.code, c]));
export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const BIAS: Record<string, Record<string, number>> = {
  'WTG-02': { grid: 2.2 },
  'WTG-03': { gearbox: 3.6, temperature: 1.5 },
  'WTG-05': { converter: 2.6 },
  'WTG-06': { pitch: 3.4 },
  'WTG-07': { temperature: 2.7 },
  'WTG-08': { hydraulic: 2.2 }
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickOwner(seedStr: string): string {
  return OWNERS[hash(seedStr) % OWNERS.length];
}

function buildWeights(turbineId: string): { code: AlarmCode; weight: number }[] {
  const bias = BIAS[turbineId] || {};
  const list: { code: AlarmCode; weight: number }[] = [];
  for (const c of CODES) {
    list.push({ code: c, weight: c.weight * (bias[c.category] || 1) });
  }
  return list;
}

function weightedPick(list: { code: AlarmCode; weight: number }[], rng: () => number): AlarmCode {
  const total = list.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const item of list) {
    r -= item.weight;
    if (r <= 0) return item.code;
  }
  return list[list.length - 1].code;
}

function statusFor(daysAgo: number, rng: () => number): IncidentStatus {
  const r = rng();
  if (daysAgo > 10) return 'Closed';
  if (daysAgo > 4) return r < 0.66 ? 'Closed' : r < 0.82 ? 'Resolved' : r < 0.93 ? 'In progress' : 'Assigned';
  if (daysAgo > 1) return r < 0.20 ? 'Closed' : r < 0.35 ? 'Resolved' : r < 0.62 ? 'In progress' : r < 0.88 ? 'Assigned' : 'New';
  return r < 0.05 ? 'Closed' : r < 0.08 ? 'Resolved' : r < 0.25 ? 'In progress' : r < 0.60 ? 'Assigned' : 'New';
}

function makeIncident(fields: Partial<Incident>): Incident {
  return {
    id: 'INC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    code: '',
    turbine: 'WTG-01',
    startedAt: Date.now(),
    downtimeMin: 60,
    status: 'New',
    owner: null,
    team: null,
    deadline: null,
    escalated: false,
    resolvedAt: null,
    closedAt: null,
    note: '',
    log: [],
    ...fields
  };
}

export function generate(): WindSageStore {
  const rng = mulberry32(20261023);
  const now = Date.now();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const incidents: Incident[] = [];

  for (let d = CONFIG.days - 1; d >= 0; d--) {
    const r = rng();
    const events = r < 0.30 ? 1 : r < 0.78 ? 2 : 3;
    for (let e = 0; e < events; e++) {
      const turbine = TURBINES[Math.floor(rng() * TURBINES.length)];
      const code = weightedPick(buildWeights(turbine.id), rng);
      let startedAt = dayStart.getTime() - d * 86400000 + Math.floor(rng() * 24) * 3600000 + Math.floor(rng() * 60) * 60000;
      if (startedAt > now - 5 * 60000) startedAt -= 86400000;

      let downtimeMin: number;
      if (code.severity === 'Critical') downtimeMin = rng() < 0.05 ? 16 * 60 + rng() * 16 * 60 : 120 + rng() * 360;
      else if (code.severity === 'Major') downtimeMin = 30 + rng() * 150;
      else downtimeMin = 8 + rng() * 37;
      downtimeMin = Math.round(downtimeMin);

      const daysAgo = (now - startedAt) / 86400000;
      const status = statusFor(daysAgo, rng);
      const owner = status === 'New' ? null : pickOwner(turbine.id + code.code);
      const team = code.team;
      const deadline = startedAt + SLA_HOURS[code.severity] * 3600000;

      let resolvedAt: number | null = null;
      let closedAt: number | null = null;
      const escalated = false;

      if (status === 'Resolved' || status === 'Closed') {
        const delayH = code.severity === 'Critical' ? 4 + rng() * 44 : code.severity === 'Major' ? 6 + rng() * 66 : 12 + rng() * 108;
        resolvedAt = startedAt + downtimeMin * 60000 + delayH * 3600000;
        if (resolvedAt > now) resolvedAt = now - (10 + rng() * 60) * 60000;
        if (status === 'Closed') closedAt = Math.min(now - 5 * 60000, resolvedAt + (0.5 + rng() * 20) * 3600000);
        if (closedAt && closedAt < resolvedAt) closedAt = resolvedAt + 5 * 60000;
      }

      const log: IncidentLog[] = [{ at: startedAt, text: 'Alarm received from SCADA' }];
      if (owner) {
        log.push({ at: startedAt + (10 + rng() * 90) * 60000, text: 'Assigned to ' + owner + ' (' + team + ')' });
      }
      if (['In progress', 'Resolved', 'Closed'].includes(status)) {
        log.push({ at: startedAt + (30 + rng() * 240) * 60000, text: 'Technician accepted work order' });
      }
      if (resolvedAt) log.push({ at: resolvedAt, text: 'Corrective action completed, pending verification' });
      if (closedAt) log.push({ at: closedAt, text: 'Verification passed, incident closed' });

      incidents.push(makeIncident({
        id: 'INC-' + (1000 + incidents.length),
        code: code.code,
        turbine: turbine.id,
        startedAt: Math.round(startedAt),
        downtimeMin,
        status,
        owner,
        team,
        deadline,
        escalated,
        resolvedAt,
        closedAt,
        note: '',
        log
      }));
    }
  }

  const demoNow = now;

  function sticky(extra: Partial<Incident>): Incident {
    const inc = makeIncident(extra);
    inc.log.sort((a, b) => a.at - b.at);
    return inc;
  }

  incidents.push(sticky({
    id: 'INC-9001', code: 'GB-OIL-TEMP', turbine: 'WTG-03',
    startedAt: demoNow - 1.4 * 86400000, downtimeMin: 420, status: 'In progress',
    owner: 'A. Kaur', team: 'Mechanical', deadline: demoNow - 5 * 3600000, escalated: false,
    note: 'Fourth gearbox alarm on WTG-03 in nine days. Cooler fan was reset last time.',
    log: [
      { at: demoNow - 1.4 * 86400000, text: 'Alarm received from SCADA' },
      { at: demoNow - 1.35 * 86400000, text: 'Assigned to A. Kaur (Mechanical)' },
      { at: demoNow - 1.2 * 86400000, text: 'Technician accepted work order' },
      { at: demoNow - 0.6 * 86400000, text: 'Oil cooler fan inspected, restart attempted' }
    ]
  }));

  incidents.push(sticky({
    id: 'INC-9002', code: 'PT-MOTOR', turbine: 'WTG-06',
    startedAt: demoNow - 2.3 * 86400000, downtimeMin: 300, status: 'In progress',
    owner: 'S. Iyer', team: 'Electrical', deadline: demoNow - 26 * 3600000, escalated: false,
    note: 'Pitch motor current on blade 2 is 18% above blades 1 and 3.',
    log: [
      { at: demoNow - 2.3 * 86400000, text: 'Alarm received from SCADA' },
      { at: demoNow - 2.1 * 86400000, text: 'Assigned to S. Iyer (Electrical)' },
      { at: demoNow - 1.8 * 86400000, text: 'Technician accepted work order' },
      { at: demoNow - 1.1 * 86400000, text: 'Blade bearing lubrication checked' }
    ]
  }));

  incidents.push(sticky({
    id: 'INC-9003', code: 'CV-IGBT', turbine: 'WTG-05',
    startedAt: demoNow - 0.3 * 86400000, downtimeMin: 90, status: 'New',
    owner: null, team: 'Electrical', deadline: demoNow + 18 * 3600000, escalated: false,
    note: 'Converter tripped twice during the morning peak.',
    log: [{ at: demoNow - 0.3 * 86400000, text: 'Alarm received from SCADA' }]
  }));

  incidents.push(sticky({
    id: 'INC-9004', code: 'TEMP-BRG', turbine: 'WTG-07',
    startedAt: demoNow - 1.1 * 86400000, downtimeMin: 260, status: 'Resolved',
    owner: 'M. Rao', team: 'Mechanical', deadline: demoNow - 2 * 3600000, escalated: false,
    resolvedAt: demoNow - 6 * 3600000,
    note: 'Grease line flushed and re-primed. Temperature stable on restart.',
    log: [
      { at: demoNow - 1.1 * 86400000, text: 'Alarm received from SCADA' },
      { at: demoNow - 1.0 * 86400000, text: 'Assigned to M. Rao (Mechanical)' },
      { at: demoNow - 0.8 * 86400000, text: 'Technician accepted work order' },
      { at: demoNow - 6 * 3600000, text: 'Corrective action completed, pending verification' }
    ]
  }));

  incidents.sort((a, b) => b.startedAt - a.startedAt);
  return { version: CONFIG.version, createdAt: now, incidents };
}

export function loadStore(): WindSageStore {
  try {
    const raw = localStorage.getItem(CONFIG.storeKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === CONFIG.version && Array.isArray(parsed.incidents) && parsed.incidents.length) {
        return parsed;
      }
    }
  } catch (err) {
    /* fallback to memory */
  }
  const data = generate();
  saveStore(data);
  return data;
}

export function saveStore(data: WindSageStore): void {
  try {
    localStorage.setItem(CONFIG.storeKey, JSON.stringify(data));
  } catch (err) {
    /* ignore */
  }
}

export function resetStore(): WindSageStore {
  try {
    localStorage.removeItem(CONFIG.storeKey);
  } catch (err) {
    /* ignore */
  }
  return loadStore();
}

export function downtimeHours(inc: Incident): number {
  return inc.downtimeMin / 60;
}

export function estMWh(inc: Incident): number {
  const turbine = TURBINES.find(t => t.id === inc.turbine) || TURBINES[0];
  const code = CODE_BY_ID[inc.code] || CODES[0];
  return downtimeHours(inc) * turbine.ratedMW * CONFIG.capacityFactor * LOSS_FACTOR[code.severity];
}

export function freq14(inc: Incident, incidents: Incident[], now: number): number {
  const code = CODE_BY_ID[inc.code];
  if (!code) return 0;
  return incidents.filter(x => x.turbine === inc.turbine && CODE_BY_ID[x.code] && CODE_BY_ID[x.code].category === code.category &&
    x.startedAt >= now - 14 * 86400000).length;
}

export function isActive(inc: Incident): boolean {
  return inc.status === 'New' || inc.status === 'Assigned' || inc.status === 'In progress';
}

export function isOverdue(inc: Incident, now: number): boolean {
  return isActive(inc) && inc.deadline !== null && now > inc.deadline;
}

export function priority(inc: Incident, incidents: Incident[], now: number): { score: number; rank: 'P1' | 'P2' | 'P3'; freq: number; loss: number; overdue: boolean } {
  const code = CODE_BY_ID[inc.code] || CODES[0];
  const f = freq14(inc, incidents, now);
  const loss = estMWh(inc);
  const overdue = isOverdue(inc, now);
  let score = (SEV_BASE[code.severity] || 10) + Math.min(18, f * 5) + Math.min(20, loss * 1.2) + (isActive(inc) ? 6 : 0) + (overdue ? 8 : 0);
  if (inc.escalated) score += 4;
  score = Math.min(100, Math.round(score));
  return { score, rank: score >= 75 ? 'P1' : score >= 48 ? 'P2' : 'P3', freq: f, loss, overdue };
}

export function enrich(inc: Incident, incidents: Incident[], now: number): EnrichedIncident {
  const code = CODE_BY_ID[inc.code] || CODES[0];
  const cat = CATEGORY_BY_ID[code.category] || CATEGORIES[0];
  const p = priority(inc, incidents, now);
  return {
    ...inc,
    codeInfo: code,
    categoryLabel: cat.label,
    teamLabel: inc.team || code.team,
    loss: p.loss,
    score: p.score,
    rank: p.rank,
    freq14: p.freq,
    overdue: p.overdue,
    downtimeHours: downtimeHours(inc)
  };
}

export function recurrenceGroups(incidents: Incident[], now: number): RecurrenceGroup[] {
  const since = now - CONFIG.recurrenceWindowDays * 86400000;
  const groups: Record<string, { key: string; turbine: string; category: string; items: Incident[] }> = {};
  for (const inc of incidents) {
    if (inc.startedAt < since) continue;
    const code = CODE_BY_ID[inc.code];
    if (!code) continue;
    const key = inc.turbine + '|' + code.category;
    if (!groups[key]) groups[key] = { key, turbine: inc.turbine, category: code.category, items: [] };
    groups[key].items.push(inc);
  }
  const out: RecurrenceGroup[] = [];
  for (const g of Object.values(groups)) {
    if (g.items.length < CONFIG.recurrenceMin) continue;
    const items = g.items.slice().sort((a, b) => a.startedAt - b.startedAt);
    let gaps = 0;
    for (let i = 1; i < items.length; i++) gaps += (items[i].startedAt - items[i - 1].startedAt) / 86400000;
    const avgGap = items.length > 1 ? gaps / (items.length - 1) : 0;
    const last = items[items.length - 1];
    const last30 = items.filter(x => x.startedAt >= now - 30 * 86400000).length;
    const prev30 = items.filter(x => x.startedAt >= now - 60 * 86400000 && x.startedAt < now - 30 * 86400000).length;
    const counts: Record<string, number> = {};
    for (const it of items) counts[it.code] = (counts[it.code] || 0) + 1;
    const topCode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    out.push({
      key: g.key,
      turbine: g.turbine,
      category: g.category,
      categoryLabel: (CATEGORY_BY_ID[g.category] || {}).label || g.category,
      topCode,
      count: items.length,
      open: items.filter(x => x.status !== 'Closed').length,
      active: items.filter(isActive).length,
      lastAt: last.startedAt,
      avgGap,
      loss: items.reduce((s, x) => s + estMWh(x), 0),
      trend: last30 > prev30 ? 'up' : last30 < prev30 ? 'down' : 'flat',
      last30,
      prev30
    });
  }
  return out.sort((a, b) => b.loss - a.loss);
}

export function fixEffectiveness(incidents: Incident[], now: number): FixEffectiveness {
  const closed = incidents.filter(i => i.status === 'Closed' && i.closedAt && i.closedAt <= now - 14 * 86400000);
  let held = 0;
  let repeated = 0;
  for (const c of closed) {
    const code = CODE_BY_ID[c.code];
    if (!code || !c.closedAt) continue;
    const end = c.closedAt + 14 * 86400000;
    const repeat = incidents.some(x => x !== c && x.turbine === c.turbine && CODE_BY_ID[x.code] &&
      CODE_BY_ID[x.code].category === code.category && x.startedAt > (c.closedAt || 0) && x.startedAt <= end);
    if (repeat) repeated++;
    else held++;
  }
  return { checked: closed.length, held, repeated, rate: closed.length ? (held / closed.length) * 100 : null };
}

export function computeFleetStats(incidents: Incident[], now: number): FleetStats {
  const since30 = now - 30 * 86400000;
  const open = incidents.filter(x => x.status !== 'Closed');
  const active = incidents.filter(isActive);
  const overdue = active.filter(x => isOverdue(x, now));
  const last30 = incidents.filter(x => x.startedAt >= since30);
  const loss30 = last30.reduce((s, x) => s + estMWh(x), 0);
  const potential30 = CONFIG.fleetMW * CONFIG.capacityFactor * 720;
  const resolved30 = incidents.filter(x => (x.resolvedAt || x.closedAt) && (x.resolvedAt || x.closedAt)! >= since30 && (x.resolvedAt || x.closedAt)! <= now);
  const mttr = resolved30.length ? resolved30.reduce((s, x) => s + (((x.resolvedAt || x.closedAt)!) - x.startedAt) / 3600000, 0) / resolved30.length : 0;
  const groups = recurrenceGroups(incidents, now);
  return {
    open: open.length,
    active: active.length,
    awaiting: open.filter(x => x.status === 'Resolved').length,
    criticalOpen: active.filter(x => (CODE_BY_ID[x.code] || {}).severity === 'Critical').length,
    overdue: overdue.length,
    criticalOverdue: overdue.filter(x => (CODE_BY_ID[x.code] || {}).severity === 'Critical').length,
    loss30,
    lpf30: potential30 ? (loss30 / potential30) * 100 : 0,
    mttr,
    mttrCount: resolved30.length,
    recurring: groups.length,
    recurringOpen: groups.reduce((s, g) => s + g.active, 0),
    groups
  };
}
