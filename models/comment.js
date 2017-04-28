var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 200
    }, 
    time: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Comment', commentSchema);