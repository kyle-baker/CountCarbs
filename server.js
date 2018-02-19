'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')

const { Strategy: LocalStrategy } = require('passport-local')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const { DATABASE_URL, PORT, JWT_SECRET, JWT_EXPIRY } = require('./config')
const { User, CarbItem } = require('./models')
mongoose.Promise = global.Promise

const app = express()

app.use(morgan('common'))
app.use(express.static('public'))
app.use(bodyParser.json())

// Passport Strategies
const localStrategy = new LocalStrategy((username, password, callback) => {
  let user
  User.findOne({ username: username })
    .then(_user => {
      user = _user
      if (!user) {
        // Return a rejected promise so we break out of the chain of .thens.
        // Any errors like this will be handled in the catch block.
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        })
      }
      return user.validatePassword(password)
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        })
      }
      return callback(null, user)
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err)
      }
      return callback(err, false)
    })
})

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user)
  }
)

passport.use(localStrategy)
passport.use(jwtStrategy)

// Authorization
const createAuthToken = function (user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  })
}

// Protected endpoint
const jwtAuth = passport.authenticate('jwt', {session: false})
app.get('/user/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'success'
  })
})

// USERS
// Sign up
app.post('/user/signup', (req, res) => {
  const stringFields = ['username', 'password']
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  )

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    })
  }

  // If the username and password aren't trimmed we give an error.
  const explicityTrimmedFields = ['username', 'password']
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  )

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    })
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 4,
      max: 72
    }
  }
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  )
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  )

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    })
  }

  let {username, password} = req.body

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        })
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User.create({
        username,
        password: hash
      })
    })
    .then(user => {
      return res.status(201).json(user.serialize())
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err)
      }
      res.status(500).json({code: 500, message: 'Internal server error'})
    })
})

// Log in
const localAuth = passport.authenticate('local', {session: false})
// The user provides a username and password to login
app.post('/user/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize())
  res.json({authToken})
})

// Search for items
app.get('/carb-items', (req, res) => {
  var queryValue = req.query.name
  var regex = new RegExp(queryValue)
  CarbItem
    .find({ 'name': { $regex: regex, $options: 'i' } },
      function (err, carbItem) {
        if (err) return handleError(err)
        console.log('There was an error')
      })
    .then(carbItem => { res.json(carbItem) })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    })
})

// Request item by ID
app.get('/carb-items/:id', (req, res) => {
  CarbItem
    .findById(req.params.id)
    .then(carbItem => res.json(carbItem))
    .catch(err => {
      console.log('Hello World!')
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    })
})

// Create a new item
app.post('/create-carb-item', (req, res) => {
  const requiredFields = ['name', 'carbs', 'calories', 'serving', 'publicAccess']
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i]
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message)
      return res.status(400).send(message)
    }
  }
  CarbItem
    .create({
      name: req.body.name,
      carbs: req.body.carbs,
      calories: req.body.calories,
      serving: req.body.serving,
      publicAccess: req.body.publicAccess
    })
    .then(carbItem => res.status(201).json(carbItem.serialize()))
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    })
})

// Update an existing item
app.put('/carb-items/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`)
    console.error(message)
    return res.status(400).json({ message: message })
  }

  const toUpdate = {}
  const updateableFields = ['name', 'carbs', 'calories', 'serving', 'publicAccess']

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field]
    }
  })

  CarbItem
    // all key/value pairs in toUpdate will be updated
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(carbItem => res.status(204).json(carbItem.serialize()).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }))
})

// Delete an item by ID
app.delete('/carb-items/:id', (req, res) => {
  CarbItem
    .findByIdAndRemove(req.params.id)
    .then(carbItem => res.status(204).json(carbItem.serialize()).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }))
})

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' })
})

let server

function runServer () {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err)
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`)
          resolve()
        })
        .on('error', err => {
          mongoose.disconnect()
          reject(err)
        })
    })
  })
}

function closeServer () {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server')
      server.close(err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

if (require.main === module) {
  runServer().catch(err => console.error(err))
}

module.exports = { app, runServer, closeServer }
