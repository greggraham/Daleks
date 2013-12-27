var CELL_SIZE = 32;
var ROWS = 15;
var COLUMNS = 15;
var HSIZE = CELL_SIZE * COLUMNS;
var VSIZE = CELL_SIZE * ROWS;

var DOCTOR_FRAME = 0;
var SPEED = 3;

enchant();

function CellLoc(cellX, cellY) {
	this.cellX = cellX;
	this.cellY = cellY;
	
	this.bounds = function() {
		if (this.cellX < 0) this.cellX = 0;
		else if (this.cellX >= COLUMNS) this.cellX = COLUMNS - 1;
		if (this.cellY < 0) this.cellY = 0;
		else if (this.cellY >= ROWS) this.cellY = ROWS - 1;
		this.pixelX = this.cellX * CELL_SIZE;
		this.pixelY = this.cellY * CELL_SIZE;
	};
	
	this.bounds();
	
	this.moveN = function() {
		this.cellY--;
		this.bounds();
	};
	this.moveNE = function() {
		this.cellY--;
		this.cellX++;
		this.bounds();
	};
	this.moveE = function() {
		this.cellX++;
		this.bounds();
	};
	this.moveSE = function() {
		this.cellY++;
		this.cellX++;
		this.bounds();
	};
	this.moveS = function() {
		this.cellY++;
		this.bounds();
	};
	this.moveSW = function() {
		this.cellY++;
		this.cellX--;
		this.bounds();
	};
	this.moveW = function() {
		this.cellX--;
		this.bounds();
	};
	this.moveNW = function() {
		this.cellY--;
		this.cellX--;
		this.bounds();
	};

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
                    // i, j: coorinates of upper left corner of the destination
                    // CELL_SIZE, CELL_SIZE: width and height of the destination
            }
        }
        
        bg.image = image;
        game.rootScene.addChild(bg);

        var doctor = new Sprite(CELL_SIZE, CELL_SIZE);
        doctor.image = game.assets['daleks.png'];
		doctor.cellLoc = new CellLoc(Math.floor(COLUMNS / 2), Math.floor(ROWS / 2));
        doctor.x = doctor.cellLoc.pixelX;
        doctor.y = doctor.cellLoc.pixelY;
        doctor.frame = DOCTOR_FRAME;
        
        game.rootScene.addChild(doctor);
        doctor.addEventListener(Event.ENTER_FRAME, function() {
            if (doctor.y > doctor.cellLoc.pixelY) {
                if (Math.abs(doctor.y - doctor.cellLoc.pixelY) < SPEED) {
                    doctor.y = doctor.cellLoc.pixelY;
                } else {
                    doctor.y -= SPEED;
                }
            } else if (doctor.y < doctor.cellLoc.pixelY) {
                if (Math.abs(doctor.y - doctor.cellLoc.pixelY) < SPEED) {
                    doctor.y = doctor.cellLoc.pixelY;
                } else {
                    doctor.y += SPEED;
                }
            }
            if (doctor.x > doctor.cellLoc.pixelX) {
                if (Math.abs(doctor.x - doctor.cellLoc.pixelX) < SPEED) {
                    doctor.x = doctor.cellLoc.pixelX;
                } else {
                    doctor.x -= SPEED;
                }
            } else if (doctor.x < doctor.cellLoc.pixelX) {
                if (Math.abs(doctor.x - doctor.cellLoc.pixelX) < SPEED) {
                    doctor.x = doctor.cellLoc.pixelX;
                } else {
                    doctor.x += SPEED;
                }
            }

        });
        
		function touchResponse(e) {
            var deltaX = e.x - doctor.cellLoc.pixelX;
            var deltaY = e.y - doctor.cellLoc.pixelY;
			var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
			console.log(angle);
			
			if (angle < -150)
				doctor.cellLoc.moveW();
			else if (angle < -120)
				doctor.cellLoc.moveNW();
			else if (angle < -60)
				doctor.cellLoc.moveN();
			else if (angle < -30)
				doctor.cellLoc.moveNE();
			else if (angle < 30)
				doctor.cellLoc.moveE();
			else if (angle < 60)
				doctor.cellLoc.moveSE();
			else if (angle < 120)
				doctor.cellLoc.moveS();
			else if (angle < 150)
				doctor.cellLoc.moveSW();
			else
				doctor.cellLoc.moveW();
		}
		
        bg.addEventListener(Event.TOUCH_START, touchResponse);
    };
    game.start();
};
