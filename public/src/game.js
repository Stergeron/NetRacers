window.addEventListener("load",function() {

    var Q = Quintus({ imagePath: "assets/"})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio")
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

            if(!p.stepDistance) { p.stepDistance = 32; }
            if(!p.stepDelay) { p.stepDelay = 0.2; }

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

    Q.Sprite.extend("Car",{ //Create car sprite
        init: function(c) {
            this._super(c, {
                asset: "car.png",
                x: 410,
                y: 90
            });
            this.add('2d, carControls');
        }
    });

    Q.scene("level1", function(stage) {
        var car = stage.insert(new Q.Car());
        stage.add("viewport").follow(car);
    });

    Q.load("car.png", function() {
        Q.stageScene("level1");
    });
});
