var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));


var port = process.env.PORT || 8888;

var server = app.listen(port);

var io = require('socket.io')(server);

var lobbies = [];

var players = [];

io.on('connection', function(socket) {
  try {
    var player = {};
    socket.on("joinGame", function(nm, cb) {
      if (players.indexOf(nm) < 0) {
        cb(nm);
        player.name = nm;
        players.push(nm);
      } else {
        cb("REJECT");
      }
    });
    socket.on("joinLobby", function(us) {
      findBy(lobbies, "name", us.lob).members.push(us.player);
      if (lobbies[findForIndex(lobbies, "name", us.lob)].members.length >= 4) {
        lobbies[findForIndex(lobbies, "name", us.lob)].open = false;
      }
      player.lobby = us.lob;
      io.emit("updateLobby", findBy(lobbies, "name", us.lob));
    });
    socket.on("changeMap", function(m) {
      var lob = findBy(lobbies, "name", m.lobby);
      lob.map = m.map;
      io.emit("updateLobby", lob);
    });
    socket.on("leaveLobby", function(lob) {
      leaveLobby(lob);
    });
    socket.on("request", function(nm, cb) {
      cb(lobbies);
    });
    socket.on("createLobby", function(nm) {
      var lobbyname = nm + "'s Lobby";
      if (findBy(lobbies, "name", lobbyname) === undefined) {
        lobbies.push({
          name: lobbyname,
          members: [],
          open: true,
          map: 0
        });
      }
      io.emit("updateLobby", findBy(lobbies, "name", lobbyname));
    });
    socket.on('disconnect', function() {
      if (player.lobby !== undefined) {
        leaveLobby({
          name: player.lobby,
          player: player.name
        });
      }
      if (player.name !== undefined) {
        players.splice(players.indexOf(player.name), 1);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

var leaveLobby = function(lob) {
  console.log(lob);
  var index = findForIndex(lobbies, "name", lob.name);
  lobbies[index].members.splice(lobbies[index].members.indexOf(lob.player), 1);
  if (!lobbies[index].open) lobbies[index].open = true;
  if (lobbies[index].members.length < 1) {
    lobbies.splice(index, 1);
    io.emit("removeLobby", lob.name);
  } else {
    io.emit("updateLobby", findBy(lobbies, "name", lob.name));
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
