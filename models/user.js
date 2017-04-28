var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	create: {
		type: Date,
		default: new Date()
	},
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		default: 'https://ssl.gstatic.com/accounts/ui/avatar_2x.png'
	}
});

module.exports = mongoose.model('User', userSchema);

module.exports.encryptPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

module.exports.comparePassword = function(candidatePass, hash) {
	return bcrypt.compareSync(candidatePass, hash);
}