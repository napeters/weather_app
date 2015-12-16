'use strict';
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/weather');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Database Connection Established');
});

const server = app.listen(5000, function() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('express running', host, port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/node_modules'));


let userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);
