'use strict';
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');
let mongoUri =  process.env.MONGOLAB_URI || 'mongodb://localhost/weather';
mongoose.connect(mongoUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Database Connection Established');
});

app.listen(process.env.PORT || 5000, function() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('express running', host, port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/node_modules'));


let userRoutes = require('./routes/userRoutes');
let locationRoutes = require('./routes/locationRoutes');
app.use('/user', userRoutes);
app.use('/location', locationRoutes);
