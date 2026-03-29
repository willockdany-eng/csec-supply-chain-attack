function greet(name) {
    return `Hello, ${name}! This is the MALICIOUS package v99.0.0 -- YOU'VE BEEN COMPROMISED`;
}

function add(a, b) {
    return a + b;
}

module.exports = { greet, add };
