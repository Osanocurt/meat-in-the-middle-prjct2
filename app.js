const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const expressJWT = require("express-jwt");

const apiRouter = require ('./config/apiRoutes');
const webRouter = require ('./config/webRoutes');

const app = express();

let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/global';

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(mongoUri);

app.use(express.static(`${__dirname}/public`));

app.use('/api', apiRouter);
app.use('/', webRouter);

app.listen(port, () => { console.log("Express is running on port: " + port); });
