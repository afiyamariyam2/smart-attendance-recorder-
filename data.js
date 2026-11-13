// Per-user attendance data stored in localStorage
const DEFAULT_SUBJECTS = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Python Programming'];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
function dataKey() { const u = currentUser(); return 'sap_data_' + (u ? u.email : 'guest'); }
function makeSubject(name) {
  const cond = rnd(30, 60), att = Math.min(cond, Math.round(cond * rnd(55, 95) / 100));
  return { id: Date.now() + '-' + rnd(1000, 9999), name, att, cond, up: rnd(10, 30) };
}
function generateAll() { return DEFAULT_SUBJECTS.map((n, i) => { const s = makeSubject(n); s.id += '-' + i; return s; }); }
function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(dataKey()));
    if (d && Array.isArray(d.subjects)) return d;
  } catch (e) {}
  const fresh = { target: 75, subjects: generateAll() };
  saveData(fresh); return fresh;
}
function saveData(d) { try { localStorage.setItem(dataKey(), JSON.stringify(d)); } catch (e) {} }
