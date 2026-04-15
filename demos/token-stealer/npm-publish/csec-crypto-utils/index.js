const crypto = require('crypto');

function sha256(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function md5(input) {
  return crypto.createHash('md5').update(String(input)).digest('hex');
}

function base64Encode(input) {
  return Buffer.from(String(input)).toString('base64');
}

function base64Decode(input) {
  return Buffer.from(String(input), 'base64').toString('utf-8');
}

function randomToken(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function hmacSha256(data, secret) {
  return crypto.createHmac('sha256', secret).update(String(data)).digest('hex');
}

module.exports = { sha256, md5, base64Encode, base64Decode, randomToken, hmacSha256 };
