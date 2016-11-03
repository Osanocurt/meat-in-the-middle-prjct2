const mongoose   = require("mongoose");
const config     = require("../config/config");
const User = require("../models/user");
const path       = require("path");
let mongoUri = process.env.MONGODB_URI || config.db;

mongoose.connect(mongoUri);

// Clear the collection so we don't get duplicates
User.collection.drop();

// Using an array & .create
const users = [
  {
    name: "Caroline Wilson",
    // lat: "51.5254678",
    // lng: "-0.0818591",
    address: "Shoreditch",
    username: "Caroline",
    email: 'caroline@example.com',
    friends:[{
      name: "Elliot Brock",
      // lat: "51.5199128",
      // lng: "-0.0772997",
      address: "Bleecker Street"
    }],
    password: 'password',
    passwordConfirmation: 'password'
  },
  {
    name: "Elliot Brock",
    // lat: "51.5199128",
    // lng: "-0.0772997",
    address: "Bleecker Street",
    username: "Elliot",
    email: 'elliot@example.com',
    friends:[{
      name: "Homer Simpson",
      // lat: "51.5199128",
      // lng: "-0.0772997",
      address: "Springfield"
  }],
    password: 'password',
    passwordConfirmation: 'password'
  },
  {
    name: "Lex Luthor",
    // lat: "51.5199128",
    // lng: "-0.0772997",
    address: "Langridge Mews",
    username: "Elliot",
    email: 'lex@example.com',
    friends:[{
      name: "Adolf Hitler",
      // lat: "51.5199128",
      // lng: "-0.0772997",
      address: "Bellend Drive"
  }],
    password: 'password',
    passwordConfirmation: 'password'
  },
];

users.forEach((user) => {
  User.create(user, (err, user) => {
    if (err) {
      console.log('Populating users failed:', err);
    } else {
      console.log(`${user} was saved.`);
    }
  });
});

mongoose.connection.close();
