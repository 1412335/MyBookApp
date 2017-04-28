var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage }).single('avatar');

var User = require('../models/user');
var JsonMsg = require('../models/jsonmsg');
var config = require('../config/database');
var passport = require('passport');

var jwt = require('jsonwebtoken');

router.get('/list', function(req, res, next) {
	User.find(function(err, users){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			res.status(200).json(new JsonMsg(true, users));			
		}
	});
});

router.post('/register', function(req, res, next) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password; 

	req.checkBody('username', 'Username is invalid').isLength({min: 5});
	req.checkBody('email', 'Email is invalid').isEmail();
	req.checkBody('password', 'Password is invalid').isLength({min: 5});

	var errors = req.validationErrors();

	if(errors) {
		var errArray = [];
		errors.forEach(function(error) {
			errArray.push(error.msg);
		});
		return res.json(new JsonMsg(false, errArray));
	}

	var newUser = new User({
		username: username,
		email: email,
		password: User.encryptPassword(password)
	});

	User.findOne({username: username}, function(err, user){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(user) {
			res.json(new JsonMsg(false, [ "Username is already" ]));
		} else {
			newUser.save(function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					var token = jwt.sign(result, config.secret, { expiresIn: 3600 });
					res.status(200).json({
						success: true, 
						messages: result,
						token: 'JWT ' + token
					});
				}
			});	
		}
	});

});

router.post('/login', function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;

	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors();
	if(errors){ 
		var errArray = [];
		errors.forEach(function(error) {
			errArray.push(error.msg);
		});
		return res.json(new JsonMsg(false, errArray));
	}
	User.findOne({username: username}, function(err, user){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(!user) {
			res.json(new JsonMsg(false, [ "User not found" ]));
		} else if(!User.comparePassword(password, user.password)) {
			res.json(new JsonMsg(false, [ "Wrong password" ]));
		} else {
			var token = jwt.sign(user, config.secret, { expiresIn: 3600 });
			res.status(200).json({
				success: true, 
				messages: user,
				token: 'JWT ' + token
			});
		}
	});
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
	successRedirect: '/profile',
	failureRedirect: '/'
}));

router.get('/profile/:id', passport.authenticate('jwt', {session: false}), function(req, res, next) {
	var id = req.params.id;
	User.findOne({_id: id}, function(err, user){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(user) {
			var msg = {username: user.username, email: user.email};
			res.status(200).json(new JsonMsg(true, user));
		} else {
			res.json(new JsonMsg(false, "User not found"));
		}
	});
});

router.post('/update/avatar/:id', passport.authenticate('jwt', {session: false}), function(req, res, next) {
	var id = req.params.id;
	upload(req, res, function(err) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			User.findByIdAndUpdate(id, { avatar: req.file.filename }, function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					res.json(new JsonMsg(true, result));
				}
			});
		}
	});
});

router.get('/avatar/:id', function(req, res, next) {
	var id = req.params.id;
	User.findById(id, function(err, user) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			res.json(new JsonMsg(true, user.avatar));
		}
	});
});

router.put('/update/profile/:id', passport.authenticate('jwt', {session: false}), function(req, res, next) {
	var id = req.params.id;
	var update = {};
	if(req.body.username) {
		update.username = req.body.username;
	}
	if(req.body.email) {
		update.email = req.body.email;
	}
	if(req.body.password) {
		console.log('p');
		update.password = req.body.password;
	}
	User.findByIdAndUpdate(id, update, function(err, user) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			res.json(new JsonMsg(true, user));
		}
	});
});

module.exports = router;