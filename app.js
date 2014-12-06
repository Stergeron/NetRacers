var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));


var port = process.env.PORT || 8888;

var server = app.listen(port);

var io = require('socket.io')(server);

var lobbies = [{
  name: "poo",
  members: ["john", "jim"],
  open: true
}, {
  name: "noo",
  members: ["nothn"],
  open: true
}];

var players = [];

io.on('connection', function(socket) {
  var player;
  var lobby;
  socket.on("joinGame", function(nm, cb){
    if(players.indexOf(nm) < 0){
      cb(nm);
      player = nm;
    }
    else {
      cb("REJECT");
    }
  });
  socket.on("joinLobby", function(us) {
    lobbies[findForIndex(lobbies, "name", us.lob)].members.push(us.player);
    if (lobbies[findForIndex(lobbies, "name", us.lob)].members.length >= 4) {
      lobbies[findForIndex(lobbies, "name", us.lob)].open = false;
    }
    player.lobby = us.lob;
    io.emit("updateLobby", findBy(lobbies, "name", us.lob));
  });
  socket.on("leaveLobby", function(lob) {
    leaveLobby(lob);
  });
  socket.on("request", function(nm, cb) {
    cb(lobbies);
  });
  socket.on('disconnect', function () {
    if(lobby !== undefined){
      leaveLobby({name: lobby, player: player});
    }
    if(player !== undefined){
      players.splice(players.indexOf(player), 1);
    }
  });
});

var leaveLobby = function(lob) {
  var index = findForIndex(lobbies, "name", lob.name);
  lobbies[index].members.splice(lobbies[index].members.indexOf(lob.player), 1);
  if (findBy(lobbies, "name", lob.name).members.length < 1) {
    lobbies.splice(findForIndex(lobbies, "name", lob.name), 1);
    io.emit("removeLobby", lob.name);
  }
};

var findBy = function(arr, identifier, name) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][identifier] == name) {
      return arr[i];
    }
  }
};

var findForIndex = function(arr, identifier, name) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][identifier] == name) {
      return i;
    }
  }
};
