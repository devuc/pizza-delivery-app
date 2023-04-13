require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const MongoDbStore = require('connect-mongo')(session);
const connection = mongoose.connection;
const Emitter = require('events');
mongoose.set('strictQuery', true);
const url = process.env.MONGO_DB_URL;

mongoose.connect(url);

connection.once('open', () => {}).on('error', err => {});

let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  connection: 'session',
});

const eventEmitter = new Emitter();

app.set('eventEmitter', eventEmitter);

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.json());
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.static('.'));
const PORT = process.env.PORT || 9000;

app.use(expressLayout);
app.set('views', './resources/views');
app.set('view engine', 'ejs');
require('./routes/web')(app);

app.use((req, res) => {
  res.status(404).send('<h1>404 Page Not Found<h1>');
});

const server = app.listen(PORT, () => {});

const io = require('socket.io')(server);
io.on('connection', socket => {
  socket.on('join', orderId => {
    socket.join(orderId);
  });
});

eventEmitter.on('orderUpdated', data => {
  let dataOrderId = JSON.stringify(data.id.orderId);
  io.to(`order_${dataOrderId}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', data => {
  io.to('adminRoom').emit('orderPlaced', data);
});
eventEmitter.on('paymentCancelled', () => {
  io.once('connection', socket => {
    socket.emit('paymentCancelled');
  });
});
module.exports = io;
