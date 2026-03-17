const firebaseService = require('./services/firebase.service');

// Keep compatibility with common "firebase.js" entrypoint pattern.
firebaseService.initialize();

module.exports = firebaseService;
