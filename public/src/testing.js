(function() {
  var app = angular.module("matchmaking", []);

  app.controller("Player", function(g, socket) {
    this.l = g.context;
    var l = g.context;
    this.joinLobby = function(lob) {
      this.l.currentLobby = findBy(this.l.lobbies, "name", lob);
      socket.emit("joinLobby", {
        player: this.l.playerName,
        lob: lob
      });
      this.l.view = "lobby";
    };
    socket.on("updateLobby", function(lob) {
      if (findBy(l.lobbies, "name", lob.name) !== undefined) {
        l.lobbies[findForIndex(l.lobbies, "name", lob.name)] = lob;
      } else {
        l.lobbies.push(lob);
      }
    });
    socket.on("removeLobby", function(lob) {
      l.lobbies.splice(findForIndex(l.lobbies, "name", lob.name), 1);
    });
    g.init();
  });

  app.service("g", function(socket) {
    this.context = {
      view: "lobbies",
      currentLobby: {},
      lobbies: [],
      playerName: "untitled"
    };
    var ctx = this;
    this.init = function() {
      socket.emit("request", "", function(dat) {
        ctx.context.lobbies = dat;
      });
    };
  });
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
  app.factory('socket', function($rootScope) {
    var socket = io();
    return {
      on: function(eventName, callback) {
        socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  });

})();
