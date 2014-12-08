var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));


var port = process.env.PORT || 8888;

var server = app.listen(port);

var io = require('socket.io')(server);

var lobbies = [];

var players = [];

var matches = [];

var rejectednames = [""];

io.on('connection', function(socket) {
  try {
    var player = {};
    socket.on("joinGame", function(nm, cb) {
      if (findForIndex(players, "name", nm) === undefined && rejectednames.indexOf(nm) < 0 && nm.length < 18) {
        cb(nm);
        player.name = nm;
        player.id = socket.id;
        players.push(player);
      } else {
        cb("REJECT");
      }
    });
    socket.on("joinLobby", function(us) {
      if (us.player == player.name) {
        findBy(lobbies, "name", us.lob).members.push(us.player);
        if (lobbies[findForIndex(lobbies, "name", us.lob)].members.length >= 4) {
          lobbies[findForIndex(lobbies, "name", us.lob)].open = false;
        }
        player.lobby = us.lob;
        io.emit("updateLobby", findBy(lobbies, "name", us.lob));
      }
    });
    /*socket.on("changeMap", function(m) {
      var lob = findBy(lobbies, "name", m.lobby);
      lob.map = m.map;
      io.emit("updateLobby", lob);
    });*/
    socket.on("leaveLobby", function(lob) {
      if (player.name == lob.player) {
        leaveLobby(lob);
      }
    });
    socket.on("request", function(nm, cb) {
      cb(lobbies);
    });
    socket.on("createLobby", function(nm) {
      if (nm == player.name && lobbies.length <= 25) {
        var lobbyname = nm + "'s Lobby";
        if (findBy(lobbies, "name", lobbyname) === undefined) {
          lobbies.push({
            name: lobbyname,
            members: [],
            open: true,
            map: 0,
            countdown: 90
          });
        }
        io.emit("updateLobby", findBy(lobbies, "name", lobbyname));
      }
    });
    socket.on("startGame", function(l) {
      if (player.name == l.player) {
        startGame(l.name);
      }
    });
    socket.on("leaveGame", function(){
      if (player.name !== undefined) {
        players.splice(findForIndex(players, "name", player.name), 1);
        if(player.lobby !== undefined){
          if(findBy(matches, "name", player.lobby) !== undefined){
            matches.splice(findForIndex(matches, "name", player.lobby), 1);
          }
        }
      }
    });
    socket.on("packet", function(dat) {
      io.emit("packet", dat);
    });
    socket.on('disconnect', function() {
      if (player.lobby !== undefined) {
        leaveLobby({
          name: player.lobby,
          player: player.name
        });
      }
      if (player.name !== undefined) {
        players.splice(findForIndex(players, "name", player.name), 1);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

var match = io
  .of('/match')
  .on('connection', function(socket) {
    var player = {};
    socket.on("authenticate", function(auth, fn) {
      {
        var cMatch = findBy(matches, "name", auth.match);
        fn("yes");
        cMatch.joined++;
        if (cMatch.joined == cMatch.members.length) {
          match.emit("begin", {
            name: auth.match,
            map: cMatch.map,
            members: cMatch.members
          });
        }
      }
    });
    socket.on("keychange", function(k){
      match.emit("keychange", k);
    });
  });

setInterval(function() {
  for (var i = 0; i < lobbies.length; i++) {
    if (lobbies[i].countdown === 0) {
      startGame(lobbies[i].name);
      lobbies[i].countdown--;
    } else if (lobbies[i].countdown < 0);
    else {
      lobbies[i].countdown--;
      if (lobbies[i].countdown > 0) {
        io.emit("updateLobby", lobbies[i]);
      }
    }
  }
}, 1000);

var leaveLobby = function(lob) {
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

var startGame = function(name) {
  io.emit("startGame", name);
  var lob = findBy(lobbies, "name", name);
  lob.open = false;
  matches.push(JSON.parse(JSON.stringify({
    name: name,
    members: lob.members,
    map: lob.map,
    joined: 0
  })));
  lob.countdown = -1;
  io.emit("updateLobby", findBy(lobbies, "name", name));
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
