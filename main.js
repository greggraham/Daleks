// Change for class.

var CELL_SIZE = 32;
var NO_MOVE_DELTA = CELL_SIZE / 2;
var ROWS = 15;
var COLUMNS = 15;
var HSIZE = CELL_SIZE * COLUMNS;
var VSIZE = CELL_SIZE * ROWS;

var DOCTOR_FRAME = 0;
var DALEK_FRAME = 1;
var TARDIS_FRAME = 2;
var SPEED = 3;
var NUM_DALEKS = 15;
var NORMAL = 0;
var DESTINED = 1;
var EXPLODING = 3;
var DEAD = 4;

// Initialize the Enchant.js library.
enchant();

// Conveniently generate a random integer from 0 up to but not including limit.
function randInt(limit) {
    return Math.floor(Math.random() * limit);
}

// Cell location object
function CellLoc(cInX, cInY) {
    var cX = cInX;
    var cY = cInY;
    var pX;
    var pY;

    var normalize = function() {
        if (cX < 0) cX = 0;
        else if (cX >= COLUMNS) cX = COLUMNS - 1;
        if (cY < 0) cY = 0;
        else if (cY >= ROWS) cY = ROWS - 1;
        pX = cX * CELL_SIZE;
        pY = cY * CELL_SIZE;
    };

    normalize();

    Object.defineProperty(this, "cellX", {
        get: function() { return cX; },
        set: function(newX) { cX = newX; normalize(); }
    });

    Object.defineProperty(this, "cellY", {
        get: function() { return cY; },
        set: function(newY) { cY = newY; normalize(); }
    });

    Object.defineProperty(this, "pixelX", {
        get: function() { return pX; },
    });

    Object.defineProperty(this, "pixelY", {
        get: function() { return pY; },
    });


    this.moveTowardsPixel = function(destX, destY) {
        var deltaX = destX - (pX + CELL_SIZE / 2);
        var deltaY = destY - (pY + CELL_SIZE / 2);

        if (Math.abs(deltaX) < NO_MOVE_DELTA && Math.abs(deltaY) < NO_MOVE_DELTA)
            return;

        var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        if (angle < -157.5 || angle > 157.5) {
            // Move W
            cX--;
            normalize();
        } else if (angle < -112.5) {
            // Move NW
            cY--;
            cX--;
            normalize();
        } else if (angle < -67.5) {
            // Move N
            cY--;
            normalize();
        } else if (angle < -22.5) {
            // Move NE
            cY--;
            cX++;
            normalize();
        } else if (angle < 22.5) {
            // Move E
            cX++;
            normalize();
        } else if (angle < 67.5) {
            // Move SE
            cY++;
            cX++;
            normalize();
        } else if (angle < 112.5) {
            // Move S
            cY++;
            normalize();
        } else {
            // Move SW
            cY++;
            cX--;
            normalize();
        }
    };

    this.moveTowardsCell = function(cellLoc) {
        this.moveTowardsPixel(cellLoc.pixelX + CELL_SIZE / 2,
                              cellLoc.pixelY + CELL_SIZE / 2);
    };

    this.equals = function(cellLoc) {
        return cX == cellLoc.cellX && cY == cellLoc.cellY;
    };

    this.pixelEquals = function(s) {
        return pX == s.x && pY == s.y;
    };
}


function createGameObject(loc, image, frameNum) {
    var s = new Sprite(CELL_SIZE, CELL_SIZE);
    s.image = image;
    s.x = loc.pixelX;
    s.y = loc.pixelY;
    s.frame = frameNum;
    var obj = {
        cellLoc : loc,
        sprite : s,
        moveSprite : function() {
            var s = this.sprite;
            var toX = this.cellLoc.pixelX;
            var toY = this.cellLoc.pixelY;
            if (s.y > toY) {
                if (Math.abs(s.y - toY) < SPEED) {
                    s.y = toY;
                } else {
                    s.y -= SPEED;
                }
            } else if (s.y < toY) {
                if (Math.abs(s.y - toY) < SPEED) {
                    s.y = toY;
                } else {
                    s.y += SPEED;
                }
            }
            if (s.x > toX) {
                if (Math.abs(s.x - toX) < SPEED) {
                    s.x = toX;
                } else {
                    s.x -= SPEED;
                }
            } else if (s.x < toX) {
                if (Math.abs(s.x - toX) < SPEED) {
                    s.x = toX;
                } else {
                    s.x += SPEED;
                }
            }
        },
        arrived : function() {
            return this.cellLoc.pixelEquals(this.sprite);
        },
    };
    return obj;
}


function createDoctor(loc, image) {
    var doctor = Object.create(createGameObject(loc, image, DOCTOR_FRAME));
    doctor.moveTo = function(e) {
        this.cellLoc.moveTowardsPixel(e.x, e.y);
    };
    return doctor;
}


function createDalek(loc, image) {
    var dalek = Object.create(createGameObject(loc, image, DALEK_FRAME));
    dalek.state = NORMAL;
    dalek.moveTo = function(cellLoc) {
        this.cellLoc.moveTowardsCell(cellLoc);
    };
    dalek.sprite.addEventListener(Event.ENTER_FRAME, function() {
        dalek.moveSprite()
    });
    return dalek;
}


window.onload = function() {
    var game = new Core(HSIZE, VSIZE);
    game.fps = 16;
    game.preload('daleks.png', 'cell.png');

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
                // i, j: coordinates of upper left corner of the destination
                // CELL_SIZE, CELL_SIZE: width and height of the destination
            }
        }

        bg.image = image;
        game.rootScene.addChild(bg);


        //
        // Create and configure the game objects
        //
        var tardis = createGameObject(new CellLoc(0, randInt(ROWS)),
                                      game.assets['daleks.png'],
                                      TARDIS_FRAME);
        game.rootScene.addChild(tardis.sprite);

        var doctor = createDoctor(new CellLoc(COLUMNS - 1, randInt(ROWS)),
                                  game.assets['daleks.png']);

        var daleks = new Array(NUM_DALEKS);
        for (var i = 0; i < NUM_DALEKS; i++) {
            daleks[i] = createDalek(new CellLoc(1 + randInt(COLUMNS - 3), randInt(ROWS)),
                                    game.assets['daleks.png']);
            game.rootScene.addChild(daleks[i].sprite);
        }

        doctor.sprite.addEventListener(Event.ENTER_FRAME, function() {
            doctor.moveSprite();
        });
        game.rootScene.addChild(doctor.sprite);


        //
        // Set up user touch input processing
        //

        function processTouch(e) {

            // Instruct all of the daleks to move to the Doctor's current location.
            for (var i = 0; i < NUM_DALEKS; i++) {
                if (daleks[i].state == NORMAL) {
                    daleks[i].moveTo(doctor.cellLoc);
                }
            }

            // Instruct the Doctor to move in the direction of the touch.
            doctor.moveTo(e);
        }

        // Add touch listener to background and all game objects so that the user can
        // touch/click anywhere in the game and move towards that position.

        bg.addEventListener(Event.TOUCH_START, processTouch);
        tardis.sprite.addEventListener(Event.TOUCH_START, processTouch);
        doctor.sprite.addEventListener(Event.TOUCH_START, processTouch);
        for (var i = 0; i < NUM_DALEKS; i++) {
            daleks[i].sprite.addEventListener(Event.TOUCH_START, processTouch);
        }

    };

    // Allons-y! (see http://youtu.be/hBNH8qub_vI)
    game.start();
};
