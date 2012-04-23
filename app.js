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
    decrypText = decrypText.replace(salt,"");
    return decrypText;
};
//app.get('/', routes.index);

// Render Object
var rend = {user: "", loggedin: false, errorLogin: false, errorRegister: false}; 

app.get('/', function(req, res){
   var decipher;

   if (req.cookies.loggedin) {
      user = decrypt(req.cookies.loggedin);
      db.get("SELECT * FROM login WHERE user LIKE '"+user+"'", function(err, row) {
          if(row) {
            rend.loggedin = true;
            rend.user = user;
            res.render("index.ejs", rend);
          } else {
            rend.loggedin = false; 
            res.clearCookie('loggedin');
            res.redirect('back');
          }
      });
    } else {
      rend.loggedin = false;
      res.render('index.ejs', rend);
      rend.errorLogin = false;
      rend.errorRegister = false;
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
  , pass = req.body.password
  , authToken;

  db.get("SELECT * FROM login WHERE user LIKE '"+user+"'", function(err, row) {
    if (!row) {
      rend.errorLogin = true;
      res.redirect('back');
    } else {
      epass = encrypt(pass);
      if (row.pass == epass) {
          authToken = encrypt(user);
          res.cookie('loggedin', authToken, {maxAge: 604800000});
          rend.errorLogin = false;
          res.redirect('back');
      } else {
          rend.errorLogin = true;
          res.redirect('back');
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
        
        authToken = encrypt(user);
        rend.errorRegister = false;
        res.cookie('loggedin',authToken, {maxAge: 604800000});
        res.redirect('back');
    } else {
      rend.errorRegister = true;
      res.redirect('back');
    }
  });
    

});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
