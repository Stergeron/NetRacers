(function() {
  var app = angular.module("matchmaking", []);

  app.controller("Player", function(g, socket) {
    this.l = g.context;
    var l = g.context;
    this.main = function(){
      this.l.view = "main";
    };
    this.play = function(){
      this.l.view = "signin";
    };
    this.credits = function(){
      this.l.view = "credits";
    };
    this.signin = function(){
      socket.emit("joinGame", this.l.playerName, function(accept) {
        if(accept != "REJECT"){
          l.view = "lobbies";
        }
        else {
          l.playerName = "";
        }
      });
    };
    this.joinLobby = function(lob) {
      this.l.currentLobby = findBy(this.l.lobbies, "name", lob);
      socket.emit("joinLobby", {
        player: this.l.playerName,
        lob: lob
      });
      this.l.view = "lobby";
      this.l.currentLobby.members.push(this.l.playerName);
    };
    this.leaveLobby = function(){
      socket.emit("leaveLobby", {name: this.l.currentLobby.name, player: this.l.playerName});
      this.l.view = "lobbies";
    };
    this.leaveGame = function(){
      socket.emit("leaveGame", {});
    };
    this.createLobby = function(){
      var lobname = this.l.playerName + "'s Lobby";
      var ok = false;
      socket.emit("createLobby", this.l.playerName);
      if(this.l.lobbies.length <= 25){
        this.l.lobbies.push({name: lobname, members: [], open: true});
        this.joinLobby(lobname);
      }
    };
    /*this.changeMap = function(){
      if(this.l.currentLobby.map >= this.l.maps.length-1){
        this.l.currentLobby.map = -1;
      }
      this.l.currentLobby.map++;
      socket.emit("changeMap", {map: this.l.currentLobby.map, lobby: this.l.currentLobby.name});
    };*/
    this.startGame = function(){
      socket.emit("startGame", {name: this.l.currentLobby.name, player: this.l.playerName});
    };
    socket.on("packet", function(dat){
      if(dat.game == l.currentLobby.name){
        findBy(l.currentGame, "member", dat.member).pressed = dat.pressed;
      }
    });
    socket.on("updateLobby", function(lob) {
      if (findBy(l.lobbies, "name", lob.name) !== undefined) {
        l.lobbies[findForIndex(l.lobbies, "name", lob.name)] = lob;
        if(l.currentLobby.name == lob.name){
          l.currentLobby = lob;
        }
      } else {
        l.lobbies.push(lob);
      }
    });
    socket.on("removeLobby", function(lob) {
      l.lobbies.splice(findForIndex(l.lobbies, "name", lob.name), 1);
    });
    socket.on("startGame", function(name){
      if(l.currentLobby.name == name){
        l.view = "match";
        startMatch([l.playerName, l.currentLobby.name]);
        socket.emit("leaveLobby", {name: l.currentLobby.name, player: l.playerName});
      }
    });
    g.init();
  });

  app.service("g", function(socket) {
    this.context = {
      view: "main",
      currentLobby: {},
      currentGame: [],
      lobbies: [],
      playerName: "",
      carImages: ["VerizonCar.png", "ComcastCar.png", "CoxCar.png", "TWCCar.png"],
      maps: ["Circuit", "Roundabout", "Twisty Turny"]
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
