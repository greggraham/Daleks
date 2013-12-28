var CELL_SIZE = 32;
var ROWS = 15;
var COLUMNS = 15;
var HSIZE = CELL_SIZE * COLUMNS;
var VSIZE = CELL_SIZE * ROWS;

var DOCTOR_FRAME = 0;
var DALEK_FRAME = 1;
var TARDIS_FRAME = 2;
var SPEED = 3;
var NUM_DALEKS = 15;

enchant();

function randInt(limit) {
	return Math.floor(Math.random() * limit);
}

function CellLoc(cellX, cellY) {
	this.cellX = cellX;
	this.cellY = cellY;
	
	this.normalize = function() {
		if (this.cellX < 0) this.cellX = 0;
		else if (this.cellX >= COLUMNS) this.cellX = COLUMNS - 1;
		if (this.cellY < 0) this.cellY = 0;
		else if (this.cellY >= ROWS) this.cellY = ROWS - 1;
		this.pixelX = this.cellX * CELL_SIZE;
		this.pixelY = this.cellY * CELL_SIZE;
	};
	
	this.normalize();
	
	this.moveN = function() {
		this.cellY--;
		this.normalize();
	};
	this.moveNE = function() {
		this.cellY--;
		this.cellX++;
		this.normalize();
	};
	this.moveE = function() {
		this.cellX++;
		this.normalize();
	};
	this.moveSE = function() {
		this.cellY++;
		this.cellX++;
		this.normalize();
	};
	this.moveS = function() {
		this.cellY++;
		this.normalize();
	};
	this.moveSW = function() {
		this.cellY++;
		this.cellX--;
		this.normalize();
	};
	this.moveW = function() {
		this.cellX--;
		this.normalize();
	};
	this.moveNW = function() {
		this.cellY--;
		this.cellX--;
		this.normalize();
	};
	
	this.moveTowardsPixel = function(destX, destY) {
		var deltaX = destX - (this.pixelX + CELL_SIZE / 2);
		var deltaY = destY - (this.pixelY + CELL_SIZE / 2);
		var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		
		if (angle < -150)
			this.moveW();
		else if (angle < -120)
			this.moveNW();
		else if (angle < -60)
			this.moveN();
		else if (angle < -30)
			this.moveNE();
		else if (angle < 30)
			this.moveE();
		else if (angle < 60)
			this.moveSE();
		else if (angle < 120)
			this.moveS();
		else if (angle < 150)
			this.moveSW();
		else
			this.moveW();
	};
	
	this.moveTowardsCell = function(cellLoc) {
		this.moveTowardsPixel(cellLoc.pixelX, cellLoc.pixelY);
	}
}

function spriteMover(obj) {
	var s = obj.sprite;
	var cl = obj.cellLoc;
	return function() {
		if (s.y > cl.pixelY) {
			if (Math.abs(s.y - cl.pixelY) < SPEED) {
				s.y = cl.pixelY;
			} else {
				s.y -= SPEED;
			}
		} else if (s.y < cl.pixelY) {
			if (Math.abs(s.y - cl.pixelY) < SPEED) {
				s.y = cl.pixelY;
			} else {
				s.y += SPEED;
			}
		}
		if (s.x > cl.pixelX) {
			if (Math.abs(s.x - cl.pixelX) < SPEED) {
				s.x = cl.pixelX;
			} else {
				s.x -= SPEED;
			}
		} else if (s.x < cl.pixelX) {
			if (Math.abs(s.x - cl.pixelX) < SPEED) {
				s.x = cl.pixelX;
			} else {
				s.x += SPEED;
			}
		}
	};
}

function GameObject(cellLoc, image, frameNum) {
	this.cellLoc = cellLoc;
	this.sprite = new Sprite(CELL_SIZE, CELL_SIZE);
	this.sprite.image = image;
	this.sprite.x = this.cellLoc.pixelX;
	this.sprite.y = this.cellLoc.pixelY;
	this.sprite.frame = frameNum;
}

function Doctor(cellLoc, image) {
	GameObject.call(this, cellLoc, image, DOCTOR_FRAME);
	this.sprite.addEventListener(Event.ENTER_FRAME, spriteMover(this));
	var cellLoc = this.cellLoc;
	this.moveTo = function(e) {
		cellLoc.moveTowardsPixel(e.x, e.y);
	};
}

function Dalek(cellLoc, image) {
	GameObject.call(this, cellLoc, image, DALEK_FRAME);
	this.sprite.addEventListener(Event.ENTER_FRAME, spriteMover(this));
	var cellLoc = this.cellLoc;
	this.moveTo = function(cellLoc) {
		this.cellLoc.moveTowardsCell(cellLoc);
	}
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
		
		var doctor = new Doctor(new CellLoc(COLUMNS - 1, randInt(ROWS)),
								game.assets['daleks.png']);
		game.rootScene.addChild(doctor.sprite);

		var daleks = new Array(NUM_DALEKS);
		for (var i = 0; i < NUM_DALEKS; i++) {
			daleks[i] = new Dalek(new CellLoc(1 + randInt(COLUMNS - 3), randInt(ROWS)),
								  game.assets['daleks.png']);
			game.rootScene.addChild(daleks[i].sprite);
		}
		
		var tardis = new GameObject(new CellLoc(0, randInt(ROWS)),
								game.assets['daleks.png'],
								TARDIS_FRAME);
		game.rootScene.addChild(tardis.sprite);

		
        bg.addEventListener(Event.TOUCH_START, function(e) {
		    doctor.moveTo(e);
			for (var i = 0; i < NUM_DALEKS; i++) {
				daleks[i].moveTo(doctor.cellLoc);
			}
		});

    };
    game.start();
};
