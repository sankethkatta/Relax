/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, crypto = require('crypto')
, pg = require('pg')

var app = module.exports = express.createServer();

// Postgres Connection
var conString = "postgres://postgres:SqlSonic@localhost:5432/postgres";
var client = new pg.Client(conString);
//client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
client.connect();
    

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
      var query = client.query("SELECT * FROM login WHERE username LIKE '"+user+"'", function(err, result) {
          if(result.rows[0]) {
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
    var query = client.query("INSERT INTO journal values('"+user+"', CURRENT_TIMESTAMP, '"+journalEntry+"')");
    res.redirect('/journal');
  }
});

app.get('/journal', function(req,res){
  relaxinfo = JSON.parse(decrypt(req.cookies.relaxinfo))
  var user = relaxinfo.user;
  var rendJournal = {entries: [], times: []};
  var query = client.query("SELECT * FROM journal WHERE username LIKE '"+user+"' ORDER BY entrytime ", function(err, result) {
    for (i = 0; i < result.rows.length; i++) {
      rendJournal.entries.push(result.rows[i].entry);
      rendJournal.times.push(result.rows[i].entrytime);
    }
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

  client.query("SELECT * FROM login WHERE username LIKE '"+user+"'", function(err, result) {
    if (!result.rows[0]) {
      relaxinfo.errorLogin = true;
      res.cookie('relaxinfo', encrypt(JSON.stringify(relaxinfo)), {maxAge: 604800000});
      res.redirect('back');
    } else {
      epass = encrypt(pass);
      if (result.rows[0].password === epass) {
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
    var query = client.query("SELECT username FROM login WHERE username LIKE '"+user+"'", function(err, result) {
      if (!result.rows[0]) {
         epass = encrypt(pass);
         client.query("INSERT INTO login values('"+user+"','"+epass+"')");
        
         relaxinfo.user = user;
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
