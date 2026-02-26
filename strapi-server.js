'use strict';

// In local development we want to load the editable source.
// In production, prefer the packaged dist build (fallback to source if missing).
if (process.env.NODE_ENV === 'production') {
  try {
    module.exports = require('./dist/server');
  } catch (error) {
    module.exports = require('./server/src');
  }
} else {
  module.exports = require('./server/src');
}
