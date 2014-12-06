window.addEventListener("load",function() {

    var Q = Quintus({ imagePath: "assets/"})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
        .setup({ maximize: true })
        .controls().touch();

        Q.gravityY = 0;
        Q.gravityX = 0;

    Q.Sprite.extend("Car",{ //Create car sprite

        init: function(c) {

            this._super(c, {
                asset: "car.png",
                x: 410,
                y: 90
            });
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
