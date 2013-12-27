var DIR_LEFT  = 0;
var DIR_RIGHT = 1;
var DIR_UP    = 2;
var DIR_DOWN  = 3;

var CELL_SIZE = 32;
var ROWS = 15;
var COLUMNS = 15;
var HSIZE = CELL_SIZE * COLUMNS;
var VSIZE = CELL_SIZE * ROWS;
var CENTER_X = HSIZE / 2 - CELL_SIZE / 2;
var CENTER_Y = VSIZE / 2 - CELL_SIZE / 2;

var DOCTOR_FRAME = 0;
var SPEED = 3;

enchant();
window.onload = function() {
    var game = new Core(HSIZE, VSIZE);
    game.fps = 16;
    game.preload('daleks.jpg', 'cell.png');
    
    game.onload = function() {
        var bg = new Sprite(HSIZE, VSIZE);
        var maptip = game.assets['cell.png'];
        var image = new Surface(HSIZE, VSIZE);
        
        for (var j = 0; j < VSIZE; j += CELL_SIZE) {
            for (var i = 0; i < HSIZE; i += CELL_SIZE) {
                image.draw(maptip, 0, 0, CELL_SIZE, CELL_SIZE, i, j, CELL_SIZE, CELL_SIZE);
                    // maptip: the preloaded image asset used as the source image
                    // 0, 0: coordinates of upper left corner of the source clipping
                    // CELL_SIZE, CELL_SIZE: width and height of the source clipping
                    // i, j: coorinates of upper left corner of the destination
                    // CELL_SIZE, CELL_SIZE: width and height of the destination
            }
        }
        
        bg.image = image;
        game.rootScene.addChild(bg);

        var doctor = new Sprite(CELL_SIZE, CELL_SIZE);
        doctor.image = game.assets['daleks.jpg'];
        doctor.x = CENTER_X;
        doctor.y = CENTER_Y;
        doctor.frame = DOCTOR_FRAME;
        
        doctor.toX = doctor.x;
        doctor.toY = doctor.y;
        doctor.dir = DIR_DOWN;
        game.rootScene.addChild(doctor);
        doctor.addEventListener(Event.ENTER_FRAME, function() {
            if (doctor.y > doctor.toY) {
                doctor.dir = DIR_UP;
                if (Math.abs(doctor.y - doctor.toY) < SPEED) {
                    doctor.y = doctor.toY;
                } else {
                    doctor.y -= SPEED;
                }
            } else if (doctor.y < doctor.toY) {
                doctor.dir = DIR_DOWN;
                if (Math.abs(doctor.y - doctor.toY) < SPEED) {
                    doctor.y = doctor.toY;
                } else {
                    doctor.y += SPEED;
                }
            }
            if (doctor.x > doctor.toX) {
                doctor.dir = DIR_LEFT;
                if (Math.abs(doctor.x - doctor.toX) < SPEED) {
                    doctor.x = doctor.toX;
                } else {
                    doctor.x -= SPEED;
                }
            } else if (doctor.x < doctor.toX) {
                doctor.dir = DIR_RIGHT;
                if (Math.abs(doctor.x - doctor.toX) < SPEED) {
                    doctor.x = doctor.toX;
                } else {
                    doctor.x += SPEED;
                }
            }

        });
        
        bg.addEventListener(Event.TOUCH_START, function(e) {
            doctor.toX = e.x - CELL_SIZE / 2;
            doctor.toY = e.y - CELL_SIZE / 2;
        });
        
        bg.addEventListener(Event.TOUCH_MOVE, function(e) {
            doctor.toX = e.x - CELL_SIZE / 2;
            doctor.toY = e.y - CELL_SIZE / 2;
        });
    };
    game.start();
};
