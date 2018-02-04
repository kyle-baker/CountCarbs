'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');


const { DATABASE_URL, PORT } = require('./config');
const { User, CarbItem } = require('./models')
mongoose.Promise = global.Promise;

const app = express();

//Logging
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

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

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
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
    .then(carbItem => res.status(204).end())
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



