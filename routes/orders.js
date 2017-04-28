var express = require('express');
var router = express.Router();
var JsonMsg = require('../models/jsonmsg');
var Order = require('../models/order');

router.post('/save', function(req, res, next) {
	var user = req.body.user;
	var cart = req.body.cart;
	var name = req.body.name;
	var address = req.body.address;
	var paymentId = req.body.paymentId;

	var newOrder = new Order({
		user: user,
		cart: cart,
		name: name,
		address: address,
		paymentId: paymentId
	});

	newOrder.save(function(err, result) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(result.n == 1) {
			res.json(new JsonMsg(true, 'Save order successfully'));
		}
	}); 

});

router.get('/user/:id', function(req, res, next) {
	var userId = req.params.id;
	Order.find({user: userId}, function(err, orders) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(!orders) {
			res.json(new JsonMsg(false, 'No User\'s Order Found'));
		} else {
			res.json(new JsonMsg(true, orders));
		}
	});
});

router.get('/list', function(req, res, next) {
	Order.find(function(err, orders) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(!orders) {
			res.json(new JsonMsg(false, 'No Orders Found'));
		} else {
			res.json(new JsonMsg(true, orders));
		}
	});
});

module.exports = router;