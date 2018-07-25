// Canvas Conway Engine
//
// Handles the link between a canvas object
// and the conway engine.
let CanvasConwayEngine = (function(self){

  // ** Canvas To Conway **
  //
  // Analyzes a canvas and returns an
  // array of booleans that is consumable by
  // the conway engine.
  //
  // @param canvas    [Canvas object]
  // @param pixelSize [Int]
  //
  // @return Array[boolean]
  self.canvasToConway = function(canvas, pixelSize) {
    let context, data, grid, image, pixelIndex, pixelsPerWidth, pixelsPerHeight;

    context = canvas.getContext('2d');

    image = context.getImageData(0, 0, canvas.width, canvas.height);

    data = image.data;

    pixelsPerWidth  = canvas.width / pixelSize;

    pixelsPerHeight = canvas.height / pixelSize;

    grid = [];

    for (let y = 0; y < pixelsPerHeight; y++) {
      for (let x = 0; x < pixelsPerWidth; x++) {
        pixelIndex = 4*pixelSize*(y*canvas.width + x);
        grid.push(data[pixelIndex] == 0);
      }
    }

    return grid;
  }

  // ** Conway To Canvas **
  //
  // Draws points from a Conway boolean grid
  // onto a canvas.
  //
  // @param canvas    [Canvas object]
  // @param grid      [Array[boolean]]
  // @param pixelSize [Int]
  self.conwayToCanvas = function(canvas, grid, pixelSize){
    let context, pixelsPerRow, x, y;

    context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    pixelsPerRow  = canvas.width / pixelSize;

    for (let pixel = 0; pixel < grid.length; pixel++) {
      if (grid[pixel]) {
        x = pixelSize*(pixel%pixelsPerRow);
        y = pixelSize*Math.floor(pixel/pixelsPerRow);
        context.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  return self;
})({});
