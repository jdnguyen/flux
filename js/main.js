var stage = new createjs.Stage("canvas");
var circle = new createjs.Shape();
var x_dir = 10;
var y_dir = 5;

function init() {
    circle.graphics.beginFill("red").drawCircle(0, 0, 50);
    circle.x = 100;
    circle.y = 100;
    stage.addChild(circle);
    stage.update();

    console.log(circle);
    console.log("hi");
    circle.on("pressmove", function(evt) {
        console.log("in");
        evt.target.x = evt.stageX;
        evt.target.y = evt.stageY
        stage.update();
    })

    createjs.Ticker.on("tick", moveBall);
    createjs.Ticker.setFPS(60);

}

function moveBall(){
    circle.x += x_dir;
    circle.y += y_dir;
    if(circle.x >= 450){
        x_dir = -10;
    }
    else if(circle.x <= 50){
        x_dir = 10;
    }

    if(circle.y >= 450){
        y_dir = -5;
    }
    else if(circle.y <= 50){
        y_dir = 5;
    }
    stage.update();
}