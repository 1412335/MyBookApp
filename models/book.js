var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
	title: { type: String, required: true },
	des: { type: String, required: true },
	author: { type: String, required: true },
	publisher: { type: String, required: false },
	price: { type: Number, required: true },
	rating: { type: String, required: false },
	image: { type: String, required: false },
	category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Book', bookSchema);