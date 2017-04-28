var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var config = require('./database');
var User = require('../models/user');

module.exports = function(passport) {
	var opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = config.secret;
	passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
		console.log(jwt_payload);
	    User.findOne({id: jwt_payload.sub}, function(err, user) {
	        if (err) {
	            return done(err, false);
	        }
	        if (user) {
	            done(null, user);
	        } else {
	            done(null, false);
	        }
	    });
	}));
}