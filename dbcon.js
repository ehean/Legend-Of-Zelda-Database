var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit : 10,
	host		: 'classmysql.engr.oregonstate.edu',
	user		: 'cs340_heaneye',
	password	: '0340',
	database	: 'cs340_heaneye'
});


module.exports.pool = pool;
