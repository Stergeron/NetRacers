window.addEventListener("load",function() {

    var Q = Quintus({ imagePath: "assets/images/",
                      audioPath: "assets/music/",
                      dataPath: "assets/maps/",
                      audioSupported: ["mp3"] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio, TMX")
        .setup({ maximize: true })
        .enableSound()
        .controls(true).touch();

    Q.gravityY = 0;
    Q.gravityX = 0;

    Q.input.touchControls({
        controls:  [ ['left','<' ],
        ['right','>' ],
        ["up", "^"],
        ["down", "V"],
        ['fire', 'O' ]]
      });

    Q.component("carControls", {

        added: function() {
            var p = this.entity.p;

            if(!p.stepDistance) { p.stepDistance = 16; }
            if(!p.stepDelay) { p.stepDelay = 0.1; }

            p.stepWait = 0;
            this.entity.on("step",this,"step");
            this.entity.on("hit", this,"collision");
          },

        collision: function(col) {
            var p = this.entity.p;

            if(p.stepping) {
                p.stepping = false;
                p.x = p.origX;
                p.y = p.origY;
            }

        },

        step: function(dt) {
            var p = this.entity.p,
            moved = false;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
                p.angle = p.angl
            }

            if(p.stepWait > 0) { return; }
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
            }
            p.stepping = false;

            p.diffX = 0;
            p.diffY = 0;

            if(Q.inputs['left']) {
                p.diffX = -p.stepDistance;
            } else if(Q.inputs['right']) {
                p.diffX = p.stepDistance;
            }

            if(Q.inputs['up']) {
                p.diffY = -p.stepDistance;
            } else if(Q.inputs['down']) {
                p.diffY = p.stepDistance;
            }

            p.angl = 0;
            if(p.diffX < 0) {
                p.angl = 90-Math.atan2(-p.diffY, p.diffX)*180/Math.PI;
            } else if(p.diffX > 0) {
                p.angl = 90-Math.atan2(-p.diffY, p.diffX)*180/Math.PI;
            } else if(p.diffY > 0) {
                p.angl = 180;
            } else if(p.diffY < 0){
                p.angl = 0;
            }

            if(p.diffY || p.diffX ) {
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepWait = p.stepDelay;
            }

        }
    });

    Q.Sprite.extend("Player",{ //Create car sprite
        init: function(p) {
            this._super(p, {
                asset: "car.png",
                scale: .2,
            });
            this.add('2d, carControls');
        }
    });

    Q.Sprite.extend("Dummy", {
        init: function(d) {
            this._super(d, {
                sheet: "car",
                sprite: "car",
                scale: .2
            });
            this.add('2d');
        }
    });

    Q.scene("level1", function(stage) {
        Q.audio.play('LevelTheme1.mp3', {loop: true});
        Q.stageTMX("TinyCircle.tmx", stage)
        stage.add("viewport").follow(Q("Player").first());
        stage.viewport.scale = 8;
    });

    Q.loadTMX(["car.png", "car.json", "TinyCircle.tmx", "LevelTheme1.mp3"], function() {
        Q.compileSheets("car.png","car.json");
        Q.stageScene("level1");
    });
});
