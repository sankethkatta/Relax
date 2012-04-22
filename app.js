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
	app.set('view engine', 'ejs');
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

// Crypto Cipher Helpers

encipher = function(text) {
    var cipher,
        epass;
    cipher = crypto.createCipher('aes192', 'hfZ9GddagMbGANXtwfsJtrjCEMGDcj');
    epass = cipher.update(text+'ILikeTw33d', 'binary', 'hex') + cipher.final('hex');

    return epass;
};

//app.get('/', routes.index);
app.get('/', function(req, res){
    var decipher,
    user;

   if (req.cookies.loggedin) {
        decipher = crypto.createDecipher('aes192', 'authtokensareawesome');
        user = decipher.update(req.cookies.loggedin, 'hex', 'binary') + decipher.final('binary');
        user = user.replace(/saltyToken/g,"");
        
        res.render("index.ejs", {user: "back " + user, loggedin: true});
    } else{
        res.render('index.ejs', {user: "", loggedin: false});
    }
});

app.post('/journal', function(req, res){
	console.log(req.body.comment);
	res.redirect('back');
});

app.post('/login', function(req, res){
	var user = req.body.username
	,pass = req.body.password+'ILikeTw33d';
	console.log(user+"|"+pass);
});

app.post('/registerLogin', function(req,res){
	var user = req.body.username.replace(/ /g,'')
	, pass = req.body.password
	, cipher 
	, epass
    , authToken;

	db.get("SELECT user FROM login WHERE user LIKE '"+user+"'", function(err, row) {
		if (!row) {
			cipher = crypto.createCipher('aes192', 'hfZ9GddagMbGANXtwfsJtrjCEMGDcj');
			epass = cipher.update(pass+'ILikeTw33d', 'binary', 'hex') + cipher.final('hex');

			db.run("INSERT INTO login values('"+user+"','"+epass+"')");
		}
	});
    
    console.log(user+" | "+pass);

    cipher = crypto.createCipher('aes192', 'authtokensareawesome');
    authToken = cipher.update(user+'saltyToken', 'binary', 'hex') + cipher.final('hex');
    res.cookie('loggedin',authToken, {maxAge: 90000});
    res.redirect('back');
});

app.listen(1995);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
