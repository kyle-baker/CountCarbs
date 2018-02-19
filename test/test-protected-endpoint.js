'use strict'

global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test'
const chai = require('chai')
const chaiHttp = require('chai-http')
const jwt = require('jsonwebtoken')

const {app, runServer, closeServer} = require('../server')
const {User} = require('../models')
const {JWT_SECRET} = require('../config')

const expect = chai.expect

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp)

describe('Protected endpoint', function () {
  const username = 'exampleUser'
  const password = 'examplePass'

  before(function () {
    return runServer()
  })

  after(function () {
    return closeServer()
  })

  beforeEach(function () {
    let hashedPassword = User.hashPassword(password)
    return User.create({
      username: username,
      password: hashedPassword
    })
  })

  afterEach(function () {
    return User.remove({})
  })

  describe('/user/protected', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/user/protected')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err
          }

          const res = err.response
          expect(res).to.have.status(401)
        })
    })

    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          username
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      )

      return chai
        .request(app)
        .get('/user/protected')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err
          }

          const res = err.response
          expect(res).to.have.status(401)
        })
    })
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      )

      return chai
        .request(app)
        .get('/user/protected')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err
          }

          const res = err.response
          expect(res).to.have.status(401)
        })
    })
    it('Should send protected data', function () {
      const token = jwt.sign(
        {
          user: {
            username
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      )

      return chai
        .request(app)
        .get('/user/protected')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body.data).to.equal('success')
        })
    })
  })
})
