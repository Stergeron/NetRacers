var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));


var port = process.env.PORT || 8888;

var server = app.listen(port);

var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on("down", function(id){
    io.emit("clientdown", id);
  });
  socket.on("up", function(id){
    io.emit("clientup", id);
  });
});
