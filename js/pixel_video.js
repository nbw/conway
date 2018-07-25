// ** Pixel Video **
//
// Handles and video related details such as pixelation, threshold,
// removeFill, and also click callbacks.
//
let PixelVideo = function(video, canvas, frameRate, pixelSize){
  let self = this;

  const PIXEL_FILLED = 0;
  const PIXEL_EMPTY  = 255;

  let removeFill = true;
  let threshold  = 100;

  self.init = function(){
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function(constraints) {

        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }

    navigator.mediaDevices.getUserMedia({
      video: {
          width:     canvas.width,
          height:    canvas.height,
          frameRate: frameRate
        }
      }
    ).then(function(stream) {
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
        self.initVideoSettings();
      };
    }).catch(function(err) {
      self.showNoCameraModal();
    });

    video.addEventListener('play', function() {
      let context = canvas.getContext('2d');

      self.draw(this, canvas, context, frameRate);
    }, false);
  }

  self.pause = function() {
    video.pause();
    self.hideVideoSettings();
  }

  self.incrementThreshold = function() {
    if (threshold < 255) {
      threshold += 5;
    }
  }
  self.decrementThreshold = function() {
    if (threshold > 0) {
      threshold -= 5;
    }
  }

  self.toggleFill = function() {
    removeFill = !removeFill;
  }

  self.setPixelSize = function(size) {
    pixelSize = size;
  }

  self.pixelSize = function(size) {
    return pixelSize;
  }

  self.initVideoSettings = function() {
    document.getElementById("threshold-plus").addEventListener("click", function() {
      self.incrementThreshold();
    });

    document.getElementById("threshold-minus").addEventListener("click", function() {
      self.decrementThreshold();
    });

    document.getElementById("toggle-fill").addEventListener("click", function() {
      self.toggleFill();
    });

    let pixels = document.getElementById("pixels").getElementsByTagName("li");

    for(let i = 0;i< pixels.length;i++){
      pixels[i].addEventListener("click", function(e) {
        let pixel = e.currentTarget.getElementsByClassName("pixel")[0];
        let size = parseInt(pixel.getAttribute("val"));
        self.setPixelSize(size);
      });
    }

    self.showVideoSettings();
  }

  self.showVideoSettings = function() {
    document.getElementById('video-settings').classList.remove("hidden");
    document.getElementById('start').classList.remove("hidden");
  }

  self.hideVideoSettings = function() {
    document.getElementById('video-settings').classList.add("hidden");
    document.getElementById('start').classList.add("hidden");
  }

  self.showNoCameraModal = function() {
    document.getElementById('webcam-missing').classList.remove("hidden");
  }

  // ** Draw **
  //
  // Draws a video frame to a canvas
  self.draw = function(video, canvas, context, frameRate) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    self.pixelate(video, canvas, context, pixelSize);

    self.threshold(context, threshold, canvas.width, canvas.height);

    if(removeFill) {
      self.removeFill(context, canvas.width, canvas.height, pixelSize);
    }

    if(!video.paused) {
      setTimeout(self.draw, 1/frameRate, video, canvas, context, frameRate);
    }
  }

  // ** Pixelate **
  //
  // Pixelates an image by resizing the image to a smaller scale, then
  // making it bigger again.
  self.pixelate = function(image, canvas, context, pixelSize) {
    let wScaled, hScaled, scale;

    scale = 1/pixelSize;
    wScaled = canvas.width*scale;
    hScaled = canvas.height*scale;

    context.drawImage(image, 0, 0, wScaled, hScaled);
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.drawImage(canvas, 0, 0, wScaled, hScaled, 0, 0, canvas.width, canvas.height);
  }

  // ** Threshold **
  //
  // Converts a canvas image to black and white based on a threshold
  // pixel value.
  self.threshold = function(context, threshold, width, height) {
    let image, data, r, g, b, color;

    image = context.getImageData(0, 0, width, height);

    data = image.data;

    for (let i = 0; i< data.length; i = i+4) {
      r = data[i];
      g = data[i+1];
      b = data[i+2];

      if ((r + b + g) / 3 < threshold) {
        color = PIXEL_FILLED; // black
      } else {
        color = PIXEL_EMPTY; // white
      }

      data[i] = data[i+1] = data[i+2] = color;
    }

    image.data = data;

    context.putImageData(image, 0, 0);
  }

  // ** Remove Fill **
  //
  // Unfills any shapes for a wireframe effect.
  //
  // Works by checking filled pixels if neighbouring pixels above,
  // below, left, and right are also filled. If so, we can say that
  // the pixel is inside a "shape" and so it's rendered empty (white).
  self.removeFill = function(context, width, height, pixelSize) {
    let unfillPixel, data, dataRef, image, neighbourIndices;

    image = context.getImageData(0, 0, width, height);

    data = image.data;

    dataRef = data.slice();

    for (let i = 0; i < dataRef.length; i = i+4) {
      if(dataRef[i] == PIXEL_FILLED) {

        unfillPixel = true;

        neighbourIndices = [
          (i - 4*pixelSize),
          (i + 4*pixelSize),
          (i - 4*width*pixelSize),
          (i + 4*width*pixelSize)
        ];

        for (let p = 0; p < neighbourIndices.length; p++) {
          if ((neighbourIndices[p] < 0) || (neighbourIndices[p] >= dataRef.length)){
            continue;
          }

          if (dataRef[neighbourIndices[p]] == PIXEL_EMPTY) {
            unfillPixel = false;
            break;
          }
        }

        if(unfillPixel) {
          data[i] = data[i+1] = data[i+2] = PIXEL_EMPTY;
        }
      }
    }

    image.data = data;

    context.putImageData(image, 0, 0);
  }

};

