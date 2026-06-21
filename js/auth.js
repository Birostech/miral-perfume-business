/* ============================================================
   SCENTS BY MIRAL — Customer Auth (localStorage)
   ============================================================ */

const Auth = (() => {
  const USERS_KEY   = 'sbm_users';
  const SESSION_KEY = 'sbm_session';
  const OWNER_EMAIL = 'olayemisamuel5@gmail.com';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  function signup(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const user = { id: Date.now(), name, email: email.toLowerCase(), password, createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    setSession({ id: user.id, name: user.name, email: user.email });
    return { ok: true };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Incorrect email or password.' };
    setSession({ id: user.id, name: user.name, email: user.email });
    return { ok: true };
  }

  function logout() { clearSession(); }

  function updateProfile(name, email) {
    const session = currentUser();
    if (!session) return { ok: false, error: 'Not logged in.' };
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'User not found.' };
    users[idx].name  = name;
    users[idx].email = email.toLowerCase();
    saveUsers(users);
    setSession({ id: users[idx].id, name: users[idx].name, email: users[idx].email });
    return { ok: true };
  }

  function changePassword(current, next) {
    const session = currentUser();
    if (!session) return { ok: false, error: 'Not logged in.' };
    const users = getUsers();
    const user = users.find(u => u.id === session.id);
    if (!user || user.password !== current) return { ok: false, error: 'Current password is incorrect.' };
    user.password = next;
    saveUsers(users);
    return { ok: true };
  }

  return { signup, login, logout, currentUser, updateProfile, changePassword, OWNER_EMAIL };
})();

/* ── Newsletter subscriber storage ──────────────────────── */
function saveSubscriber(email) {
  const key  = 'sbm_subscribers';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const norm = email.toLowerCase().trim();
  if (!list.find(s => s.email === norm)) {
    list.push({ email: norm, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
  }
}
function getSubscribers() {
  return JSON.parse(localStorage.getItem('sbm_subscribers') || '[]');
}

/* ── Update navbar based on auth state ──────────────────── */
function syncNavAuth() {
  const user = Auth.currentUser();
  const btn   = document.getElementById('nav-account-btn');
  const label = document.getElementById('nav-account-label');
  if (!btn) return;
  if (user) {
    btn.href = 'account.html';
    btn.classList.add('logged-in');
    if (label) label.textContent = user.name.split(' ')[0];
  } else {
    btn.href = 'login.html';
    btn.classList.remove('logged-in');
    if (label) label.textContent = 'Sign In';
  }
}

document.addEventListener('DOMContentLoaded', syncNavAuth);
