'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/count-carbs';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-count-carbs'
exports.PORT = process.env.PORT || 8080;