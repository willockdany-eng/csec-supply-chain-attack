function greet(name) {
    return `Hello, ${name}! This is the LEGITIMATE internal package v1.2.3`;
}

function add(a, b) {
    return a + b;
}

module.exports = { greet, add };
