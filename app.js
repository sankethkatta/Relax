/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, crypto = require('crypto')
, sqlite3 = require('sqlite3').verbose();

var app = module.exports = express.createServer();
db = new sqlite3.Database('test');

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());  
	app.use(express.session({ secret: 'your secret here', logged: false, username:'' }));        
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});


app.set("view options", {layout: false});
app.register('.html', {
	"compile": function(str,options){
	return function(locals) {return str; };
	}
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// Routes
app.use(express.bodyParser());
app.get('/', routes.index);

app.post('/journal', function(req, res){
	console.log(req.body.comment);
	res.redirect('back');
});

app.post('/login', function(req, res){
	console.log(req.body.username);
	console.log(req.body.password);
	if (req.session.logged) res.send('Welcome back!');
	else {


	}
});

app.post('/createLogin', function(req,res){
	var user = req.body.username
	, pass = req.body.password
	, c 
	, epass;

	c = crypto.createCipher('aes192', 'hfZ9GddagMbGANXtwfsJtrjCEMGDcj');
	epass = c.update(pass, 'binary', 'hex') + c.final('hex');


	db.each('INSERT INTO login values('+user+','+epass+')'), function(err, row) {
		console.log(row);
	};
});

app.listen(1995);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
