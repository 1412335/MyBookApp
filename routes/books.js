var express = require('express');
var router = express.Router();

var async = require('async');

var config = require('../config/database');
var Book = require('../models/book');
var JsonMsg = require('../models/jsonmsg');
var Category = require('../models/category');

router.get('/list/:page', function(req, res, next) {
	var page = parseInt(req.params.page) || 1;

	async.parallel([
		function(callback) {
			Book.count(callback);
		},
		function(callback) {
			Book.find({})
				.skip((page - 1) * config.maxItemPerPage)
				.limit(config.maxItemPerPage)
				.exec(callback);
		}
	], function(err, results) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			console.log(results);
			var count = results[0];
			var books = results[1];
			var nPages = Math.ceil(count / config.maxItemPerPage);
			var messages = {
				nPages: nPages,
				books: books
			};
			 
			res.json(new JsonMsg(true, messages));
		}
	});

});

router.get('/detail/:id', function(req, res, next) {
	var id = req.params.id;
	Book.findOne({_id: id}, function(err, book) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(book) {
			res.json(new JsonMsg(true, book));
		} else {
			res.json(new JsonMsg(false, "Book not found"));
		}
	});
});

router.get('/cat/:catId', function(req, res, next) {
	var catId = req.params.catId;
	var page = req.params.page || 1;
	async.parallel([
		function(callback) {
			Book.count({category: catId}, callback);
		},
		function(callback) {
			Book.find({category: catId})
				.skip((page - 1) * config.maxItemPerPage)
				.limit(config.maxItemPerPage)
				.exec(callback);
		}
	], function(err, results) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else {
			console.log(results);
			var count = results[0];
			var books = results[1];
			var nPages = Math.ceil(count / config.maxItemPerPage);
			var messages = {
				nPages: nPages,
				books: books
			};
			 
			res.json(new JsonMsg(true, messages));
		}
	});
});

router.post('/add', function(req, res, next) {
	var title = req.body.title;
	var des = req.body.des;
	var author = req.body.author;
	var publisher = req.body.publisher;
	var price = req.body.price;
	var image = req.body.image;
	var rating = req.body.rating;
	var category = req.body.category;

	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('des', 'Description is required').notEmpty();
	req.checkBody('price', 'Price is invalid').isFloat();
	req.checkBody('author', 'Author is required').notEmpty();
	req.checkBody('category', 'Category is invalid').notEmpty();

	var errors = req.validationErrors();

	if(errors) {
		var errArray = [];
		errors.forEach(function(error) {
			errArray.push(error.msg);
		});
		return res.json(new JsonMsg(false, errArray));
	}

	var newBook = new Book({
		title: title,
		des: des,
		author: author,
		publisher: publisher,
		price: price,
		rating: rating,
		image: image,
		category: category
	});

	Book.findOne({title: title, author: author, publisher: publisher}, function(err, book){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(book) {
			res.json(new JsonMsg(false, [ "This book is added" ]));
		} else {
			newBook.save(function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					Category.findOne({_id: category}, function(err, cat) {
						if(err) {
							res.json(new JsonMsg(false, err));
						} else {
							var newCat = {
								nbooks: ++cat.nbooks
							};
							console.log(newCat);
							Category.update({_id: category}, newCat, {}, function(err, result) {
								
							});	
						}
					});
					res.status(200).json(new JsonMsg(true, "Add book successfully"));
				}
			});	
		}
	});
});

router.put('/update/:id', function(req, res, next) {
	var id = req.params.id;
	Book.findOne({_id: id}, function(err, book) {
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(book) {
			var title = req.body.title;
			var des = req.body.des;
			var author = req.body.author;
			var publisher = req.body.publisher;
			var price = req.body.price;
			var image = req.body.image;
			var rating = req.body.rating;
			var cat = req.body.category;

			var updateBook = new Book({
				title: title,
				des: des,
				author: author,
				publisher: publisher,
				price: price,
				rating: rating,
				image: image,
				category: cat
			});

			Book.update({_id: id}, updateBook, {}, function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					res.json(new JsonMsg(true, result));
				}
			});	

		} else {
			res.json(new JsonMsg(false, "Book not found"));
		}
	});
});

router.delete('/delete/:id', function(req, res, next) {
	var id = req.params.id;
	Book.findOne({_id: id}, function(err, book){
		if(err) {
			res.json(new JsonMsg(false, err));
		} else if(!book) {
			res.json(new JsonMsg(false, "Book not found"));
		} else {
			var catId = book.category;
			Book.remove({_id: id}, function(err, result) {
				if(err) {
					res.json(new JsonMsg(false, err));
				} else {
					Category.findOne({_id: catId}, function(err, cat) {
						if(err) {
							res.json(new JsonMsg(false, err));
						} else {
							var newnBooks = cat.nbooks - 1;
							var newCat = {
								nbooks: newnBooks
							};
							console.log(newCat);
							Category.update({_id: catId}, newCat, {}, function(err, result) {
								
							});	
						}
					});
					res.json(new JsonMsg(true, result));
				}
			});
		}
	});
});

module.exports = router;