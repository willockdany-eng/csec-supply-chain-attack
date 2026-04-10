const { validateEmail, sanitizeInput, validatePassword, validatePhone } = require('csec-form-helpers');

console.log('');
console.log('  ── My Web App: Form Validation Demo ──');
console.log('');

const emails = ['user@example.com', 'bad-email', 'admin@corp.io'];
emails.forEach(e => {
  console.log(`  Email "${e}" → ${validateEmail(e) ? '✓ valid' : '✗ invalid'}`);
});
console.log('');

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

const dirty = '<script>alert("xss")</script>';
console.log(`  Sanitize: "${dirty}"`);
console.log(`  Result:   "${sanitizeInput(dirty)}"`);
console.log('');

console.log(`  Phone "+1 (555) 123-4567" → ${validatePhone('+1 (555) 123-4567') ? '✓ valid' : '✗ invalid'}`);
console.log('');
console.log('  ── Everything works perfectly! ──');
console.log('');
