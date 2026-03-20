'use strict';

// Source-based plugin entrypoint.
// Strapi will load the plugin from `admin/` + `server/` without requiring a pre-built `dist/`.
module.exports = require('./server/src');
