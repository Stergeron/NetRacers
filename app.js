var express = require('express');
var app = express();
var io = require('socket.io').listen(server);

io.sockets.on("connection", function(socket){

});

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});
var port = process.env.PORT || 8888;

var server = app.listen(port);
