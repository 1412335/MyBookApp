var express = require('express');
var session = require('express-session');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressValidator = require('express-validator');
var cors = require('cors');

var usersRoute = require('./routes/users');
var catsRoute = require('./routes/categories');
var booksRoute = require('./routes/books');
var checkOutRoute = require('./routes/checkout');
var ordersRoute = require('./routes/orders');
var commentsRoute = require('./routes/comments');

var config = require('./config/database');
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

var app = express();

//important
app.use(cors());

app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'client')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressValidator());

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport-jwt')(passport);

app.get('/', function(req, res, next) {
	res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.use('/users', usersRoute);
app.use('/cats', catsRoute);
app.use('/books', booksRoute);
app.use('/checkout', checkOutRoute);
app.use('/orders', ordersRoute);
app.use('/comments', commentsRoute);

app.listen(3000);