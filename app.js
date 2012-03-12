
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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



app.listen(1995);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
