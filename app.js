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
var salt = 'ILikeTw33d'
encrypt = function(input) {
    var cipher,
        encrypInput;
    cipher = crypto.createCipher('aes192', 'hfZ9GddagMbGANXtwfsJtrjCEMGDcj');
    encrypInput = cipher.update(input+salt, 'binary', 'hex') + cipher.final('hex');

    return encrypInput;
};

decrypt = function(input) {
    var decipher,
      decrypText;
    decipher = crypto.createDecipher('aes192', 'hfZ9GddagMbGANXtwfsJtrjCEMGDcj');
    decrypText = decipher.update(input, 'hex', 'binary') + decipher.final('binary');
    decrypText = decrypText.replace(/salt/g,"");

    return decrypText;
};
//app.get('/', routes.index);
app.get('/', function(req, res){
    var decipher,
    user;

   if (req.cookies.loggedin) {
      decipher = decrypt(req.cookies.loggedin);
      res.render("index.ejs", {user: "Welcome back " + user, loggedin: true});
    } else{
      res.render('index.ejs', {user: "", loggedin: false});
    }
});

app.post('/journal', function(req, res){
  console.log(req.body.comment);
  res.redirect('back');
});

app.post('/logout', function(req, res) {
  res.clearCookie('loggedin');
  res.redirect('back');
});

app.post('/login', function(req, res){
  var user = req.body.username
  ,pass = req.body.password;
  console.log(user+"|"+pass);

  db.get("SELECT * FROM login WHERE user LIKE '"+user+"'", function(err, row) {
    if (!row) {
      res.send("USER NOT FOUND");
    } else {
      epass = encrypt(pass);
      if (row.pass == epass) {
          res.cookie('loggedin',authToken, {maxAge: 90000});
          redirect('back');
      } else {
          res.send("PASSWORD INCORRECT");
      }
    }
  });
});

app.post('/registerLogin', function(req,res){
  var user = req.body.username.replace(/ /g,'')
    , pass = req.body.password
    , epass
    , authToken;

  db.get("SELECT user FROM login WHERE user LIKE '"+user+"'", function(err, row) {
    if (!row) {
            epass = encrypt(pass);
      db.run("INSERT INTO login values('"+user+"','"+epass+"')");
    }
  });
    
    console.log(user+" | "+pass);

    authToken = encrypt(user);
    res.cookie('loggedin',authToken, {maxAge: 90000});
    res.redirect('back');
});

app.listen(1995);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
