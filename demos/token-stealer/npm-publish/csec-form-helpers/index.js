function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function validateURL(url) {
  try { new URL(url); return true; } catch { return false; }
}

function trimAll(obj) {
  var result = {};
  Object.keys(obj).forEach(function(k) {
    result[k] = typeof obj[k] === 'string' ? obj[k].trim() : obj[k];
  });
  return result;
}

module.exports = { validateEmail, sanitizeInput, validatePassword, validatePhone, validateURL, trimAll };
