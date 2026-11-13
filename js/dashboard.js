// Dashboard UI
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const COLORS = { High: 'var(--hi)', Medium: 'var(--med)', Low: 'var(--lo)' };
let state = loadData();

function render() {
  const t = state.target;
  const res = state.subjects.map(s => ({ s, r: analyze(s.att, s.cond, s.up, t) }));
  const ok = res.filter(x => !x.r.error);
  const sumA = state.subjects.reduce((a, s) => a + s.att, 0), sumC = state.subjects.reduce((a, s) => a + s.cond, 0);
  const cnt = k => ok.filter(x => x.r.risk === k).length;
  $('cards').innerHTML =
    '<div class="card"><b>' + (sumC ? (sumA / sumC * 100).toFixed(1) : 0) + '%</b><span>Overall attendance</span></div>' +
    '<div class="card hi"><b>' + cnt('High') + '</b><span>High risk subjects</span></div>' +
    '<div class="card med"><b>' + cnt('Medium') + '</b><span>Medium risk subjects</span></div>' +
    '<div class="card lo"><b>' + cnt('Low') + '</b><span>Safe subjects</span></div>';
  $('rows').innerHTML = res.length ? res.map(({ s, r }) => '<tr>' +
    '<td>' + esc(s.name) + '</td>' +
    '<td><input type="number" min="0" data-id="' + s.id + '" data-f="att" value="' + s.att + '"></td>' +
    '<td><input type="number" min="0" data-id="' + s.id + '" data-f="cond" value="' + s.cond + '"></td>' +
    '<td>' + (r.error ? '-' : r.pct.toFixed(1) + '%<div class="bar"><i style="width:' + Math.min(100, r.pct) + '%;background:' + COLORS[r.risk] + '"></i></div>') + '</td>' +
    '<td><input type="number" min="0" data-id="' + s.id + '" data-f="up" value="' + s.up + '"></td>' +
    '<td>' + (r.error ? '-' : '<span class="badge ' + r.risk + '">' + r.risk + '</span>') + '</td>' +
    '<td class="sug">' + esc(r.error || r.text) + '</td>' +
    '<td><button class="btn del" data-del="' + s.id + '" type="button">Delete</button></td></tr>').join('')
    : '<tr><td colspan="8">No subjects yet. Add one below or generate attendance.</td></tr>';
  $('chart').innerHTML = (ok.map(({ s, r }) => '<div class="crow"><span>' + esc(s.name) + '</span>' +
    '<div class="track"><i style="width:' + Math.min(100, r.pct) + '%;background:' + COLORS[r.risk] + '"></i><u style="left:' + Math.min(100, t) + '%"></u></div>' +
    '<b>' + r.pct.toFixed(0) + '%</b></div>').join('') || '<p class="muted">No data to show.</p>') +
    '<div class="legend">Black line = ' + t + '% target</div>';
  $('target').value = t;
}
function persist() { saveData(state); render(); }

$('rows').addEventListener('change', e => {
  const el = e.target, id = el.dataset.id; if (!id) return;
  const s = state.subjects.find(x => x.id === id); if (!s) return;
  const f = el.dataset.f, old = s[f];
  s[f] = Math.max(0, Math.floor(Number(el.value) || 0));
  if (s.att > s.cond) { s[f] = old; showMsg('Attended classes cannot exceed conducted classes.'); }
  else showMsg('');
  persist();
});
$('rows').addEventListener('click', e => {
  const id = e.target.dataset.del; if (!id) return;
  state.subjects = state.subjects.filter(x => x.id !== id); persist();
});
$('genBtn').onclick = () => { state.subjects = generateAll(); persist(); showMsg('New attendance generated.', true); };
$('addBtn').onclick = () => {
  const n = $('newName').value.trim();
  if (!n) return showMsg('Enter a subject name.');
  state.subjects.push(makeSubject(n)); $('newName').value = ''; persist(); showMsg('');
};
$('target').onchange = () => {
  const v = Number($('target').value);
  state.target = v >= 1 && v <= 100 ? v : 75; persist();
};
$('wBtn').onclick = () => {
  const r = analyze($('wAtt').value, $('wCond').value, $('wUp').value, state.target);
  $('wOut').innerHTML = r.error ? '<span class="msg">' + esc(r.error) + '</span>' :
    '<p>Current attendance: <b>' + r.pct.toFixed(1) + '%</b></p><p>Risk: <span class="badge ' + r.risk + '">' + r.risk + '</span></p><p>Suggestion: ' + esc(r.text) + '</p>';
};

// ---- Dataset import (CSV) ----
let dataset = [];
try { dataset = JSON.parse(localStorage.getItem('sap_dataset')) || []; } catch (e) { dataset = []; }
function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('The CSV file is empty.');
  const head = lines.shift().split(',').map(h => h.trim().toLowerCase());
  const ix = n => head.indexOf(n);
  if (['subject', 'attended', 'conducted', 'upcoming'].some(n => ix(n) < 0))
    throw new Error('CSV needs these columns: subject, attended, conducted, upcoming (optional: roll_no, student_name).');
  const rows = lines.map(l => {
    const c = l.split(',').map(x => x.trim());
    return { roll: ix('roll_no') >= 0 ? c[ix('roll_no')] : 'ALL', name: ix('student_name') >= 0 ? c[ix('student_name')] : 'Imported data',
      subject: c[ix('subject')], att: Number(c[ix('attended')]), cond: Number(c[ix('conducted')]), up: Number(c[ix('upcoming')]) };
  }).filter(r => r.subject && [r.att, r.cond, r.up].every(n => isFinite(n) && n >= 0) && r.att <= r.cond);
  if (!rows.length) throw new Error('No valid rows found in the CSV.');
  return rows;
}
function fillSel() {
  const seen = {}; dataset.forEach(r => { seen[r.roll] = r.name; });
  const keys = Object.keys(seen);
  $('stuSel').innerHTML = keys.map(k => '<option value="' + esc(k) + '">' + esc(k) + ' - ' + esc(seen[k]) + '</option>').join('');
  $('dsInfo').textContent = dataset.length ? dataset.length + ' records for ' + keys.length + ' students loaded. Pick a student and click the button.' : 'No dataset loaded yet.';
}
function setDataset(rows) {
  dataset = rows;
  try { localStorage.setItem('sap_dataset', JSON.stringify(rows)); } catch (e) {}
  fillSel(); showMsg('Dataset loaded.', true);
}
$('sampleBtn').onclick = () => {
  fetch('data/attendance_dataset.csv').then(r => { if (!r.ok) throw new Error('missing'); return r.text(); })
    .then(t => setDataset(parseCSV(t)))
    .catch(() => showMsg('Could not load the sample. Run with Live Server or upload data/attendance_dataset.csv.'));
};
$('csvFile').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { try { setDataset(parseCSV(String(rd.result))); } catch (err) { showMsg(err.message); } };
  rd.onerror = () => showMsg('Could not read that file.');
  rd.readAsText(f);
};
$('useBtn').onclick = () => {
  const rows = dataset.filter(r => r.roll === $('stuSel').value);
  if (!rows.length) return showMsg('Load a dataset first.');
  state.subjects = rows.map((r, i) => ({ id: Date.now() + '-' + i, name: r.subject, att: r.att, cond: r.cond, up: r.up }));
  persist(); showMsg('Loaded ' + rows.length + ' subjects from the dataset.', true);
};
fillSel();
$('logoutBtn').onclick = logout;
$('who').textContent = (currentUser() || { name: '' }).name;
render(); $('wBtn').click();
