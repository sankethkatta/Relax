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
var salt = 'ILikeTw33d';
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
var relaxinfo = {user: "", loggedin: false, errorLogin: false, errorRegister: false, relaxinfo: false}; 

app.get('/', function(req, res){
   var decipher;
   if (req.cookies.relaxinfo) {
      relaxinfo = JSON.parse(decrypt(req.cookies.relaxinfo))
      user = relaxinfo.user 
      db.get("SELECT * FROM login WHERE user LIKE '"+user+"'", function(err, row) {
          if(row) {
            relaxinfo.loggedin = true;
            relaxinfo.user = user;
            res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
            res.render("index.ejs", relaxinfo);
          } else {
            relaxinfo.loggedin = false; 
            res.clearCookie('relaxinfo');
            res.redirect('back');
          }
      });
    } else {
      relaxinfo.loggedin = false;
      relaxinfo.user = "";
      res.render('index.ejs', relaxinfo);
      relaxinfo.errorLogin = false;
      relaxinfo.errorRegister = false;
    }
});

app.post('/journal', function(req, res){
  relaxinfo = JSON.parse(decrypt(req.cookies.relaxinfo))
  var journalEntry = req.body.comment,
    user = relaxinfo.user 
  if(journalEntry === ""){
    relaxinfo.errorJournal = true;
    res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
    res.redirect('back');
  } else {
    db.run("INSERT INTO journal values('"+user+"', DATETIME(), '"+journalEntry+"')");
    res.redirect('/journal');
  }
});

app.get('/journal', function(req,res){
  relaxinfo = JSON.parse(decrypt(req.cookies.relaxinfo))
  var user = relaxinfo.user;
  var rendJournal = {entries: [], times: []};
  db.each("SELECT * FROM journal WHERE user LIKE '"+user+"' ORDER BY time ", function(err, row){
    rendJournal.entries.push(row.journal);
    rendJournal.times.push(row.time);
    
  }, function() {
  res.render('journal.ejs', rendJournal); 
  });
});

app.post('/logout', function(req, res) {
  res.clearCookie('relaxinfo');
  res.redirect('back');
});

app.post('/login', function(req, res){
  var user = req.body.username
  , pass = req.body.password
  , authToken;

  db.get("SELECT * FROM login WHERE user LIKE '"+user+"'", function(err, row) {
    if (!row) {
      relaxinfo.errorLogin = true;
      res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
      res.redirect('back');
    } else {
      epass = encrypt(pass);
      if (row.pass == epass) {
          relaxinfo.user = user;
          relaxinfo.errorLogin = false;
          res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
          res.redirect('back');
      } else {
          relaxinfo.errorLogin = true;
          res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
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
  if(user === "" || pass === ""){
    relaxinfo.errorRegister = true;
    res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
    res.redirect('back');
  }
  else{
    db.get("SELECT user FROM login WHERE user LIKE '"+user+"'", function(err, row) {
      if (!row) {
         epass = encrypt(pass);
         db.run("INSERT INTO login values('"+user+"','"+epass+"')");
        
         relaxinfo.user = encrypt(user);
         relaxinfo.errorRegister = false;
         res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
         res.redirect('back');
     } else {
       relaxinfo.errorRegister = true;
       res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
       res.redirect('back');
     }
    });
  }
});

app.listen(5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
