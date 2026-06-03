import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, 'src', 'app');

// Each entry: [filePath, [pattern, replacement][]]
const FIXES = {
  '/agents/page.tsx': [
    [/^const async \(machineId: string, command: string\) =>/gm, 'const sendCommand = async (machineId: string, command: string) =>'],
    [/^const \(\) => \{ \/\/ In production/gm, 'const setupSocket = () => { // In production'],
    [/^const async \(machineId: string\) =>/gm, 'const loadStats = async (machineId: string) =>'],
  ],
  '/billing/page.tsx': [
    // Line 27: const connectSocket(token) socket.on(...) socket.on(...) etc.
    // Spurious const before connectSocket call, and multiple socket.on on one line
    [/const connectSocket\(token\) /g, 'connectSocket(token)\n'],
    [/\) socket\.on\(/g, ')\nsocket.on('],
    // Line 55: const async (id: string) => { -> resumeSession
    [/^const async \(id: string\) =>/gm, 'const resumeSession = async (id: string) =>'],
    // Line 60: const useCallback((session) => { -> calcRemaining
    [/^const useCallback\(\(session: BillingSession\)/gm, 'const calcRemaining = useCallback((session: BillingSession)'],
    // Line 62: const session.passes.filter -> const pausedTotal
    [/^const session\.pauses \.filter/gm, 'const pausedTotal = session.pauses.filter'],
    // Line 63: const session.pauses.find -> const activePause
    [/^const session\.pauses\.find/gm, 'const activePause = session.pauses.find'],
    // Line 64: const activePause ? -> const activePauseMinutes
    [/^const activePause \?/gm, 'const activePauseMinutes = activePause ?'],
    // Line 69: const remaining < 10 -> const isCritical
    [/^const remaining < 10/gm, 'const isCritical = remaining < 10'],
    // Line 70: const remaining < 30 -> const isWarning (actually check the original)
    [/^const remaining < 30/gm, 'const isWarning = remaining < 30'],
  ],
  '/cafe/page.tsx': [
    // Line 29: else next[id]-- return next })
    [/else next\[id\]-- return next \}\)/, 'else next[id]--;\n    return next })'],
    // Line 26: second addToCart is actually removeFromCart
    [/const addToCart = \(id: string\) => setCart\(prev => \{/,
     'const removeFromCart = (id: string) => setCart(prev => {'],
    // Line 41: const async (id: string, status: string) => {
    [/^const async \(id: string, status: string\) =>/gm, 'const updateStatus = async (id: string, status: string) =>'],
  ],
  '/chatbot/page.tsx': [
    [/^const async \(q\?: string\) =>/gm, 'const sendMessage = async (q?: string) =>'],
  ],
  '/dashboard/page.tsx': [
    [/^const \[$/gm, 'const stats = ['],
  ],
  '/env-monitor/page.tsx': [
    [/^const \(val: number, thresholds: \[number, number, number\]\) =>/gm, 'const getColor = (val: number, thresholds: [number, number, number]) =>'],
  ],
  '/iot/page.tsx': [
    [/^const async \(id: string, status: 'ON' \| 'OFF'\) =>/gm, 'const controlDevice = async (id: string, status: \'ON\' | \'OFF\') =>'],
    [/^const async \(roomId: string, mode: 'on' \| 'off'\) =>/gm, 'const autoRoom = async (roomId: string, mode: \'on\' | \'off\') =>'],
  ],
  '/marketplace/page.tsx': [
    [/^const products\.filter\(p =>/gm, 'const filteredProducts = products.filter(p =>'],
  ],
  '/pos/page.tsx': [
    [/^const selectedPkg \? packages\.find/gm, 'const totalCost = selectedPkg ? packages.find'],
  ],
  '/queue/page.tsx': [
    // Line 46: first async (id)
    // Line 51: second async (id)
    // Need to match the one followed by api.queue.serve
    // and the one followed by api.queue.cancel
    [/const async \(id: string\) => \{\n\s*try \{ await api\.queue\.serve/g, 'const serveCustomer = async (id: string) => {\n  try { await api.queue.serve'],
    [/const async \(id: string\) => \{\n\s*try \{ await api\.queue\.cancel/g, 'const cancelCustomer = async (id: string) => {\n  try { await api.queue.cancel'],
  ],
  '/replay/page.tsx': [
    [/^const async \(id: string\) =>/gm, 'const saveRecording = async (id: string) =>'],
  ],
  '/reports/page.tsx': [
    [/^const isWeekend \?/gm, 'const base = isWeekend ?'],
  ],
  '/sync-status/page.tsx': [
    // Line 18: const () => setOnline(false) window.addEventListener(...) window.addEventListener(...)
    [/const handleOffline = \(\) => setOnline\(false\) window\.addEventListener/gm,
     'const handleOffline = () => setOnline(false)\n  window.addEventListener'],
    [/window\.addEventListener\('online', handleOnline\) window\.addEventListener\('offline', handleOffline\)/g,
     "window.addEventListener('online', handleOnline)\n  window.addEventListener('offline', handleOffline)"],
    // Line 30: const () => { with localStorage.getItem -> loadQueue
    [/^const \(\) => \{\n\s*try \{\n\s*const q = localStorage\.getItem/gm, 'const loadQueue = () => {\n  try {\n    const q = localStorage.getItem'],
    // Line 54: const () => { with operation -> addToQueue
    [/^const \(\) => \{\n\s*const operation = \{ id: \`op-/gm, 'const addToQueue = () => {\n  const operation = { id: `op-'],
    // Line 57: const JSON.parse -> const q = JSON.parse
    [/^const JSON\.parse/gm, 'const q = JSON.parse'],
    // q.push(operation) localStorage.setItem -> newline between them
    [/q\.push\(operation\) localStorage\.setItem/g, 'q.push(operation)\n  localStorage.setItem'],
    // Line 44: setSyncResult(...) localStorage.removeItem -> newline
    [/setSyncResult\(`Synced \$\{data\.synced\} operations, \$\{data\.conflicts\.length\} conflicts`\) localStorage\.removeItem/g,
     "setSyncResult(`Synced ${data.synced} operations, ${data.conflicts.length} conflicts`)\n  localStorage.removeItem"],
  ],
  '/tv-display/page.tsx': [
    [/^const setInterval\(load, 10000\)$/gm, 'const t1 = setInterval(load, 10000)'],
    [/^const setInterval\(\(\) => setClock\(new Date\(\)\), 1000\)$/gm, 'const t2 = setInterval(() => setClock(new Date()), 1000)'],
    [/^const setInterval\(\(\) => setMessageIndex\(i => \(i \+ 1\) % messages\.length\), 8000\)$/gm, 'const t3 = setInterval(() => setMessageIndex(i => (i + 1) % messages.length), 8000)'],
    [/^const \(unitId: string\) => sessions\.find/gm, 'const getSessionForUnit = (unitId: string) => sessions.find'],
    [/^const session \? Math\.max/gm, 'const remainingMinutes = session ? Math.max'],
  ],
  '/voice/page.tsx': [
    [/^const \(\) => \{/gm, 'const startListening = () => {'],
    // const new SpeechRecognition() -> const recognition = new SpeechRecognition()
    [/^const new SpeechRecognition\(\) /gm, 'const recognition = new SpeechRecognition() '],
  ],
};

// Simpler patterns for specific multi-line complex cases
const COMPLEX_FIXES = {};

const BILLING_FIX2 = [
  [/^} }, \[\]) \/\/ 1-second tick for realtime countdown useEffect\(\(\) => \{$/gm, '}\n}, [])\n// 1-second tick for realtime countdown\nuseEffect(() => {'],
];

let changed = 0;
for (const file of readdirSync(root, { recursive: true, withFileTypes: true })) {
  if (!file.name.endsWith('.tsx')) continue;
  const fpath = join(file.parentPath, file.name);
  const relPath = fpath.slice(root.length).replace(/\\/g, '/');

  let content = readFileSync(fpath, 'utf-8');
  const orig = content;

  const fixes = FIXES[relPath];
  if (fixes) {
    for (const [pattern, replacement] of fixes) {
      if (replacement === undefined) continue; // skip un-implemented
      content = content.replace(pattern, replacement);
    }
  }

  if (content !== orig) {
    writeFileSync(fpath, content, 'utf-8');
    changed++;
    console.log(`Fixed: ${relPath}`);
  }
}
console.log(`\nChanged ${changed} files`);
