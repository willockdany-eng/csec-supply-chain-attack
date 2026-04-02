/**
 * csec-form-helpers — "Lightweight form validation helpers"
 *
 * This looks like a perfectly normal utility library.
 * A developer would install it, use these functions, and never suspect anything.
 * But the REAL attack happens in postinstall.js (runs on `npm install`).
 */

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function sanitizeInput(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    get valid() {
      return this.length && this.uppercase && this.lowercase && this.number;
    }
  };
}

function validatePhone(phone) {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone);
}

module.exports = { validateEmail, sanitizeInput, validatePassword, validatePhone };
