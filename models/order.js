var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	cart: { type: Object, required: true },
	name: { type: String, required: true },
	address: { type: String, required: true },
	paymentId: { type: String, required: true },
	time: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Order', orderSchema);

/*
function dateFormat (date, fstr, utc) {
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}
/* dateFormat (new Date (), "%Y-%m-%d %H:%M:%S", true) returns 
   "2012-05-18 05:37:21"  */
