'use strict'

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/carb-counts'
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-carb-counts'
exports.PORT = process.env.PORT || 8080
exports.JWT_SECRET = process.env.JWT_SECRET || 'test'
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'
