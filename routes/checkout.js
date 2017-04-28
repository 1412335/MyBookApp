var express = require('express');
var router = express.Router();
var stripe = require('stripe');
var passport = require('passport');
var JsonMsg = require('../models/jsonmsg');

router.post('/validate', function(req, res, next) {
	var cardNumber = req.body.cardNumber;
	var expiryMonth = req.body.expiryMonth;
	var expiryYear = req.body.expiryYear;
	var cardCvc = req.body.cardCvc;

	req.checkBody('cardNumber', 'Card number is invalid').notEmpty();
	req.checkBody('expiryMonth', 'Expiration month is invalid').isInt();
	req.checkBody('expiryYear', 'Expiration year is invalid').isInt();
	req.checkBody('cardCvc', 'Card CVC is invalid').isInt();

	var errors = req.validationErrors();

	if(errors) {
		var errArray = [];
		errors.forEach(function(error) {
			errArray.push(error.msg);
		});
		return res.json(new JsonMsg(false, errArray));
	}

});

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
	var amount = req.body.amount;
	var currency = req.body.currency;
	var source = req.body.source;
	var description = req.body.description;
	
	var stripe = require("stripe")(
	  "sk_test_ObeAstdujNuK7CRvRHuDAVan"
	);
	//console.log(amount);
	stripe.charges.create({
	  amount: amount * 100,
	  currency: currency,
	  source: source, // obtained with Stripe.js
	  description: description
	}, function(err, charge) {
	  if(err) {
	  	return res.json(new JsonMsg(false, err));
	  } else {
	  	if(charge.failure_code != null) {
	  		return res.json(new JsonMsg(false, 'Charge failed'));
	  	} else {
	  		return res.json(new JsonMsg(true, charge));
	  	}
	  }
	});
});

module.exports = router;