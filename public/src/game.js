var startMatch = function(url) {

  var Q = Quintus({
      imagePath: "assets/images/",
      audioPath: "assets/music/",
      dataPath: "assets/maps/",
      audioSupported: ["mp3"]
    })
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio, TMX")
    .setup({
      maximize: true
    })
    .enableSound()
    .controls(true).touch();

  Q.gravityY = 0;
  Q.gravityX = 0;

  Q.input.touchControls({
    controls: [
      ['left', '<'],
      ['right', '>'],
      ["up", "^"],
      ["down", "V"],
      ['fire', 'O']
    ]
  });

  var members = [];
  var socket = io.connect("/match");
  var myself = url[0];
  var myindex = 0;

  Q.component("carControls", {

    added: function() {
      var p = this.entity.p;

      if (!p.stepDistance) {
        p.stepDistance = 16;
      }
      if (!p.stepDelay) {
        p.stepDelay = 0.1;
      }

      p.stepWait = 0;
      this.entity.on("step", this, "step");
      this.entity.on("hit", this, "collision");
    },

    collision: function(col) {
      var p = this.entity.p;

      if (p.stepping) {
        p.stepping = false;
        p.x = p.origX;
        p.y = p.origY;
      }

    },

    step: function(dt) {
      var p = this.entity.p,
        moved = false;
      p.stepWait -= dt;
      if (p.stepping) {
        p.x += p.diffX * dt / p.stepDelay;
        p.y += p.diffY * dt / p.stepDelay;
        p.angle = p.angl
      }

      if (p.stepWait > 0) {
        return;
      }
      if (p.stepping) {
        p.x = p.destX;
        p.y = p.destY;
      }
      p.stepping = false;

      p.diffX = 0;
      p.diffY = 0;

      if (members[p.memberIndex]['left']) {
        p.diffX = -p.stepDistance;
      } else if (members[p.memberIndex]['right']) {
        p.diffX = p.stepDistance;
      }

      if (members[p.memberIndex]['up']) {
        p.diffY = -p.stepDistance;
      } else if (members[p.memberIndex]['down']) {
        p.diffY = p.stepDistance;
      }

      p.angl = 0;
      if (p.diffX < 0) {
        p.angl = 90 - Math.atan2(-p.diffY, p.diffX) * 180 / Math.PI;
      } else if (p.diffX > 0) {
        p.angl = 90 - Math.atan2(-p.diffY, p.diffX) * 180 / Math.PI;
      } else if (p.diffY > 0) {
        p.angl = 180;
      } else if (p.diffY < 0) {
        p.angl = 0;
      }

      if (p.diffY || p.diffX) {
        p.stepping = true;
        p.origX = p.x;
        p.origY = p.y;
        p.destX = p.x + p.diffX;
        p.destY = p.y + p.diffY;
        p.stepWait = p.stepDelay;
      }

    }
  });

  Q.Sprite.extend("Car", { //Create car sprite
    init: function(p) {
      this._super(p, {
        sheet: "car",
        sprite: "car",
        scale: 0.5,
        x: 852,
        y: 221,
        memberIndex: 0,
        collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE,
      });
      this.add('2d, carControls');
    }
  });

  Q.scene("0", function(stage) {
    Q.audio.play('LevelTheme1.mp3', {
      loop: true
    });
    Q.stageTMX("TinyCircle.tmx", stage);
    console.log(members);
    for (var i = 0; i < members.length; i++) {
      var car = stage.insert(new Q.Car());
      if (i == myindex) {   //this isnt working
        console.log("ya");
        stage.add("viewport").follow(car);
        stage.viewport.scale = 4;
      }
    }
  });

  var authenticate = function(fn) {
    socket.emit("authenticate", {
      player: url[0],
      match: url[1]
    }, function(accept) {
      if (accept == "yes") {
        console.log("waiting");
        socket.on("begin", function(match) {
          console.log("beginning");
          if (url[1] == match.name) {
            fn(match.map);
            members = match.members;
            console.log(members);
            for (var i = 0; i < members.length; i++) {
              if (members[i] == myself) {
                myindex = i;
              }
              members[i] = {
                player: members[i],
                up: false,
                down: false,
                left: false,
                right: false
              };
            }
            socket.on("keychange", function(k) {
              if (k.match == url[1]) {
                findBy(members, "player", k.player)[k.key] = k.bool;
              }
            });
          }
        });
      }
    });
  };

  Q.loadTMX(["car.png", "car.json", "TinyCircle.tmx", "LevelTheme1.mp3"], function() {
    Q.compileSheets("car.png", "car.json");
    authenticate(function(map) {
      Q.stageScene(map.toString());
    });
  });
  window.addEventListener('keydown', function(e) {
    translateSend(e.keyCode, true);
  }, false);
  window.addEventListener('keyup', function(e) {
    translateSend(e.keyCode, false);
  }, false);

  var translateSend = function(code, bool) {
    var trns = "";
    switch (code) {
      case 38:
        trns = "up";
        break;
      case 40:
        trns = "down";
        break;
      case 37:
        trns = "left";
        break;
      case 39:
        trns = "right";
        break;
    }
    if (trns !== "") {
      socket.emit("keychange", {
        player: myself,
        key: trns,
        bool: bool,
        match: url[1]
      });
    }
  };

  var findBy = function(arr, identifier, name) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][identifier] == name) {
        return arr[i];
      }
    }
  };
};
