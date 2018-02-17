'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Logging
const morgan = require('morgan');

const { DATABASE_URL, PORT, JWT_SECRET, JWT_EXPIRY } = require('./config');
const { User, CarbItem } = require('./models')
mongoose.Promise = global.Promise;

const app = express();

//Logging
app.use(morgan('common'));

app.use(express.static('public'));
app.use(bodyParser.json());

//USERS
//Authorization 
const createAuthToken = function(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};
//Sign up
app.post('/user/signup', (req, res) => {
  const requiredFields = ['username', 'password', 'confirmation'];
  const {username, password, confirmation} = req.body;
  if (username && password && confirmation) {
    if (password == confirmation) {
      User.find({username: username}).then(response => {
        console.log(response);
      User
        .create({
          username: username,
          password: bcrypt.hashSync(password, 10),
        })
      .then(newUser => res.status(201).json(newUser.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      })
    })
    }
    else {
      console.log("Password and password confirmation must match!");
    }
  }
  else {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }
})

//Log in
app.post('/user/login', (req, res) => {
  const requiredFields = ['username', 'password'];
  const {username, password } = req.body;
  if (username && password) {
      User.find({username: username}).then(response => {
        console.log(response);
        const user = response[0];
        if (user.validatePassword(password)) {
          console.log("You are now logged in");
          const authToken = createAuthToken(user.serialize());
          res.json({authToken});

        }
        else {
          res.status(401).json({ message: 'Please re-enter username and password' });
        }
      })
      .catch(err => {
        console.error(err);
        res.status(401).json({ message: 'Please re-enter username and password' });
      })
    }

  else {
    return res.status(400).json({message: 'You must enter a username and password'})
  }
})

//Valid, non-expired JWT is required.
// app.get('/user/protected', (req, res) => {

// });

//CRUD
app.get('/carb-items', (req, res) => {
  var queryValue = req.query.name;
  var regex = new RegExp(queryValue);
  CarbItem
     .find({ "name" : { $regex: regex, $options: 'i' } },
          function (err, carbItem) {
                 if (err) return handleError(err);
                 console.log('There was an error');
               })
    .then(carbItem => { res.json(carbItem)})
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


// can also request by ID
app.get('/carb-items/:id', (req, res) => {
  CarbItem
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .then(carbItem => res.json(carbItem))
    .catch(err => {
      console.log("Hello World!")
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/create-carb-item', (req, res) => {
  const requiredFields = ['name', 'carbs', 'calories', 'serving', 'publicAccess'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
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
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/carb-items/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ['name', 'carbs', 'calories', 'serving', 'publicAccess'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  CarbItem
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(carbItem => res.status(204).json(carbItem.serialize()).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/carb-items/:id', (req, res) => {
  CarbItem
    .findByIdAndRemove(req.params.id)
    .then(carbItem => res.status(204).json(carbItem.serialize()).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});


let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };



