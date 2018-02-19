'use strict'
global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test'
const chai = require('chai')
const chaiHttp = require('chai-http')
const jwt = require('jsonwebtoken')

const { app, runServer, closeServer } = require('../server')
const { User } = require('../models')
const { JWT_SECRET } = require('../config')

const expect = chai.expect

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp)

describe('Auth endpoints', function () {
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

  describe('/user/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/user/login')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err
          }

          const res = err.response
          expect(res).to.have.status(400)
        })
    })
    it('Should reject requests with incorrect usernames', function () {
      return chai
        .request(app)
        .post('/user/login')
        .send({ username: 'wrongUsername', password })
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
    it('Should reject requests with incorrect passwords', function () {
      return chai
        .request(app)
        .post('/user/login')
        .send({ username, password: 'wrongPassword' })
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
    it('Should return a valid auth token', function () {
      return chai
        .request(app)
        .post('/user/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          const token = res.body.authToken
          expect(token).to.be.a('string')
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          })
          expect(payload.user).to.deep.equal({
            username
          })
        })
    })
  })
})
