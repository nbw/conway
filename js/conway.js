// ** Conway's Game of Life **
//
// Example usage:
//
//   conway = New Conway(5,5);
//   grid = [
//     false, false, false, false, false,
//     false, false, true,  false, false,
//     false, false, true,  false, false,
//     false, false, true,  false, false,
//     false, false, false, false, false,
//   ];
//   newGrid = conway.step(grid);
//
let Conway = (function(self){

  // ** Step **
  //
  // @param grid [Array[boolean]]
  //
  // @return Array[boolean]
  self.step = function(grid, width, height) {
    let x, y;
    let newGrid = [];

    for (let p = 0; p < grid.length; p++) {
      x = p%width;
      y = Math.floor(p/width)%width;
      newGrid.push(self.evalPoint(grid, x, y, width, height));
    }

    return newGrid;
  }

  self.evalPoint = function(g, x, y, w, h) {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!(dy == 0 && dx == 0) && self.isAlive(g, x + dx, y + dy, w, h)) {
          count++;
        }
      }
    }

    return (count == 3) || ((count == 2) && self.get(g, x, y, w));
  }

  self.isAlive = function(g, x, y, w, h) {
    // Wraps if out of bounds
    x = (x + w)%w;
    y = (y + h)%h;

    return self.get(g, x, y, w);
  }

  self.get = function(g, x, y, w) {
    return g[x + y*w];
  }

  return self;
})({})
