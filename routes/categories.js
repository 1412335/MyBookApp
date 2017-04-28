var express = require('express');
var router = express.Router();

var Category = require('../models/category');
var JsonMsg = require('../models/jsonmsg');
var Book = require('../models/book');

router.get('/list', function(req, res, next) {
	Category.find(function(err, categories){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			res.json(new JsonMsg(true, categories));
		}
	});
});

router.get('/:id', function(req, res, next) {
	var id = req.params.id;
	Book.find({category: id}, function(err, books) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			res.json(new JsonMsg(true, books.length));
		}
	});
});

router.post('/add', function(req, res, next) {
	var name = req.body.name;
	var des = req.body.des;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('des', 'Description is required').notEmpty();

	var errors = req.validationErrors();
	if(errors) {
		var errArray = [];
		errors.forEach(function(error) {
			errArray.push(error.msg);
		});
		return res.json(new JsonMsg(false, errArray));
	}

	var newCat = new Category({
		name: name,
		des: des
	});

	Category.findOne({name: name}, function(err, category){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(category) {
			res.json(new JsonMsg(false, [ "This category is added" ]));
		} else {
			newCat.save(function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					res.status(200).json(new JsonMsg(true, "Add category successfully"));
				}
			});	
		}
	});
});

module.exports = router;