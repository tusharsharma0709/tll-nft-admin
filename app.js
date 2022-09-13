const Uone = require('./uone.js');

const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const expressPino = require('express-pino-logger');
const cors = require('cors');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport");
const routes = require('./routes');

//passport config:
require('./config/passport')(passport);

const logger = Uone.logger;
var path = require('path');
const app = express();
const expressValidator = require('express-validator');

const expressLogger = expressPino({ logger });

const APP_PORT = process.env.APP_PORT || 8080;

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PATCH']
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public folder
//app.use(express.static('./public'));
app.use(express.static(path.join(__dirname, 'public')));
console.log(express.static('./public'));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.disable('x-powered-by').use(helmet()).use(expressLogger).use(bodyParser.urlencoded({ extended: true })).use(bodyParser.json({ limit: '5mb' })).use(cors(corsOptions)).use('/', routes);

const mintRoutes = require("./routes/mintRoutes");
app.use('/mint', mintRoutes);
const lazymintRoutes = require("./routes/lazymintRoutes");
app.use('/lazymint', lazymintRoutes);
const appRoutes = require("./routes/approvalRoutes");
app.use('/approval', appRoutes);

app.get('/', (req, res) => res.status(200).send({
  message: 'Tll Backend.'
}));

app.listen(APP_PORT, function () {
  console.log('tll Backend server is running on port %d.', APP_PORT);
});
module.exports = app;