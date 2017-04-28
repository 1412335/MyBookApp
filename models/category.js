var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var catSchema = new Schema({
	name: { type: String, required: true },
	des: { type: String, required: true },
	nbooks: { type: Number, default: 0 } 
});

module.exports = mongoose.model('Category', catSchema);