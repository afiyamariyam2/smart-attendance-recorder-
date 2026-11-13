// Authentication using localStorage (demo-grade, no server)
const USERS_KEY = 'sap_users', SESSION_KEY = 'sap_session';
function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
function saveUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) {} }
function currentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  return getUsers().find(u => u.email === email) || null;
}
function showMsg(t, ok) { const m = document.getElementById('msg'); if (m) { m.textContent = t; m.className = 'msg' + (ok ? ' ok' : ''); } }
function logout() { localStorage.removeItem(SESSION_KEY); location.href = 'index.html'; }
function ensureDemo() {
  const u = getUsers();
  if (!u.some(x => x.email === 'demo@student.com')) { u.push({ name: 'Demo Student', roll: 'DEMO001', email: 'demo@student.com', password: 'demo123' }); saveUsers(u); }
}
function doLogin(email, pass) {
  email = (email || '').trim().toLowerCase();
  if (!email || !pass) return showMsg('Enter your email and password.');
  const user = getUsers().find(u => u.email === email && u.password === pass);
  if (!user) return showMsg('Wrong email or password.');
  localStorage.setItem(SESSION_KEY, user.email);
  location.href = 'dashboard.html';
}
function doRegister() {
  const v = id => document.getElementById(id).value.trim();
  const name = v('rName'), roll = v('rRoll'), email = v('rEmail').toLowerCase();
  const pass = document.getElementById('rPass').value, pass2 = document.getElementById('rPass2').value;
  if (!name || !roll || !email || !pass || !pass2) return showMsg('Fill in all fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg('Enter a valid email address.');
  if (pass.length < 6) return showMsg('Password needs at least 6 characters.');
  if (pass !== pass2) return showMsg('Passwords do not match.');
  const users = getUsers();
  if (users.some(u => u.email === email)) return showMsg('This email is already registered. Log in instead.');
  users.push({ name, roll, email, password: pass }); saveUsers(users);
  localStorage.setItem(SESSION_KEY, email);
  location.href = 'dashboard.html';
}
(function init() {
  const isLogin = document.getElementById('loginBtn');
  if (isLogin) {
    ensureDemo();
    if (currentUser()) { location.href = 'dashboard.html'; return; }
    const $ = id => document.getElementById(id);
    const show = login => {
      $('loginForm').hidden = !login; $('regForm').hidden = login;
      $('tabLogin').classList.toggle('active', login); $('tabReg').classList.toggle('active', !login); showMsg('');
    };
    $('tabLogin').onclick = () => show(true); $('tabReg').onclick = () => show(false);
    $('loginBtn').onclick = () => doLogin($('lEmail').value, $('lPass').value);
    $('demoBtn').onclick = () => doLogin('demo@student.com', 'demo123');
    $('regBtn').onclick = doRegister;
  } else if (document.getElementById('logoutBtn') && !currentUser()) {
    location.href = 'index.html';
  }
})();
