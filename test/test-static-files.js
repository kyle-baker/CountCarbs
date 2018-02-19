'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const {app} = require('../server.js')

chai.should()

chai.use(chaiHttp)

describe('index page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/index.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('results page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/results.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('create item page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/create-item.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('edit item page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/edit-item.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('log in page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/log-in.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('sign up page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/sign-up.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('show item page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/show-item.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('authorized home page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/auth-home.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})

describe('authorized results page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/auth-results.html')
      .then(function (res) {
        res.should.have.status(200)
      })
  })
})
