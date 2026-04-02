/**
 * VICTIM APP — A normal web application
 *
 * This developer just wanted a form validation library.
 * They found "csec-form-helpers" on npm, it had good reviews,
 * and the API looked clean. They installed it:
 *
 *   npm install csec-form-helpers
 *
 * What they didn't know: the postinstall hook already stole their
 * tokens and sent them to the attacker's server.
 *
 * This file demonstrates NORMAL usage of the package.
 * Everything works perfectly — that's what makes it so dangerous.
 */

const { validateEmail, sanitizeInput, validatePassword, validatePhone } = require('csec-form-helpers');

console.log('');
console.log('  ── My Web App: Form Validation Demo ──');
console.log('');

// Test email validation
const emails = ['user@example.com', 'bad-email', 'admin@corp.io'];
emails.forEach(e => {
  console.log(`  Email "${e}" → ${validateEmail(e) ? '✓ valid' : '✗ invalid'}`);
});
console.log('');

// Test password validation
const password = 'MyP@ss123';
const result = validatePassword(password);
console.log(`  Password "${password}":`);
console.log(`    Length ≥ 8:    ${result.length ? '✓' : '✗'}`);
console.log(`    Uppercase:     ${result.uppercase ? '✓' : '✗'}`);
console.log(`    Lowercase:     ${result.lowercase ? '✓' : '✗'}`);
console.log(`    Number:        ${result.number ? '✓' : '✗'}`);
console.log(`    Special char:  ${result.special ? '✓' : '✗'}`);
console.log(`    Overall:       ${result.valid ? '✓ STRONG' : '✗ WEAK'}`);
console.log('');

// Test sanitization
const dirty = '<script>alert("xss")</script>';
console.log(`  Sanitize: "${dirty}"`);
console.log(`  Result:   "${sanitizeInput(dirty)}"`);
console.log('');

// Test phone validation
console.log(`  Phone "+1 (555) 123-4567" → ${validatePhone('+1 (555) 123-4567') ? '✓ valid' : '✗ invalid'}`);
console.log('');

console.log('  ── Everything works perfectly! ──');
console.log('  ── But your tokens were already stolen during npm install ──');
console.log('');
