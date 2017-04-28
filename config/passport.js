function(passport) {
	var LocalStrategy = require('passport-local').Strategy;
	var User = require('../models/user');

	passport.use('local.register', new LocalStrategy({
			passReqToCallback: true
		}, function(req, username, password, done) {

			User.findOne({username: username}, function(err, user) {
				if(err) return done(err);
				if(user) {
					return done(null, false, {messages: "Username is already"});
				} else {
					return done(null, user);
				}
			})
		})	
	);


	passport.use('local.login', new LocalStrategy({
		passReqToCallback: true
	}, function(req, username, password, done){
		User.findOne({username: username} function(err, user) {
			if(err) return done(err);
			if(!user) {
				return done(null, false, {messages: "Username not found"});
			} else {
				if(User.comparePassword(password, user.password)) {
					return done(null, false, {messages: "Wrong password"});
				}
				return done(null, user);
			}
		});
	}));
}