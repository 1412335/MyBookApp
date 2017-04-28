var express = require('express');
var router = express.Router();

var async = require('async');

var config = require('../config/database');
var Comment = require('../models/comment');
var User = require('../models/user');
var JsonMsg = require('../models/jsonmsg');

router.get('/list/book/:book/:page', function(req, res, next) {
    var bookId = req.params.book;
    var page = req.params.page || 1;

    async.parallel([
        function(callback) {
            Comment.count({ 'book': bookId }, callback);
        },
        function(callback) {
            Comment.find({ 'book': bookId })
                    .skip((page - 1) * config.maxCommentPerPage)
                    .limit(config.maxCommentPerPage)
                    .sort({time: -1})
                    .populate('user')
                    .exec(callback);
        }
    ], function(err, results) {
        if(err) {
            res.json(new JsonMsg(false, err));
        } else {
            var nComments = results[0];
            var comments = results[1];
            var nPages = Math.ceil(nComments / config.maxCommentPerPage);
			var messages = {
				nPages: nPages,
				comments: comments
			};
			res.json(new JsonMsg(true, messages));
        }
    });
});

router.get('/list/user/:user/:page', function(req, res, next) {
    var userId = req.params.user;
    var page = req.params.page || 1;

    async.parallel([
        function() {
            Comment.count({ 'user': userId }, callback);
        },
        function() {
            Comment.find({ 'user': userId })
                    .skip((page - 1) * config.maxCommentPerPage)
                    .limit(config.maxCommentPerPage)
                    .sort({time: -1})
                    .populate('book')
                    .exec(callback);
        }
    ], function(err, results) {
        if(err) {
            res.json(new JsonMsg(false, err));
        } else {
            var nComments = results[0];
            var comments = results[1];
            var nPages = Math.ceil(nComments / config.maxCommentPerPage);
			var messages = {
				nPages: nPages,
				comments: comments
			};
			res.json(new JsonMsg(true, messages));
        }
    });
});

router.post('/add', function(req, res, next) {
    var user = req.body.user;
    var book = req.body.book;
    var content = req.body.content;

    req.checkBody('user', 'User is required').notEmpty();
    req.checkBody('book', 'Book is required').notEmpty();
    req.checkBody('content', 'Content is 200 characters max').isLength({max: 200});

    var errors = req.validationErrors();
    if(errors) {
        var msg = [];
        errors.forEach(function(error) {
            msg.push(error.msg);
        });
        res.json(new JsonMsg(false, msg));
    } else {
        var newComment = new Comment({
            user: user,
            book: book,
            content: content
        });
        newComment.save(function(err, result) {
            if(err) {
                res.json(new JsonMsg(false, err));
            } else {
                newComment.populate('user', function(err, result) {
                    res.status(200).json(new JsonMsg(true, result));
                });
            }
        });
    }
});

router.delete('/delete/:id', function(req, res, next) {
    var id = req.params.id;
    Comment.findByIdAndRemove(id, function(err, comment) {
        if(err) {
            res.json(new JsonMsg(false, err));
        } else if(!comment) {
            res.json(new JsonMsg(false, 'Comment not found'));
        } else {
            res.status(200).json(new JsonMsg(true, 'Comment delete successfully'));
        }
    });
});

module.exports = router;