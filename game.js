/*global $, document, setInterval, clearInterval*/

$(document).ready(function () {
	var width,
			height,
			cs,
			ctx,
			nextCtx,
			board,
			piece,
			nextPiece,
			gameLoop,
			scoreText,
			score,
			linesText,
			lines,
			levelText,
			level;

	function init() {
		width = 10;
		height = 20;
		ctx = $("#board")[0].getContext("2d");
		nextCtx = $("#nextPiece")[0].getContext("2d");

		var x, y;
		board = [];
		for (y = 0; y < height; y++) {
			board.push(new Array(10));
		}
		for (x = 0; x < width; x++) {
			for (y = 0; y < height; y++) {
				board[x][y] = 0;
			}
		}

		scoreText = $("#score");
		score = 0;
		scoreText.text("Score: "+score.toString());
		linesText = $("#lines");
		lines = 0;
		linesText.text("Lines: "+lines.toString());
		levelText = $("#level");
		level = 1;
		levelText.text("Level: "+level.toString());
		
		resetTimer();
		piece = makePiece(Math.floor(Math.random() * 7) + 1);
		nextPiece = makePiece(Math.floor(Math.random() * 7) + 1);
		paint();
	}
	
	function resetTimer() {
		clearInterval(gameLoop);
		
		var time = 1000 - (60 * Math.min(level, 15));
		
		gameLoop = setInterval(update, time);
	}

	function update() {
		movePiece(down);
		
		paint();
	}

	function fixPiece() {
		pieceToWorld().forEach(function (c) {
			setCell(c.x, c.y, c.col);
		});
		piece = nextPiece;		
		nextPiece = makePiece(Math.floor(Math.random() * 7) + 1);
		
		clearLine();
		
		resetTimer();
	}
	
	function clearLine() {
		var x, y,
				linesCleared = 0,
				filled,
				newY;
		for (y = height - 1; y >= 0; y--) {
			filled = true;
			for (x = 0; x < width; x++) {
				if (getCell(x,y) === 0)
					filled = false;
			}
			if (filled) {
				for (newY = y; y >= 0; y--) {
					for (x = 0; x < width; x++) {
						setCell(x,y,getCell(x,y-1));
					}
				}
				linesCleared++;
				
				y = height;
			}
		}

		if (linesCleared > 0) {
			lines = lines + linesCleared;
			linesText.text("Lines: "+lines.toString());
			score = score + [0,100,300,500,800][linesCleared] * level;
			scoreText.text("Score: "+score.toString());
			level = Math.floor(lines / 10) + 1;
			levelText.text("Level: "+level.toString());
		}
	}

	var up = 0,
			right = 1,
			down = 2,
			left = 3;

	function movePiece(dir, amount) {
		if (typeof amount == 'undefined') amount = 1;
		if (dir === up) {
			piece.y -= amount;
			if (pieceIntersects()) {
				piece.y += amount;
				return false;
			}
			return true;
		}
		if (dir === right) {
			piece.x += amount;
			if (pieceIntersects()) {
				piece.x -= amount;
				return false;
			}
			return true;
		} else if (dir === down) {
			piece.y += amount;
			if (pieceIntersects()) {
				piece.y -= amount;
				fixPiece();
				return false;
			}
			return true;
		} else if (dir === left) {
			piece.x -= amount;
			if (pieceIntersects()) {
				piece.x += amount;
				return false;
			}
			return true;
		}
	}

	function pieceIntersects() {
		var cells = pieceToWorld(),
			i,
			c;
		for (i = 0; i < cells.length; i++) {
			c = cells[i];
			if (getCell(c.x, c.y) !== 0) {
				return true;
			}
		}
		return false;
	}

	function rotatePiece() {
		if (piece.col === 4) return;
		piece.rot = (piece.rot + 1) % 4;
		
		if (pieceIntersects()) {
			if (!movePiece(left)) {
				if (!movePiece(right)) {
					if (!movePiece(left,2)) {
						if (!movePiece(right,2)) {
							if (!movePiece(up)) {
								if (!movePiece(up,2)) {
									piece.rot = piece.rot - 1;
									if (piece.rot === -1)
										piece.rot = 3;
									return false;
								}
							}
						}
					}
				}
			}
		}
		return true;
	}

	function paint() {

		cs = $("#board").width() / width;
		
		var x, y;
		for (x = 0; x < width; x++) {
			for (y = 0; y < height; y++) {
				paintCell(x, y, board[x][y]);
			}
		}

		pieceToWorld().forEach(function (c) {
			paintCell(c.x, c.y, c.col);
		});
		
		cs = $("#nextPiece").width() / 5;
		for (x = 0; x < 5; x++) {
			for (y = 0; y < 5; y++) {
				paintCell(x, y, 0, nextCtx);
			}
		}
		pieceToWorld(nextPiece).forEach(function (c) {
			paintCell(c.x-3, c.y+1, c.col, nextCtx);
		});
	}

	function paintCell(x, y, col, canvas) {
		if (typeof canvas === 'undefined') canvas = ctx;
		var colours = [[255,255,255], [0,255,255], [70,70,255],[255,156,0], [255,255,0], [0,255,0], [200,50,200], [255,0,0]],
				r = colours[col][0],
				g = colours[col][1],
				b = colours[col][2],
				shades = [0,20,40,60,80];
		if (col !== 0) {	
			canvas.fillStyle = colour(r-shades[0],g-shades[0],b-shades[0]);
			canvas.fillRect(x*cs,y*cs,cs,cs);
			
			canvas.beginPath();
			canvas.fillStyle = colour(r-shades[1],g-shades[1],b-shades[1]);
			canvas.moveTo(x*cs,y*cs);
			canvas.lineTo((x+0.5)*cs,(y+0.5)*cs);
			canvas.lineTo((x)*cs, (y+1)*cs);
			canvas.fill();
			
			canvas.beginPath();
			canvas.fillStyle = colour(r-shades[3],g-shades[3],b-shades[3]);
			canvas.moveTo((x+1)*cs,y*cs);
			canvas.lineTo((x)*cs,(y+1)*cs);
			canvas.lineTo((x+1)*cs, (y+1)*cs);
			canvas.fill();
			
			canvas.beginPath();
			canvas.fillStyle = colour(r-shades[4],g-shades[4],b-shades[4]);
			canvas.moveTo((x+1)*cs,(y+1)*cs);
			canvas.lineTo((x+0.5)*cs,(y+0.5)*cs);
			canvas.lineTo((x)*cs, (y+1)*cs);
			canvas.fill();
			
			canvas.fillStyle = colour(r-shades[2],g-shades[2],b-shades[2]);
			canvas.fillRect((x+0.25)*cs, (y+0.25)*cs, (0.5)*cs, (0.5)*cs);
		} else {
			canvas.fillStyle = colour(r,g,b);
			canvas.fillRect(x * cs, y * cs, cs, cs);
			canvas.strokeStyle = "lightGrey";
			canvas.strokeRect(x * cs, y * cs, cs, cs);
		}
	}
	
	function colour(r,g,b) {
		return "rgb("+r.toString()+","+g.toString()+","+b.toString()+")";
	}

	function makePiece(type) {
		var piece = {
			x: 5,
			y: 0,
			rot: Math.floor(Math.random() * 4),
			cells: [],
			col: type
		};

		if (type === 1) {
			// ####
			piece.cells.push({x: -1, y: 0});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  1, y: 0});
			piece.cells.push({x:  2, y: 0});
		} else if (type === 2) {
			// ###
			//   #
			piece.cells.push({x: -1, y: 0});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  1, y: 0});
			piece.cells.push({x : 1, y: 1});
		} else if (type === 3) {
			// ###
			// #
			piece.cells.push({x: -1, y: 0});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  1, y: 0});
			piece.cells.push({x: -1, y: 1});
		} else if (type === 4) {
			// ##
			// ##
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  0, y: 1});
			piece.cells.push({x:  1, y: 0});
			piece.cells.push({x:  1, y: 1});
		} else if (type === 5) {
			//  ##
			// ##
			piece.cells.push({x: -1, y: 1});
			piece.cells.push({x:  0, y: 1});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  1, y: 0});
		} else if (type === 6) {
			// ###
			//  #
			piece.cells.push({x: -1, y: 0});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  0, y: 1});
			piece.cells.push({x:  1, y: 0});
		} else if (type === 7) {
			// ##
			//  ##
			piece.cells.push({x: -1, y: 0});
			piece.cells.push({x:  0, y: 0});
			piece.cells.push({x:  0, y: 1});
			piece.cells.push({x:  1, y: 1});
		}

		var move = 0;
		pieceToWorld(piece).forEach(function (c) {
			if (c.y < 0) {
				move = Math.min(move, c.y);
			}
		});
		piece.y = piece.y - move;
		
		return piece;
	}

	function setCell(x, y, col) {
		if (x >= 0 && x < width && y >= 0 && y < height) {
			board[x][y] = col;
		}
	}

	function getCell(x, y) {
		if (x >= 0 && x < width && y < height) {
			if (y < 0) {
				return 0;
			} else {
				return board[x][y];
			}
		} else {
			return -1;
		}
	}

	function pieceToWorld(local) {
		if (typeof local === 'undefined') local = piece;
		var cells = [];

		local.cells.forEach(function (c) {
			var x, y;

			if (local.rot === 0) {
				x = c.x;
				y = c.y;
			} else if (local.rot === 1) {
				y = c.x;
				x = -c.y;
			} else if (local.rot === 2) {
				x = -c.x;
				y = -c.y;
			} else if (local.rot === 3) {
				y = -c.x;
				x = c.y;
			}

			cells.push({
				x: local.x + x,
				y: local.y + y,
				col: local.col
			});
		});

		return cells;
	}

	$(document).keydown(function (event) {
		if (event.which === 37 || event.which === 65) {
			// LEFT
			movePiece(left);
		} else if (event.which === 39 || event.which === 68) {
			// RIGHT
			movePiece(right);
		} else if (event.which === 40 || event.which === 83) {
			// DOWN
			movePiece(down);
			resetTimer();
		} else if (event.which === 38 || event.which === 87) {
			// ROTATE
			rotatePiece();
		}
		paint();
	});
	
	$("#restart").click(function () {
		init();
	})

	init();
});