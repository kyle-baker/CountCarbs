'use strict'

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

// this makes the should syntax available throughout
// this module
const should = chai.should()

const { CarbItem } = require('../models')
const { closeServer, runServer, app } = require('../server')
const { TEST_DATABASE_URL } = require('../config')

chai.use(chaiHttp)

// this function deletes the entire database.
function tearDownDb () {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database')
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedCarbItemData () {
  console.info('seeding carb item data')
  const seedData = []
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      name: faker.lorem.word(),
      carbs: faker.random.number(),
      calories: faker.random.number(),
      serving: 'One cup',
      publicAccess: true
    })
  }
  let appleItem = {
    name: 'apple',
    carbs: 30,
    calories: 70,
    serving: 'One Apple',
    publicAccess: true
  }
  // this will return a promise
  return CarbItem.insertMany(seedData)
  return CarbItem.insertOne(appleItem)
}

describe('Carb Item API resource', function () {
  before(function () {
    return runServer(TEST_DATABASE_URL)
  })

  beforeEach(function () {
    return seedCarbItemData()
  })

  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb()
  })

  after(function () {
    return closeServer()
  })

  describe('GET endpoint', function () {
    it('should return carb item with the name apple', function () {
      let res
      return chai.request(app)
        .get('/carb-items?name=apple')
        .then(_res => {
          res = _res
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.should.have.length.of.at.least(0)
          return CarbItem.count()
        })
    })

    it('should return items with right fields', function () {
      // Strategy: Get back all items, and ensure they have expected keys

      let resItem
      return chai.request(app)
        .get('/carb-items')
        .then(function (res) {
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.a('array')
          res.body.should.have.length.of.at.least(1)

          res.body.forEach(function (resItem) {
            resItem.should.be.a('object')
            resItem.should.include.keys('_id', 'name', 'carbs', 'calories', 'serving', 'publicAccess')
          })
          // just check one of the posts that its values match with those in db
          // and we'll assume it's true for rest
          resItem = res.body[0]
          return CarbItem.findById(resItem._id)
        })
        .then(item => {
          resItem.name.should.equal(item.name)
          resItem.carbs.should.equal(item.carbs)
          resItem.calories.should.equal(item.calories)
          resItem.serving.should.equal(item.serving)
          resItem.publicAccess.should.equal(item.publicAccess)
        })
    })
  })

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the post we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new carb item', function () {
      const newItem = {
        name: faker.lorem.word(),
        carbs: faker.random.number(),
        calories: faker.random.number(),
        serving: 'One cup',
        publicAccess: true
      }

      return chai.request(app)
        .post('/create-carb-item')
        .send(newItem)
        .then(function (res) {
          res.should.have.status(201)
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'name', 'carbs', 'calories', 'serving', 'publicAccess')
          res.body.name.should.equal(newItem.name)
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null
          res.body.carbs.should.equal(newItem.carbs)
          res.body.calories.should.equal(newItem.calories)
          res.body.serving.should.equal(newItem.serving)
          return CarbItem.findById(res.body.id)
        })
        .then(function (post) {
          post.name.should.equal(newItem.name)
          post.carbs.should.equal(newItem.carbs)
          post.calories.should.equal(newItem.calories)
          post.serving.should.equal(newItem.serving)
        })
    })
  })

  describe('PUT endpoint', function () {
    // strategy:
    //  1. Get an existing post from db
    //  2. Make a PUT request to update that post
    //  4. Prove post in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        name: 'rice',
        carbs: 15,
        calories: 100,
        serving: 'One cup',
        publicAccess: true
      }

      return CarbItem
        .findOne()
        .then(item => {
          updateData.id = item.id

          return chai.request(app)
            .put(`/carb-items/${item.id}`)
            .send(updateData)
        })
        .then(res => {
          res.should.have.status(204)
          return CarbItem.findById(updateData.id)
        })
        .then(item => {
          item.name.should.equal(updateData.name)
          item.carbs.should.equal(updateData.carbs)
          item.calories.should.equal(updateData.calories)
          item.serving.should.equal(updateData.serving)
        })
    })
  })

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a item
    //  2. make a DELETE request for that item's id
    //  3. assert that response has right status code
    //  4. prove that item with the id doesn't exist in db anymore
    it('should delete a item by id', function () {
      let item

      return CarbItem
        .findOne()
        .then(_item => {
          item = _item
          return chai.request(app).delete(`/carb-items/${item.id}`)
        })
        .then(res => {
          res.should.have.status(204)
          return CarbItem.findById(item.id)
        })
        .then(_item => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_post.should.be.null` would raise
          // an error. `should.be.null(_post)` is how we can
          // make assertions about a null value.
          should.not.exist(_item)
        })
    })
  })
})
