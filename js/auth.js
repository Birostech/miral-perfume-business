/* ============================================================
   SCENTS BY MIRAL — Auth via AWS Cognito
   Replaces localStorage auth with real cloud user accounts.
   Users sign up once and their account works on any device.
   ============================================================ */

const _COGNITO_CONFIG = {
  UserPoolId: 'us-east-1_qB9vWPxIH',
  ClientId:   '7s8ug9bv3q979ksl227d3kebik'
};

const Auth = (() => {

  const SESSION_KEY  = 'sbm_session';
  const userPool     = new AmazonCognitoIdentity.CognitoUserPool(_COGNITO_CONFIG);

  // ── Session helpers (synchronous, reads sessionStorage) ────
  // Used for quick checks like page guards and nav updates.

  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }

  function _setSession(payload, token) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      id:        payload.sub,
      name:      payload.name || payload.email.split('@')[0],
      email:     payload.email,
      token,
      createdAt: payload['custom:createdAt'] || new Date().toISOString()
    }));
  }

  function _clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ── refreshSession(callback) ────────────────────────────────
  // Validates the Cognito session and refreshes the token if it
  // has expired. Call this on protected pages (account.html).
  // callback(user) — user is null if not logged in.

  function refreshSession(callback) {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { _clearSession(); callback(null); return; }

    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) { _clearSession(); callback(null); return; }
      const idToken = session.getIdToken();
      const payload = idToken.decodePayload();
      _setSession(payload, idToken.getJwtToken());
      callback(currentUser());
    });
  }

  // ── signup(name, email, password, callback) ─────────────────
  // Creates the Cognito account then immediately signs in.
  // Cognito sends a verification email automatically.
  // callback({ ok, error })

  function signup(name, email, password, callback) {
    const attributes = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'custom:createdAt', Value: new Date().toISOString() })
    ];

    userPool.signUp(email, password, attributes, null, (err) => {
      if (err) { callback({ ok: false, error: _friendlyError(err) }); return; }
      // Auto sign-in immediately after signup
      login(email, password, callback);
    });
  }

  // ── login(email, password, callback) ───────────────────────
  // callback({ ok, error })

  function login(email, password, callback) {
    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool:     userPool
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess(session) {
        const idToken = session.getIdToken();
        _setSession(idToken.decodePayload(), idToken.getJwtToken());
        callback({ ok: true });
      },
      onFailure(err) {
        callback({ ok: false, error: _friendlyError(err) });
      },
      newPasswordRequired() {
        callback({ ok: false, error: 'A password reset is required. Please contact support.' });
      }
    });
  }

  // ── logout() ────────────────────────────────────────────────

  function logout() {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    _clearSession();
  }

  // ── updateProfile(name, email, callback) ────────────────────
  // Updates the user's name in Cognito and refreshes the session.
  // Note: email changes in Cognito require re-verification, so
  // we only update the name attribute here.

  function updateProfile(name, email, callback) {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { callback({ ok: false, error: 'Not logged in.' }); return; }

    cognitoUser.getSession((err) => {
      if (err) { callback({ ok: false, error: err.message }); return; }

      const attributes = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
      ];

      cognitoUser.updateAttributes(attributes, (err) => {
        if (err) { callback({ ok: false, error: _friendlyError(err) }); return; }
        // Update local session with new name
        const session = currentUser();
        if (session) {
          session.name = name;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        callback({ ok: true });
      });
    });
  }

  // ── changePassword(current, next, callback) ─────────────────

  function changePassword(current, next, callback) {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { callback({ ok: false, error: 'Not logged in.' }); return; }

    cognitoUser.getSession((err) => {
      if (err) { callback({ ok: false, error: err.message }); return; }

      cognitoUser.changePassword(current, next, (err) => {
        if (err) { callback({ ok: false, error: _friendlyError(err) }); return; }
        callback({ ok: true });
      });
    });
  }

  // ── Turn Cognito error codes into readable messages ─────────
  function _friendlyError(err) {
    const map = {
      'UsernameExistsException':       'An account with that email already exists.',
      'UserNotFoundException':         'Incorrect email or password.',
      'NotAuthorizedException':        'Incorrect email or password.',
      'InvalidPasswordException':      'Password must be at least 6 characters.',
      'InvalidParameterException':     'Please check your details and try again.',
      'LimitExceededException':        'Too many attempts. Please wait a moment and try again.',
      'UserNotConfirmedException':     'Please verify your email address before signing in.',
      'CodeMismatchException':         'Incorrect verification code.',
      'ExpiredCodeException':          'Verification code has expired. Please request a new one.',
      'NetworkError':                  'Network error. Please check your connection.'
    };
    return map[err.code] || err.message || 'Something went wrong. Please try again.';
  }

  return {
    currentUser,
    refreshSession,
    signup,
    login,
    logout,
    updateProfile,
    changePassword,
    OWNER_EMAIL: 'olayemisamuel5@gmail.com'
  };

})();

/* ── Newsletter (stays in localStorage — no auth needed) ──── */
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

/* ── Sync the navbar Sign In / account button ───────────────── */
function syncNavAuth() {
  const user  = Auth.currentUser();
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
