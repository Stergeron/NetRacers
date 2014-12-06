var Q = Quintus()
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
    .setup({ maximize: true })
    .controls().touch()
    ;

Q.Sprite.extend("Car",{ //Create car sprite

    init: function(c) {

        this._super(c, {
            sheet: "car",
            x: 410,
            y: 90
        });
    }
});
